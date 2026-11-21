"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, CheckSquare, Square, Zap, Megaphone, Loader2, X } from "lucide-react";

const NoticesManager = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
    priority: "normal", // normal, urgent, highlight
  });

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        setEditingId(null);
        alert("Notice Updated! 📢");
      } else {
        await addDoc(collection(db, "notices"), {
          ...formData,
          createdAt: serverTimestamp(),
        });
        alert("New Notice Published! 🚀");
      }
      setFormData({ title: "", content: "", isActive: true, priority: "normal" });
    } catch (err) {
      alert("Error syncing notice.");
    }
  };

  const handleEdit = (n: any) => {
    setEditingId(n.id);
    setFormData({
      title: n.title,
      content: n.content,
      isActive: n.isActive ?? true,
      priority: n.priority ?? "normal",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "notices", id), { isActive: !current });
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Permanently remove this alert from the feed?")) {
      await deleteDoc(doc(db, "notices", id));
    }
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Global Alerts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Global Alerts & Updates</p>
          <h1 className="adm-title mt-1">Public Notices & News Strip</h1>
          <p className="adm-muted mt-1">
            Publish notices and scrolling alerts to the public website callboard and global ticker.
          </p>
        </div>
        <span className="adm-badge adm-badge-accent">
          {notices.filter((n) => n.isActive).length} Active / {notices.length} Total
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* --- NEWS DESK FORM --- */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="adm-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-adm-line pb-3">
              <h2 className="adm-h2 flex items-center gap-2">
                <Zap size={17} className="text-adm-accent-text" />
                <span>{editingId ? "Edit Alert" : "Create Alert"}</span>
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", content: "", isActive: true, priority: "normal" });
                  }}
                  className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm"
                  title="Cancel Edit"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div>
              <label className="adm-label">Header *</label>
              <input
                required
                type="text"
                placeholder="e.g. AUDITIONS"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="adm-input font-semibold"
              />
            </div>

            <div>
              <label className="adm-label">Message Body *</label>
              <textarea
                required
                placeholder="Forms open in 2 days..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="adm-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="adm-label">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="adm-input"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>

              <div>
                <label className="adm-label">Status</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className={`adm-btn w-full ${
                    formData.isActive ? "adm-btn-success" : "adm-btn-secondary"
                  }`}
                >
                  {formData.isActive ? <CheckSquare size={15} /> : <Square size={15} />}
                  <span>{formData.isActive ? "Live Now" : "Draft"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="adm-btn adm-btn-primary w-full">
                {editingId ? "Update News" : "Push to Feed"}
              </button>
            </div>
          </form>
        </div>

        {/* --- LIVE FEED LIST --- */}
        <div className="xl:col-span-2 space-y-3">
          {notices.length === 0 ? (
            <div className="adm-card p-12 text-center">
              <Megaphone size={36} className="mx-auto text-adm-fg-3 mb-2" />
              <p className="adm-h3">No Public Notices Yet</p>
              <p className="adm-muted mt-1">Create an alert on the left to publish to the public callboard.</p>
            </div>
          ) : (
            <AnimatePresence>
              {notices.map((n) => (
                <motion.div
                  layout
                  key={n.id}
                  className={`adm-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    !n.isActive ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span
                        className={`adm-badge uppercase ${
                          n.priority === "urgent"
                            ? "adm-badge-danger"
                            : n.priority === "highlight"
                            ? "adm-badge-accent"
                            : "adm-badge-neutral"
                        }`}
                      >
                        {n.priority}
                      </span>
                      <span className={`adm-badge ${n.isActive ? "adm-badge-success" : "adm-badge-neutral"}`}>
                        {n.isActive ? "Active" : "Paused"}
                      </span>
                      <h4 className="adm-h3">{n.title}</h4>
                    </div>
                    <p className="text-sm text-adm-fg-2 italic border-l-2 border-adm-accent pl-3 py-0.5">
                      "{n.content}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleActive(n.id, n.isActive)}
                      className={`adm-btn adm-btn-icon adm-btn-sm ${
                        n.isActive ? "adm-btn-success" : "adm-btn-secondary"
                      }`}
                      title={n.isActive ? "Deactivate" : "Activate"}
                    >
                      {n.isActive ? <CheckSquare size={15} /> : <Square size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(n)}
                      className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteNotice(n.id)}
                      className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticesManager;
