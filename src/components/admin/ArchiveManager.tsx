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
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { Plus, Trash2, Edit3, Film, Upload, Video, X, Filter, Loader2 } from "lucide-react";

export default function ArchiveManager() {
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    title: "",
    type: "stage",
    year: new Date().getFullYear().toString(),
    synopsis: "",
    trailerUrl: "",
    posterUrl: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const q = query(collection(db, "production_archive"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProductions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUploadPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body,
      });
      const resData = await res.json();
      if (resData.success) {
        setFormData((prev) => ({ ...prev, posterUrl: resData.data.url }));
        alert("Poster Uploaded! 🎬");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "production_archive", editingId), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        alert("Archive Production Updated! 🍿");
      } else {
        await addDoc(collection(db, "production_archive"), {
          ...formData,
          createdAt: Date.now(),
        });
        alert("Production Added to Public Archive! 🍿");
      }
      setIsCreating(false);
      setEditingId(null);
      setFormData(initialForm);
    } catch (err) {
      console.error(err);
      alert("Error saving production.");
    }
  };

  const handleEdit = (prod: any) => {
    setFormData({
      title: prod.title || "",
      type: prod.type || "stage",
      year: prod.year || "",
      synopsis: prod.synopsis || "",
      trailerUrl: prod.trailerUrl || "",
      posterUrl: prod.posterUrl || "",
    });
    setEditingId(prod.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Delete "${title}" from the public /archive?`)) {
      await deleteDoc(doc(db, "production_archive", id));
    }
  };

  const filtered =
    filterType === "all"
      ? productions
      : productions.filter((p) => p.type === filterType);

  return (
    <div className="space-y-6 text-left w-full">
      {/* Header */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Film size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">/archive Cinema Catalog</span>
          </div>
          <h1 className="adm-title">Production Archive</h1>
          <p className="adm-muted mt-1">
            Manage public past productions, trailers, posters & synopses displayed on the /archive page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isCreating) {
              setIsCreating(false);
              setEditingId(null);
              setFormData(initialForm);
            } else {
              setIsCreating(true);
            }
          }}
          className={`adm-btn w-full md:w-auto ${isCreating ? "adm-btn-secondary" : "adm-btn-primary"}`}
        >
          {isCreating ? <X size={16} /> : <Plus size={16} />}
          <span>{isCreating ? "Close Form" : "Add Production"}</span>
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="adm-card p-5 sm:p-7 space-y-5">
          <div className="border-b border-adm-line pb-3 flex items-center justify-between">
            <h2 className="adm-h2">
              {editingId ? "Edit Archive Title" : "New Archive Title"}
            </h2>
            <span className="adm-badge adm-badge-neutral font-mono">
              {editingId ? `ID: ${editingId}` : "Creating new record"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="adm-label">Production Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. COURT MARTIAL"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="adm-input font-semibold"
              />
            </div>

            <div>
              <label className="adm-label">Production Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="adm-input"
              >
                <option value="stage">Stage Play</option>
                <option value="nukkad">Nukkad Natak (Street)</option>
                <option value="shortfilm">Short Film / Visual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="adm-label">Release Year *</label>
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
              <label className="adm-label">Trailer / YouTube URL</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                className="adm-input"
              />
            </div>
          </div>

          <div>
            <label className="adm-label">Cinematic Synopsis *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell the premise, theme, and dramatic stakes of this production..."
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="adm-input"
            />
          </div>

          {/* Poster Image URL & Upload */}
          <div className="adm-panel p-4 space-y-3">
            <label className="adm-label mb-0">Poster Artwork (Image URL or File Upload)</label>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="url"
                placeholder="https://... or upload poster image"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                className="adm-input flex-1"
              />
              <label className="adm-btn adm-btn-secondary cursor-pointer shrink-0">
                <Upload size={14} />
                <span>{uploading ? "Uploading..." : "Upload Poster"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPoster}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-adm-line">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData(initialForm);
              }}
              className="adm-btn adm-btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="adm-btn adm-btn-primary">
              {editingId ? "Update Production" : "Save to Archive"}
            </button>
          </div>
        </form>
      )}

      {/* FILTER TABS */}
      <div className="adm-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto adm-scroll-x">
          <span className="text-xs font-semibold text-adm-fg-3 flex items-center gap-1.5 mr-1">
            <Filter size={13} /> Type:
          </span>
          {["all", "stage", "nukkad", "shortfilm"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              data-active={filterType === t ? "true" : "false"}
              className="adm-chip"
            >
              {t === "all" ? "All" : t === "stage" ? "Stage" : t === "nukkad" ? "Nukkad" : "Films"}
            </button>
          ))}
        </div>

        <span className="adm-badge adm-badge-neutral">
          {filtered.length} {filtered.length === 1 ? "Title" : "Titles"} in Archive
        </span>
      </div>

      {/* PRODUCTIONS GRID */}
      {loading ? (
        <div className="adm-card p-12 flex items-center justify-center gap-3">
          <Loader2 size={20} className="animate-spin text-adm-accent-text" />
          <span className="adm-muted">Opening Archive Vault...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="adm-card p-12 text-center">
          <Film size={40} className="mx-auto text-adm-fg-3 mb-3" />
          <h3 className="adm-h2">No Productions Found</h3>
          <p className="adm-muted mt-1">
            Click "Add Production" above to publish records to /archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="adm-card p-5 hover:border-adm-line-strong transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                {/* Poster Frame */}
                <div className="relative aspect-[16/10] w-full rounded-xl bg-adm-surface-2 border border-adm-line overflow-hidden mb-4">
                  {prod.posterUrl ? (
                    <img
                      src={prod.posterUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-adm-fg-3 text-xs font-medium">
                      <Film size={28} className="mb-1.5 text-adm-accent-text opacity-70" />
                      <span>No Poster Art</span>
                    </div>
                  )}

                  <span className="absolute top-2.5 right-2.5 adm-badge adm-badge-accent bg-adm-surface/90 backdrop-blur-xs">
                    {prod.year} • {prod.type}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-adm-fg leading-snug mb-2">
                  {prod.title}
                </h3>

                <p className="text-xs text-adm-fg-2 line-clamp-3 leading-relaxed adm-panel p-3">
                  {prod.synopsis || "No synopsis recorded."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-adm-line flex items-center justify-between">
                {prod.trailerUrl ? (
                  <a
                    href={prod.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="adm-btn adm-btn-secondary adm-btn-sm"
                  >
                    <Video size={13} className="text-adm-accent-text" />
                    <span>Trailer ↗</span>
                  </a>
                ) : (
                  <span className="text-xs text-adm-fg-3">No Trailer</span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleEdit(prod)}
                    className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                    title="Edit Production"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(prod.id, prod.title)}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                    title="Delete Production"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
