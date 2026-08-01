"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, serverTimestamp, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit3, Camera, History, Tag, Star, Film, GraduationCap, Archive, X } from "lucide-react";

export default function TimelineManager() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const [formData, setFormData] = useState<any>(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

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
      if (json.success) setFormData((prev: any) => ({ ...prev, [field]: json.data.url }));
    } catch (err) { alert("Upload error."); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "timeline", editingId), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "timeline"), { ...formData, createdAt: Date.now() });
      }
      setIsFormOpen(false);
      setFormData(initialForm);
      setEditingId(null);
      alert("Legacy Updated! 🏛️");
    } catch (err) { alert("Save error."); }
  };

  const openForm = (ev: any = initialForm) => {
    setFormData(ev);
    setEditingId(ev.id || null);
    setIsFormOpen(true);
  };

  if (loading) return <div className="p-10 font-black opacity-20 uppercase tracking-widest text-center">Opening Archives...</div>;

  return (
    <div className="p-4 md:p-8 bg-[var(--bg-primary)] min-h-screen text-left">
      
      {/* HEADER */}
      <div className="mb-12 border-b-8 border-[var(--border-primary)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Chronicle</h2>
          <p className="font-black uppercase tracking-[0.4em] text-[#FF5F5F] text-[10px] md:text-xs mt-2">Curate Swaang's Historical Timeline</p>
        </div>
        <button 
          onClick={() => openForm()} 
          className="w-full md:w-auto bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all active:scale-95"
        >
          <Plus strokeWidth={3} /> Add Chronicle
        </button>
      </div>

      {/* FULL WIDTH GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {events.map((ev) => {
          const catObj = categories.find(c => c.id === ev.category) || categories[0];
          return (
            <div key={ev.id} className="bg-white border-4 border-[var(--border-primary)] rounded-[2.5rem] shadow-[8px_8px_0px_var(--border-primary)] overflow-hidden flex flex-col group hover:translate-y-[-4px] transition-transform">
              
              {/* Card Header Images */}
              <div className="h-48 bg-[#2D2D2D] relative flex border-b-4 border-[var(--border-primary)]">
                {ev.photo1 ? (
                  <div className="flex-1 h-full border-r-2 border-[var(--border-primary)]">
                    <img src={ev.photo1} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Memory 1" />
                  </div>
                ) : null}
                {ev.photo2 ? (
                  <div className="flex-1 h-full border-l-2 border-[var(--border-primary)]">
                    <img src={ev.photo2} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" alt="Memory 2" />
                  </div>
                ) : null}
                {!ev.photo1 && !ev.photo2 && (
                   <div className="flex-1 flex items-center justify-center">
                     <span className="text-white/20 font-black italic text-4xl">{ev.year}</span>
                   </div>
                )}
                
                {/* Category Badge */}
                <div className={`absolute top-0 left-0 px-4 py-2 ${catObj.color} border-r-4 border-b-4 border-[var(--border-primary)] rounded-br-2xl flex items-center gap-2`}>
                  <catObj.icon size={14} strokeWidth={3} className={catObj.id === 'achievement' ? 'text-white' : 'text-black'} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${catObj.id === 'achievement' ? 'text-white' : 'text-black'}`}>{catObj.label}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black px-3 py-1 bg-[#FF5F5F] text-white rounded-lg border-2 border-[var(--border-primary)]">{ev.year}</span>
                  {ev.date && <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{ev.date}</span>}
                </div>
                <h4 className="font-black uppercase text-xl leading-tight mb-4">{ev.event}</h4>
                <p className="text-sm font-medium opacity-80 line-clamp-3 mb-6 flex-1">{ev.description}</p>
                
                {/* Actions */}
                <div className="flex gap-3 mt-auto pt-4 border-t-2 border-dashed border-[var(--border-primary)]/20">
                   <button onClick={() => openForm(ev)} className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-[var(--border-primary)] rounded-xl font-black uppercase text-[10px] hover:bg-[#FFD166] transition-colors">
                     <Edit3 size={14} /> Edit
                   </button>
                   <button onClick={async () => { if(confirm('Erase this event?')) await deleteDoc(doc(db, "timeline", ev.id)) }} className="p-3 border-2 border-red-500 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                     <Trash2 size={16} />
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border-4 border-[var(--border-primary)] w-full max-w-3xl rounded-[3rem] shadow-[15px_15px_0px_var(--border-primary)] relative my-8"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute -top-4 -right-4 bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] p-2 rounded-full hover:scale-110 transition-transform z-10"
              >
                <X strokeWidth={3} />
              </button>

              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                
                <div className="border-b-4 border-[var(--border-primary)] pb-4 mb-8">
                   <h3 className="text-3xl font-black uppercase tracking-tighter text-[var(--text-primary)]">
                     {editingId ? "Edit Chronicle" : "New Chronicle Entry"}
                   </h3>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2 flex items-center gap-1">
                    <Tag size={12} /> Event Category
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFormData({...formData, category: cat.id})}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-[var(--border-primary)] transition-all ${
                          formData.category === cat.id ? `${cat.color} -translate-y-1 shadow-[4px_4px_0px_var(--border-primary)]` : 'bg-gray-50 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <cat.icon size={20} strokeWidth={2.5} className={formData.category === cat.id && cat.id === 'achievement' ? 'text-white' : 'text-black'} />
                        <span className={`text-[9px] font-black uppercase tracking-widest text-center ${formData.category === cat.id && cat.id === 'achievement' ? 'text-white' : 'text-black'}`}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-dashed border-[var(--border-primary)]/20">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Legacy Year (Required)</label>
                    <input required type="text" placeholder="e.g. 2024" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-black text-xl focus:border-[#06D6A0] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Specific Date (Optional)</label>
                    <input type="text" placeholder="e.g. 15th August" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-bold text-lg focus:border-[#06D6A0] outline-none" />
                  </div>
                </div>

                {/* Event Info */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Event Title (Required)</label>
                  <input required type="text" placeholder="e.g. Samvid 2024 Launch" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-black text-2xl uppercase focus:border-[#FFD166] outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Story/Description (Required)</label>
                  <textarea required placeholder="Describe the milestone..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl font-medium text-lg h-32 resize-none focus:border-[#FFD166] outline-none" />
                </div>

                {/* Media Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-dashed border-[var(--border-primary)]/20">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Memory 01 (Cover)</p>
                    <label className="block aspect-video bg-[var(--bg-primary)] border-4 border-dashed border-[var(--border-primary)] rounded-3xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors relative group">
                      {formData.photo1 ? (
                        <img src={formData.photo1} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Memory 1" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                          <Camera size={32} />
                          <span className="text-[10px] font-black mt-2">UPLOAD</span>
                        </div>
                      )}
                      {formData.photo1 && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black text-white px-4 py-2 font-black uppercase text-[10px] rounded-lg">Change</span>
                         </div>
                      )}
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'photo1')} />
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Memory 02 (Supporting)</p>
                    <label className="block aspect-video bg-[var(--bg-primary)] border-4 border-dashed border-[var(--border-primary)] rounded-3xl overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors relative group">
                      {formData.photo2 ? (
                        <img src={formData.photo2} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Memory 2" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                          <Camera size={32} />
                          <span className="text-[10px] font-black mt-2">UPLOAD</span>
                        </div>
                      )}
                      {formData.photo2 && (
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black text-white px-4 py-2 font-black uppercase text-[10px] rounded-lg">Change</span>
                         </div>
                      )}
                      <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'photo2')} />
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={uploading} className="w-full bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] py-5 rounded-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all text-xl">
                    {uploading ? "Uploading Media..." : (editingId ? "Update History" : "Publish to Chronicle")}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}