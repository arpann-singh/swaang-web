"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Camera, History, Tag, Star, Film, GraduationCap, Archive } from "lucide-react";

export default function TimelineManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🔥 Categories Config: Icons & Colors for the tags
  const categories = [
    { id: 'milestone', label: 'Milestone', icon: Star, color: 'bg-[#FFD166]' },
    { id: 'play', label: 'Production/Play', icon: Film, color: 'bg-[#FF5F5F]' },
    { id: 'workshop', label: 'Workshop', icon: GraduationCap, color: 'bg-[#06D6A0]' },
    { id: 'achievement', label: 'Achievement', icon: Archive, color: 'bg-[#2D2D2D] text-white' }
  ];

  const initialForm = {
    year: new Date().getFullYear().toString(),
    date: "",
    event: "",
    description: "",
    photo1: "",
    photo2: "",
    category: "milestone" 
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0";

  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'photo1' | 'photo2') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST", body: data,
      });
      const json = await res.json();
      if (json.success) setFormData(prev => ({ ...prev, [field]: json.data.url }));
    } catch (err) { alert("Upload error."); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "timeline", editingId), { ...formData, updatedAt: serverTimestamp() });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "timeline"), { ...formData, createdAt: Date.now() });
      }
      setFormData(initialForm);
      alert("Legacy Updated! 🏛️");
    } catch (err) { alert("Save error."); }
  };

  if (loading) return <div className="p-10 font-black opacity-20">Opening Archives...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#FFF9F0] min-h-screen text-left">
      <div className="mb-12 border-b-8 border-[#2D2D2D] pb-6">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#2D2D2D]">Chronicle Manager</h2>
        <p className="font-black uppercase tracking-[0.3em] text-[#FF5F5F] text-[10px] mt-2 italic">Curate Swaang's Historical Timeline</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        {/* --- ADD/EDIT FORM --- */}
        <div className="xl:col-span-5">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[12px_12px_0px_#2D2D2D] space-y-6 sticky top-10">
            
            {/* Category Dropdown */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase opacity-40 ml-2 flex items-center gap-1">
                <Tag size={10} /> Event Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({...formData, category: cat.id})}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 border-black transition-all ${
                      formData.category === cat.id ? `${cat.color} -translate-y-1 shadow-[4px_4px_0px_black]` : 'bg-gray-50 opacity-50'
                    }`}
                  >
                    <cat.icon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-dashed border-black/5">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Legacy Year</label>
                <input required type="text" placeholder="e.g. 2024" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase opacity-40 ml-2">Specific Date</label>
                <input type="text" placeholder="e.g. 15th Aug" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase opacity-40 ml-2">Event Title</label>
              <input required type="text" placeholder="e.g. Samvid 2024 Launch" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase opacity-40 ml-2">Story/Content</label>
              <textarea required placeholder="Describe the milestone..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold h-32 resize-none text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase opacity-40 ml-2">Memory 01</p>
                <label className="block aspect-video bg-gray-100 border-4 border-dashed border-[#2D2D2D]/10 rounded-2xl overflow-hidden cursor-pointer">
                  {formData.photo1 ? <img src={formData.photo1} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Camera /></div>}
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'photo1')} />
                </label>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase opacity-40 ml-2">Memory 02</p>
                <label className="block aspect-video bg-gray-100 border-4 border-dashed border-[#2D2D2D]/10 rounded-2xl overflow-hidden cursor-pointer">
                  {formData.photo2 ? <img src={formData.photo2} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><Camera /></div>}
                  <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'photo2')} />
                </label>
              </div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-[#2D2D2D] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#FF5F5F] hover:translate-y-1 transition-all">
              {editingId ? "Update History" : "Add to Chronicle"}
            </button>
          </form>
        </div>

        {/* --- LIST VIEW --- */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-2 bg-[#FFD166] rounded-full" />
            <h3 className="text-2xl font-black uppercase tracking-tighter italic">Live Archives</h3>
          </div>

          <div className="space-y-4">
            {events.map((ev) => {
              const catObj = categories.find(c => c.id === ev.category) || categories[0];
              return (
                <div key={ev.id} className="bg-white border-4 border-[#2D2D2D] p-5 rounded-3xl shadow-[6px_6px_0px_#2D2D2D] flex items-center gap-6 group">
                  <div className="w-20 h-20 rounded-2xl bg-[#2D2D2D] shrink-0 overflow-hidden flex items-center justify-center border-2 border-black relative">
                     {ev.photo1 ? <img src={ev.photo1} className="w-full h-full object-cover opacity-80" /> : <span className="text-white/20 font-black italic">{ev.year}</span>}
                     <div className={`absolute top-0 left-0 p-1 ${catObj.color} rounded-br-lg border-r-2 border-b-2 border-black`}>
                       <catObj.icon size={8} />
                     </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-black px-2 py-0.5 bg-[#FF5F5F] text-white rounded shadow-[2px_2px_0px_black]">{ev.year}</span>
                      <h4 className="font-black uppercase text-sm truncate">{ev.event}</h4>
                    </div>
                    <p className="text-[9px] font-black opacity-30 mt-1 uppercase tracking-widest">{catObj.label}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => { setEditingId(ev.id); setFormData(ev); window.scrollTo({top: 0, behavior: 'smooth'}) }} className="p-3 border-2 border-black rounded-xl hover:bg-[#FFD166] transition-colors"><Edit3 size={16} /></button>
                     <button onClick={async () => { if(confirm('Erase this event?')) await deleteDoc(doc(db, "timeline", ev.id)) }} className="p-3 border-2 border-red-500 rounded-xl hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}