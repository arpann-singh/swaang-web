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
import { Pencil, Home, Trash2, X, Check, Images, Upload } from "lucide-react";

const GalleryManager = () => {
  const [gallery, setGallery] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<any | null>(null);

  const [newPhoto, setNewPhoto] = useState({
    title: "",
    description: "",
    showOnHome: false,
  });

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "098e6a70fbe6f7594e40f4641a1998b0";

  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setGallery(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleBulkUpload = async (e: any) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files as File[]) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          await addDoc(collection(db, "gallery"), {
            url: data.data.url,
            title: newPhoto.title || `Archive ${new Date().toLocaleDateString()}`,
            description: newPhoto.description || "Awaiting admin curation.",
            showOnHome: newPhoto.showOnHome,
            status: "Pending Curation",
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("Bulk item failed:", error);
      }
    }

    setUploading(false);
    setNewPhoto({ title: "", description: "", showOnHome: false });
    alert("Bulk Staging Complete! 🎞️");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    try {
      await updateDoc(doc(db, "gallery", editingPhoto.id), {
        title: editingPhoto.title,
        description: editingPhoto.description,
        status: "Curated",
      });
      setEditingPhoto(null);
    } catch (err) {
      alert("Update failed.");
    }
  };

  const toggleHomeVisibility = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "gallery", id), { showOnHome: !current });
  };

  const handleDelete = async (id: string) => {
    if (confirm("REMOVE FROM ARCHIVES? THIS CANNOT BE UNDONE.")) {
      await deleteDoc(doc(db, "gallery", id));
    }
  };

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text shrink-0">
            <Images size={20} />
          </div>
          <div>
            <p className="adm-eyebrow">Visual Archive & Media</p>
            <h2 className="adm-title mt-0.5">The Gallery</h2>
          </div>
        </div>
        <span className="adm-badge adm-badge-neutral">{gallery.length} Photos</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-1">
          {/* 🔥 DYNAMIC FORM: SWITCHES BETWEEN UPLOAD AND EDIT */}
          {!editingPhoto ? (
            <div className="adm-card p-5 sm:p-6 space-y-4">
              <div className="border-b border-adm-line pb-3">
                <span className="adm-badge adm-badge-success mb-1">Bulk Upload (Crew)</span>
                <h3 className="adm-h2">Stage Multiple Photos</h3>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="adm-label">General Title (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Samvid 2026 Rehearsals"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    className="adm-input"
                  />
                </div>

                <div>
                  <label className="adm-label">General Description</label>
                  <textarea
                    placeholder="General Description"
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                    className="adm-input"
                  />
                </div>
              </div>

              <label className="adm-panel p-3.5 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPhoto.showOnHome}
                  onChange={(e) => setNewPhoto({ ...newPhoto, showOnHome: e.target.checked })}
                  className="adm-check"
                />
                <span className="text-sm font-medium text-adm-fg">Show on Homepage</span>
              </label>

              <label
                className={`adm-btn adm-btn-primary w-full cursor-pointer ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Upload size={15} />
                <span>{uploading ? "Processing Bulk..." : "Select Multiple Photos"}</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleBulkUpload}
                />
              </label>
            </div>
          ) : (
            <motion.div
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="adm-card p-5 sm:p-6 space-y-4"
            >
              <div className="border-b border-adm-line pb-3">
                <span className="adm-badge adm-badge-accent mb-1">Curate Archive</span>
                <h3 className="adm-h2">Edit Photo Metadata</h3>
              </div>

              <div className="aspect-video rounded-xl border border-adm-line bg-adm-surface-2 overflow-hidden">
                <img src={editingPhoto.url} className="w-full h-full object-cover" alt="Preview" />
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="adm-label">Photo Title *</label>
                  <input
                    required
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, title: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label">Description</label>
                  <textarea
                    value={editingPhoto.description}
                    onChange={(e) =>
                      setEditingPhoto({ ...editingPhoto, description: e.target.value })
                    }
                    className="adm-input"
                  />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="adm-btn adm-btn-primary flex-1"
                >
                  <Check size={15} />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="adm-btn adm-btn-secondary flex-1"
                >
                  <X size={15} />
                  <span>Abort</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {gallery.map((img) => (
              <motion.div
                layout
                key={img.id}
                className="adm-card overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative aspect-video border-b border-adm-line bg-adm-surface-2">
                  <img
                    src={img.url}
                    className="w-full h-full object-cover"
                    alt={img.title}
                  />

                  <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingPhoto(img)}
                      className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm bg-adm-surface/90 backdrop-blur-xs"
                      title="Edit Data"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleHomeVisibility(img.id, img.showOnHome)}
                      className={`adm-btn adm-btn-icon adm-btn-sm ${
                        img.showOnHome
                          ? "adm-btn-primary"
                          : "adm-btn-secondary bg-adm-surface/90 backdrop-blur-xs"
                      }`}
                      title="Toggle Homepage"
                    >
                      <Home size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm bg-adm-surface/90 backdrop-blur-xs"
                      title="Delete Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {img.status === "Pending Curation" && (
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="adm-badge adm-badge-danger bg-adm-surface/90 backdrop-blur-xs">
                        Needs Title
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-adm-fg line-clamp-1">
                      {img.title}
                    </h3>
                    {img.showOnHome && (
                      <span className="adm-badge adm-badge-accent text-[10px]">Homepage</span>
                    )}
                  </div>
                  <p className="text-xs text-adm-fg-3 mt-1 line-clamp-2 leading-relaxed">
                    {img.description || "No description provided"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;