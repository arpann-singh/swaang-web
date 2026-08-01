"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Trash2, Edit2, UserPlus, Upload } from "lucide-react";

export default function AlumniManager() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    batch: "",
    role: "",
    company: "",
    photo: "",
    bio: "",
    category: "Legend" // Legend, President, Member
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "alumni"), orderBy("batch", "desc")), (snap) => {
      setAlumni(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=67f185db21d743a131bda4f8102ff94a`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm({ ...form, photo: data.data.url });
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "alumni", editingId), form);
      } else {
        await addDoc(collection(db, "alumni"), { ...form, createdAt: new Date() });
      }
      setForm({ name: "", batch: "", role: "", company: "", photo: "", bio: "", category: "Legend" });
      setEditingId(null);
    } catch (err) {
      alert("Error saving alumni");
    }
  };

  const handleEdit = (a: any) => {
    setForm(a);
    setEditingId(a.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this alumni record?")) {
      await deleteDoc(doc(db, "alumni", id));
    }
  };

  if (loading) return <div className="text-center p-10 font-black uppercase text-xl">Loading Alumni...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-brand-border rounded-2xl shadow-[4px_4px_0px_#FFD166]">
          <UserPlus size={32} className="text-[#FFD166]" />
        </div>
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Hall of Fame</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">Manage Alumni Network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card-primary)] border-4 border-[var(--border-primary)] p-6 md:p-8 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)] mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input required type="text" placeholder="Alumnus Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black" />
          <input required type="text" placeholder="Batch (e.g. 2018-2022)" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black" />
          <input required type="text" placeholder="Role in Swaang (e.g. President, Lead Actor)" value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black" />
          <input type="text" placeholder="Current Company / Status (Optional)" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black" />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] text-black appearance-none">
            <option value="Legend">Swaang Legend</option>
            <option value="President">Past President</option>
            <option value="Member">Notable Member</option>
          </select>
          
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="alumni-photo" />
            <label htmlFor="alumni-photo" className={`flex items-center justify-center gap-3 w-full border-2 border-dashed border-brand-border p-4 rounded-xl font-bold text-sm cursor-pointer hover:bg-gray-50 transition-colors text-black ${form.photo ? 'bg-green-50 border-green-500' : 'bg-gray-50'}`}>
              <Upload size={18} />
              {isUploading ? "Uploading..." : form.photo ? "Photo Uploaded!" : "Upload Profile Photo"}
            </label>
          </div>
        </div>

        <textarea required placeholder="Short Bio / Impact" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full h-32 bg-gray-50 border-2 border-brand-border p-4 rounded-xl font-bold text-sm outline-none focus:border-[#FF5F5F] resize-none mb-6 text-black" />

        <div className="flex gap-4">
          <button type="submit" disabled={isUploading} className="flex-1 bg-[#FFD166] text-brand-text py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all">
            {editingId ? "Update Alumnus" : "Add to Hall of Fame"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setForm({ name: "", batch: "", role: "", company: "", photo: "", bio: "", category: "Legend" }); setEditingId(null); }} className="px-6 bg-gray-100 text-brand-text py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none transition-all">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumni.map(a => (
          <div key={a.id} className="bg-[var(--card-primary)] border-4 border-[var(--border-primary)] rounded-[2rem] p-6 shadow-[6px_6px_0px_var(--border-primary)] relative overflow-hidden group flex flex-col">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button onClick={() => handleEdit(a)} className="p-2 bg-[#FFD166] text-black rounded-lg border-2 border-black hover:scale-110 transition-transform"><Edit2 size={14}/></button>
              <button onClick={() => handleDelete(a.id)} className="p-2 bg-[#FF5F5F] text-white rounded-lg border-2 border-black hover:scale-110 transition-transform"><Trash2 size={14}/></button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {a.photo ? (
                <img src={a.photo} alt={a.name} className="w-20 h-20 rounded-2xl border-4 border-black object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl border-4 border-black bg-gray-100 flex items-center justify-center text-3xl">🎓</div>
              )}
              <div>
                <h3 className="font-black text-xl uppercase leading-tight">{a.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5F5F]">{a.batch}</p>
                <span className="inline-block bg-[#06D6A0] text-black px-2 py-0.5 rounded text-[8px] font-black uppercase mt-1 border border-black">{a.category}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Role</p>
              <p className="font-black text-sm">{a.role}</p>
            </div>
            {a.company && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Now At</p>
                <p className="font-black text-sm">{a.company}</p>
              </div>
            )}

            <div className="mt-auto pt-4 border-t-2 border-black/10">
              <p className="text-xs font-bold opacity-80 italic line-clamp-3">"{a.bio}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
