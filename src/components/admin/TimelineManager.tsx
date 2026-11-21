"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  Camera,
  Tag,
  Star,
  Film,
  GraduationCap,
  Archive,
  X,
  Loader2,
} from "lucide-react";

export default function TimelineManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const categories = [
    { id: "milestone", label: "Milestone", icon: Star, badge: "adm-badge-accent" },
    { id: "play", label: "Production/Play", icon: Film, badge: "adm-badge-danger" },
    { id: "workshop", label: "Workshop", icon: GraduationCap, badge: "adm-badge-success" },
    { id: "achievement", label: "Achievement", icon: Archive, badge: "adm-badge-violet" },
  ];

  const initialForm = {
    year: new Date().getFullYear().toString(),
    date: "",
    event: "",
    description: "",
    photo1: "",
    photo2: "",
    category: "milestone",
  };

  const [formData, setFormData] = useState<any>(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photo1" | "photo2"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) setFormData((prev: any) => ({ ...prev, [field]: json.data.url }));
    } catch (err) {
      alert("Upload error.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "timeline", editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "timeline"), { ...formData, createdAt: Date.now() });
      }
      setIsFormOpen(false);
      setFormData(initialForm);
      setEditingId(null);
      alert("Legacy Updated! 🏛️");
    } catch (err) {
      alert("Save error.");
    }
  };

  const openForm = (ev: any = initialForm) => {
    setFormData(ev);
    setEditingId(ev.id || null);
    setIsFormOpen(true);
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Opening Timeline Chronicle...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      {/* HEADER */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Curate Swaang's Historical Timeline</p>
          <h2 className="adm-title mt-1">Chronicle (Timeline & Journey)</h2>
          <p className="adm-muted mt-1">
            Milestones published here power both the homepage 3-card Journey Glimpse and the full /journey archive.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="adm-btn adm-btn-primary w-full md:w-auto"
        >
          <Plus size={16} />
          <span>Add Chronicle</span>
        </button>
      </div>

      {/* FULL WIDTH GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events.map((ev) => {
          const catObj = categories.find((c) => c.id === ev.category) || categories[0];
          const CatIcon = catObj.icon;
          return (
            <div key={ev.id} className="adm-card overflow-hidden flex flex-col group">
              {/* Card Header Images */}
              <div className="h-44 bg-adm-surface-2 relative flex border-b border-adm-line">
                {ev.photo1 ? (
                  <div className="flex-1 h-full border-r border-adm-line">
                    <img
                      src={ev.photo1}
                      className="w-full h-full object-cover"
                      alt="Memory 1"
                    />
                  </div>
                ) : null}
                {ev.photo2 ? (
                  <div className="flex-1 h-full">
                    <img
                      src={ev.photo2}
                      className="w-full h-full object-cover"
                      alt="Memory 2"
                    />
                  </div>
                ) : null}
                {!ev.photo1 && !ev.photo2 && (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="font-display font-bold text-3xl text-adm-fg-3">
                      {ev.year}
                    </span>
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`adm-badge ${catObj.badge} bg-adm-surface/90 backdrop-blur-xs`}>
                    <CatIcon size={12} />
                    <span>{catObj.label}</span>
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="adm-badge adm-badge-accent font-mono">{ev.year}</span>
                  {ev.date && (
                    <span className="text-xs text-adm-fg-3">{ev.date}</span>
                  )}
                </div>
                <h4 className="font-display font-bold text-lg text-adm-fg leading-snug mb-2">
                  {ev.event}
                </h4>
                <p className="text-xs text-adm-fg-2 line-clamp-3 mb-4 flex-1">
                  {ev.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-adm-line">
                  <button
                    type="button"
                    onClick={() => openForm(ev)}
                    className="adm-btn adm-btn-secondary adm-btn-sm flex-1"
                  >
                    <Edit3 size={13} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm("Erase this event?"))
                        await deleteDoc(doc(db, "timeline", ev.id));
                    }}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🎬 CINEMATIC OVERLAY FORM */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 12, opacity: 0 }}
              className="adm-card w-full max-w-2xl relative z-10 my-auto p-6 sm:p-8"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-5 max-h-[82vh] overflow-y-auto pr-1"
              >
                <div className="flex items-center justify-between border-b border-adm-line pb-4">
                  <h3 className="adm-title text-2xl">
                    {editingId ? "Edit Chronicle" : "New Chronicle Entry"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="adm-label flex items-center gap-1.5">
                    <Tag size={13} />
                    <span>Event Category</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {categories.map((cat) => {
                      const CatIcon = cat.icon;
                      const active = formData.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${
                            active
                              ? "bg-adm-accent/15 border-adm-accent text-adm-fg font-semibold"
                              : "bg-adm-surface-2 border-adm-line text-adm-fg-2 hover:text-adm-fg"
                          }`}
                        >
                          <CatIcon size={18} className={active ? "text-adm-accent-text" : ""} />
                          <span className="text-xs text-center">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="adm-label">Legacy Year (Required) *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="adm-input"
                    />
                  </div>
                  <div>
                    <label className="adm-label">Specific Date (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 15th August"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="adm-input"
                    />
                  </div>
                </div>

                {/* Event Info */}
                <div>
                  <label className="adm-label">Event Title (Required) *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Samvid 2024 Launch"
                    value={formData.event}
                    onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    className="adm-input font-semibold"
                  />
                </div>

                <div>
                  <label className="adm-label">Story / Description (Required) *</label>
                  <textarea
                    required
                    placeholder="Describe the milestone..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="adm-input"
                  />
                </div>

                {/* Media Uploads */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="adm-label">Memory 01 (Cover)</label>
                    <label className="block aspect-video adm-panel overflow-hidden cursor-pointer relative group">
                      {formData.photo1 ? (
                        <img
                          src={formData.photo1}
                          className="w-full h-full object-cover"
                          alt="Memory 1"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-adm-fg-3">
                          <Camera size={24} />
                          <span className="text-xs font-medium mt-1.5">Upload Photo 1</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "photo1")}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="adm-label">Memory 02 (Supporting)</label>
                    <label className="block aspect-video adm-panel overflow-hidden cursor-pointer relative group">
                      {formData.photo2 ? (
                        <img
                          src={formData.photo2}
                          className="w-full h-full object-cover"
                          alt="Memory 2"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-adm-fg-3">
                          <Camera size={24} />
                          <span className="text-xs font-medium mt-1.5">Upload Photo 2</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "photo2")}
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-adm-line flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="adm-btn adm-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="adm-btn adm-btn-primary"
                  >
                    {uploading
                      ? "Uploading Media..."
                      : editingId
                      ? "Update History"
                      : "Publish to Chronicle"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}