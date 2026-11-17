"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, 
  query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { Plus, Trash2, Edit3, Film, Upload, Video, X, Filter } from "lucide-react";

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

  const filtered = filterType === "all" 
    ? productions 
    : productions.filter((p) => p.type === filterType);

  return (
    <div className="space-y-8 text-left pb-20 w-full">
      {/* Header */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#FF5F5F] text-white border-2 border-black shadow-[2px_2px_0px_black]">
              <Film size={20} />
            </span>
            <span className="font-mono font-black text-xs uppercase tracking-widest bg-black text-[#06D6A0] px-3 py-1 border-2 border-black">
              /archive CINEMA
            </span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Production Archive
          </h1>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-black/70 mt-2">
            Manage public past productions, trailers, posters & synopsis displayed on the /archive page.
          </p>
        </div>

        <button
          onClick={() => {
            if (isCreating) {
              setIsCreating(false);
              setEditingId(null);
              setFormData(initialForm);
            } else {
              setIsCreating(true);
            }
          }}
          className="w-full md:w-auto bg-[#06D6A0] text-black border-4 border-black px-6 py-4 font-black uppercase text-xs shadow-[6px_6px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isCreating ? <X size={16} /> : <Plus size={16} strokeWidth={3} />}
          <span>{isCreating ? "Close Form" : "Add Production"}</span>
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-6 font-mono text-xs"
        >
          <div className="border-b-4 border-black pb-3 flex items-center justify-between">
            <h2 className="font-black text-base uppercase tracking-tight text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FFD166] border border-black" />
              {editingId ? "Edit Archive Title" : "New Archive Title"}
            </h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase">
              {editingId ? `ID: ${editingId}` : "Creating new record"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block font-black uppercase text-black mb-1">Production Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. COURT MARTIAL"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-black text-sm uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-black mb-1">Production Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-bold text-xs uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
              >
                <option value="stage">Stage Play</option>
                <option value="nukkad">Nukkad Natak (Street)</option>
                <option value="shortfilm">Short Film / Visual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-black uppercase text-black mb-1">Release Year *</label>
              <input
                required
                type="text"
                placeholder="e.g. 2024"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-black uppercase text-black mb-1">Trailer / YouTube URL</label>
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-black uppercase text-black mb-1">Cinematic Synopsis *</label>
            <textarea
              required
              rows={3}
              placeholder="Tell the premise, theme, and dramatic stakes of this production..."
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all resize-none"
            />
          </div>

          {/* Poster Image URL & Upload */}
          <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_black] space-y-3">
            <label className="block font-black uppercase text-black tracking-wider">
              Poster Artwork (Image URL or File Upload)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="url"
                placeholder="https://... or upload poster image"
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                className="flex-1 w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
              />
              <label className="w-full sm:w-auto bg-[#FFD166] text-black border-2 border-black px-4 py-2.5 font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_black] hover:bg-black hover:text-[#FFD166] cursor-pointer transition-all shrink-0">
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

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData(initialForm);
              }}
              className="bg-white border-4 border-black px-6 py-3 font-black uppercase text-xs shadow-[3px_3px_0px_black] hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#06D6A0] text-black border-4 border-black px-8 py-3 font-black uppercase text-xs shadow-[4px_4px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              {editingId ? "Update Production" : "Save to Archive"}
            </button>
          </div>
        </form>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2 bg-white border-4 border-black p-1 shadow-[4px_4px_0px_black]">
          <span className="px-3 py-1 font-black uppercase text-black/50 flex items-center gap-1.5">
            <Filter size={12} /> TYPE:
          </span>
          {["all", "stage", "nukkad", "shortfilm"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 font-black uppercase transition-all ${
                filterType === t
                  ? "bg-black text-[#06D6A0]"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {t === "all" ? "All" : t === "stage" ? "Stage" : t === "nukkad" ? "Nukkad" : "Films"}
            </button>
          ))}
        </div>

        <span className="font-black text-black/60 uppercase">
          {filtered.length} {filtered.length === 1 ? "TITLE" : "TITLES"} IN ARCHIVE
        </span>
      </div>

      {/* PRODUCTIONS GRID */}
      {loading ? (
        <div className="p-12 font-mono font-black uppercase tracking-widest text-center animate-pulse">
          Opening Archive Vault...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-4 border-black p-12 text-center shadow-[8px_8px_0px_black] font-mono">
          <Film size={48} className="mx-auto text-black/30 mb-3" />
          <h3 className="font-black uppercase text-xl text-black">NO PRODUCTIONS FOUND</h3>
          <p className="text-xs text-gray-500 uppercase mt-1">
            Click "Add Production" above to publish records to /archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border-4 border-black p-5 shadow-[6px_6px_0px_black] hover:shadow-[10px_10px_0px_#06D6A0] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Poster Frame */}
                <div className="relative aspect-[16/10] w-full bg-black border-2 border-black overflow-hidden mb-4 shadow-[3px_3px_0px_black]">
                  {prod.posterUrl ? (
                    <img
                      src={prod.posterUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#2D2D2D] flex flex-col items-center justify-center p-4 text-center text-white/50 font-black text-xs uppercase">
                      <Film size={32} className="mb-2 text-[#FFD166]" />
                      NO POSTER ART
                    </div>
                  )}

                  <span className="absolute top-2 right-2 bg-[#FFD166] text-black px-2 py-0.5 font-black text-[9px] uppercase border border-black shadow-[2px_2px_0px_black]">
                    {prod.year} • {prod.type}
                  </span>
                </div>

                <h3 className="text-2xl font-black uppercase tracking-tight text-black leading-tight mb-2 group-hover:text-[#FF5F5F] transition-colors">
                  {prod.title}
                </h3>

                <p className="text-xs font-bold text-black/75 line-clamp-3 mb-4 leading-relaxed bg-[#FFF9F0] border border-black p-2.5">
                  {prod.synopsis || "No synopsis recorded."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t-2 border-dashed border-black flex items-center justify-between text-xs">
                {prod.trailerUrl ? (
                  <a
                    href={prod.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-black text-[#06D6A0] bg-black px-2 py-1 text-[10px] hover:bg-[#FF5F5F] hover:text-white transition-all"
                  >
                    <Video size={12} />
                    TRAILER ↗
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold uppercase">NO TRAILER</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(prod)}
                    className="p-2 border-2 border-black bg-white hover:bg-[#FFD166] shadow-[2px_2px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    title="Edit Production"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id, prod.title)}
                    className="p-2 border-2 border-black bg-white hover:bg-[#FF5F5F] hover:text-white shadow-[2px_2px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
