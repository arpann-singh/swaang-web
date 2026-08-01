"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Edit3, Film } from "lucide-react";

export default function ArchiveManager() {
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: "", type: "stage", year: "", synopsis: "", trailerUrl: "", posterUrl: "" });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "production_archive"), (snap) => {
      setProductions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "production_archive"), formData);
    setIsCreating(false);
    setFormData({ title: "", type: "stage", year: "", synopsis: "", trailerUrl: "", posterUrl: "" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this production from the archive?")) {
      await deleteDoc(doc(db, "production_archive", id));
    }
  };

  return (
    <div className="bg-white border-4 border-[var(--border-primary)] rounded-[2rem] p-8 shadow-[8px_8px_0px_var(--border-primary)]">
      <div className="flex justify-between items-center mb-8 border-b-4 border-[var(--border-primary)] pb-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-primary)] flex items-center gap-3">
            <Film className="w-10 h-10 text-[#FF5F5F]" /> Netflix-Style Archive
          </h2>
          <p className="font-bold uppercase text-xs text-gray-500 tracking-widest mt-1">Manage past productions, trailers, and posters</p>
        </div>
        <button onClick={() => setIsCreating(!isCreating)} className="bg-[#06D6A0] text-[var(--text-primary)] px-6 py-3 border-4 border-[var(--border-primary)] rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_var(--border-primary)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Plus size={18} strokeWidth={3} /> Add Production
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleAdd} className="mb-8 p-6 bg-gray-50 border-4 border-[var(--border-primary)] rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required type="text" placeholder="Movie / Play Title" className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold uppercase text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <select className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold uppercase text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
            <option value="stage">Stage Play</option>
            <option value="nukkad">Nukkad Natak</option>
            <option value="shortfilm">Short Film</option>
          </select>
          <input required type="text" placeholder="Release Year" className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold uppercase text-sm" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
          <input type="url" placeholder="Poster Image URL" className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold uppercase text-sm" value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} />
          <input type="url" placeholder="Trailer / YouTube URL" className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold uppercase text-sm md:col-span-2" value={formData.trailerUrl} onChange={e => setFormData({...formData, trailerUrl: e.target.value})} />
          <textarea required placeholder="Cinematic Synopsis..." className="border-4 border-[var(--border-primary)] rounded-xl p-3 font-bold text-sm md:col-span-2 h-24" value={formData.synopsis} onChange={e => setFormData({...formData, synopsis: e.target.value})} />
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="bg-[#FFD166] text-[var(--text-primary)] px-8 py-3 border-4 border-[var(--border-primary)] rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_var(--border-primary)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Save to Archive
            </button>
          </div>
        </form>
      )}

      {loading ? <p className="font-bold uppercase animate-pulse">Loading Archives...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {productions.map(prod => (
            <div key={prod.id} className="flex gap-4 p-4 border-4 border-[var(--border-primary)] rounded-2xl shadow-[4px_4px_0px_var(--border-primary)] bg-white group">
              <div className="w-24 h-36 shrink-0 bg-gray-200 border-2 border-[var(--border-primary)] rounded-lg overflow-hidden">
                {prod.posterUrl ? <img src={prod.posterUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full flex items-center justify-center font-black text-xs opacity-30 text-center">{prod.type}</div>}
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-black uppercase text-xl leading-none">{prod.title}</h3>
                <p className="text-[10px] font-black tracking-widest text-[#FF5F5F] uppercase mb-2">{prod.year} • {prod.type}</p>
                <p className="text-xs font-medium line-clamp-2 opacity-70 mb-auto">{prod.synopsis}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleDelete(prod.id)} className="p-2 border-2 border-[var(--border-primary)] rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={16} strokeWidth={3} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
