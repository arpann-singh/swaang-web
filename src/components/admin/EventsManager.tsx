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
import { Plus, Search, Star, Edit3, Trash2, X, Upload, Ticket, Loader2 } from "lucide-react";

const EventsManager = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const initialForm = {
    title: "",
    description: "",
    image: "",
    playbillUrl: "",
    teaserUrl: "",
    fullVideoUrl: "",
    status: "Upcoming",
    date: "",
    time: "18:00",
    showOnHome: false,
    isRsvpEnabled: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredEvents = events.filter(
    (ev) =>
      ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (json.success) {
        setFormData((prev) => ({ ...prev, image: json.data.url }));
        alert("Poster Uploaded! 📸");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload a poster!");
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "events"), {
          ...formData,
          isSpotlight: false,
          createdAt: serverTimestamp(),
        });
      }
      setFormData(initialForm);
      setIsFormOpen(false);
      alert("Archive Updated! 🎭");
    } catch (err) {
      alert("Error saving.");
    }
  };

  const handleEdit = (ev: any) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title || "",
      description: ev.description || "",
      image: ev.image || "",
      playbillUrl: ev.playbillUrl || "",
      teaserUrl: ev.teaserUrl || "",
      fullVideoUrl: ev.fullVideoUrl || "",
      status: ev.status || "Upcoming",
      date: ev.date || "",
      time: ev.time || "18:00",
      showOnHome: ev.showOnHome || false,
      isRsvpEnabled: ev.isRsvpEnabled || false,
    });
    setIsFormOpen(true);
  };

  const toggleSpotlight = async (id: string, current: boolean) => {
    if (!current) {
      for (const ev of events) {
        if (ev.isSpotlight) await updateDoc(doc(db, "events", ev.id), { isSpotlight: false });
      }
    }
    await updateDoc(doc(db, "events", id), { isSpotlight: !current });
  };

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Opening Playbill Desk...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Manage the Stage Legacy</p>
          <h1 className="adm-title mt-1">Playbill Desk (Showtimes & Events)</h1>
          <p className="adm-muted mt-1">
            Register upcoming shows, manage playbills, teasers, full production videos, and enable audience RSVPs.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="w-full sm:w-72 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Play Title or Status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="adm-input pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(initialForm);
              setIsFormOpen(true);
            }}
            className="adm-btn adm-btn-primary"
          >
            <Plus size={16} />
            <span>Register Play</span>
          </button>
        </div>
      </div>

      {/* FULL WIDTH LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className={`adm-card p-5 flex flex-col justify-between gap-4 transition-all ${
              ev.isSpotlight ? "border-adm-accent" : ""
            }`}
          >
            <div className="flex items-start gap-4">
              {ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-20 h-28 object-cover rounded-xl border border-adm-line shrink-0"
                />
              ) : (
                <div className="w-20 h-28 rounded-xl border border-adm-line bg-adm-surface-2 flex items-center justify-center text-adm-fg-3 shrink-0">
                  <Ticket size={22} />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className="font-display font-bold text-xl text-adm-fg leading-snug line-clamp-2">
                  {ev.title}
                </h3>
                <p className="text-xs font-mono text-adm-accent-text mt-1">
                  {ev.date} {ev.time}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span
                    className={`adm-badge ${
                      ev.status === "Upcoming" ? "adm-badge-success" : "adm-badge-neutral"
                    }`}
                  >
                    {ev.status}
                  </span>
                  {ev.fullVideoUrl && (
                    <span className="adm-badge adm-badge-danger">Full Show</span>
                  )}
                  {ev.showOnHome && (
                    <span className="adm-badge adm-badge-accent">★ Home</span>
                  )}
                  {ev.isRsvpEnabled && (
                    <span className="adm-badge adm-badge-info">RSVP On</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-adm-line">
              <button
                type="button"
                onClick={() => toggleSpotlight(ev.id, ev.isSpotlight)}
                className={`adm-btn adm-btn-sm text-xs ${
                  ev.isSpotlight ? "adm-btn-primary" : "adm-btn-secondary"
                }`}
              >
                <Star size={12} />
                <span>Spotlight</span>
              </button>
              <button
                type="button"
                onClick={() => handleEdit(ev)}
                className="adm-btn adm-btn-secondary adm-btn-sm text-xs"
              >
                <Edit3 size={12} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this event?")) deleteDoc(doc(db, "events", ev.id));
                }}
                className="adm-btn adm-btn-danger adm-btn-sm text-xs"
              >
                <Trash2 size={12} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="adm-card p-12 text-center">
          <Ticket size={36} className="mx-auto text-adm-fg-3 mb-2" />
          <p className="adm-h3">No Plays Found Matching "{searchTerm}"</p>
        </div>
      )}

      {/* OVERLAY MODAL FORM */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div
              initial={{ y: 20, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.97, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl adm-card p-6 sm:p-8 my-auto"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6 text-left max-h-[82vh] overflow-y-auto pr-1"
              >
                <div className="flex items-start justify-between border-b border-adm-line pb-4">
                  <div>
                    <p className="adm-eyebrow">Swaang Production Dossier</p>
                    <h2 className="adm-title mt-0.5">
                      {editingId ? "Edit Play" : "Register Play"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* 1. Basic Details */}
                <div className="space-y-4">
                  <div>
                    <label className="adm-label">Play Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. MEDISYN"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="adm-input font-semibold text-base"
                    />
                  </div>

                  <div>
                    <label className="adm-label">Synopsis *</label>
                    <textarea
                      required
                      placeholder="A brief description of the play..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="adm-input"
                    />
                  </div>
                </div>

                {/* 2. Media Assets */}
                <div className="adm-panel p-4 sm:p-5 space-y-4">
                  <h3 className="adm-h3">Media & Assets</h3>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-24 h-32 rounded-xl bg-adm-surface border border-adm-line overflow-hidden shrink-0 flex items-center justify-center">
                      {formData.image ? (
                        <img src={formData.image} className="w-full h-full object-cover" alt="Poster" />
                      ) : (
                        <span className="text-xs text-adm-fg-3 text-center p-2">No Poster</span>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="adm-btn adm-btn-secondary w-full cursor-pointer">
                        <Upload size={15} />
                        <span>{uploading ? "Uploading..." : "Upload Master Poster"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste poster image URL..."
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="adm-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-adm-line">
                    <div>
                      <label className="adm-label">Playbill (PDF / Google Drive Link)</label>
                      <input
                        type="text"
                        placeholder="https://drive.google.com/..."
                        value={formData.playbillUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, playbillUrl: e.target.value })
                        }
                        className="adm-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="adm-label">Teaser Trailer (YouTube Link)</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/..."
                        value={formData.teaserUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, teaserUrl: e.target.value })
                        }
                        className="adm-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="adm-label">Full Production Video (YouTube)</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/..."
                        value={formData.fullVideoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, fullVideoUrl: e.target.value })
                        }
                        className="adm-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Scheduling & Visibility */}
                <div className="space-y-4">
                  <h3 className="adm-h3">Scheduling & Ticketing</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="adm-label">Date *</label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="adm-input"
                      />
                    </div>
                    <div>
                      <label className="adm-label">Time *</label>
                      <input
                        required
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="adm-input"
                      />
                    </div>
                    <div>
                      <label className="adm-label">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="adm-input"
                      >
                        <option value="Upcoming">Status: UPCOMING</option>
                        <option value="Completed">Status: COMPLETED</option>
                        <option value="Postponed">Status: POSTPONED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <label className="adm-panel p-3.5 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-adm-fg">Show on Homepage</span>
                      <input
                        type="checkbox"
                        checked={formData.showOnHome}
                        onChange={(e) =>
                          setFormData({ ...formData, showOnHome: e.target.checked })
                        }
                        className="adm-check"
                      />
                    </label>
                    <label className="adm-panel p-3.5 flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-semibold text-adm-fg">
                        Enable RSVPs / Ticketing
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.isRsvpEnabled}
                        onChange={(e) =>
                          setFormData({ ...formData, isRsvpEnabled: e.target.checked })
                        }
                        className="adm-check"
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
                    {editingId ? "Save Changes" : "Publish Play"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsManager;