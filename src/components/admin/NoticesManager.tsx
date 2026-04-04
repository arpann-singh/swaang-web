"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, doc, deleteDoc, updateDoc,
  serverTimestamp, onSnapshot, query, orderBy
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const NoticesManager = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
    priority: "normal" // normal, urgent, highlight
  });

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
          updatedAt: serverTimestamp()
        });
        setEditingId(null);
        alert("Notice Updated! 📢");
      } else {
        await addDoc(collection(db, "notices"), {
          ...formData,
          createdAt: serverTimestamp()
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
      priority: n.priority ?? "normal"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "notices", id), { isActive: !current });
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Permanently remove this alert from the feed?")) {
      await deleteDoc(doc(db, "notices", id));
    }
  };

  if (loading) return <div className="p-10 font-black text-gray-400">Loading News Feed...</div>;

  return (
    <div className="space-y-12">
      <div className="border-b-4 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-[#2D2D2D]">News Strip</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">Global Alerts & Updates</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* --- NEWS DESK FORM --- */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D] space-y-5 sticky top-10">
            <h2 className="font-black uppercase text-[#FF5F5F] tracking-widest text-sm">
              {editingId ? "Edit Alert ✍️" : "Create Alert 🚀"}
            </h2>
            
            <input required type="text" placeholder="Short Header (e.g. AUDITIONS)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-black bg-[#FFF9F0] uppercase text-xs tracking-widest" />
            
            <textarea required placeholder="The Message..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl h-32 font-bold text-sm" />

            <div className="grid grid-cols-2 gap-4">
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-black text-[10px] uppercase bg-white">
                <option value="normal">Normal</option>
                <option value="urgent">Urgent (Red)</option>
                <option value="highlight">Highlight</option>
              </select>
              <div className="flex items-center justify-center gap-2 border-2 border-[#2D2D2D] rounded-xl bg-gray-50">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 accent-[#FF5F5F]" />
                <label className="text-[9px] font-black uppercase">Live Now</label>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                {editingId ? "Update News" : "Push to Feed"}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setFormData({title:"", content:"", isActive:true, priority:"normal"})}} className="bg-gray-200 border-4 border-[#2D2D2D] px-4 rounded-xl font-black uppercase text-xs">X</button>
              )}
            </div>
          </form>
        </div>

        {/* --- LIVE FEED LIST --- */}
        <div className="xl:col-span-2 space-y-4">
          <AnimatePresence>
            {notices.map((n) => (
              <motion.div 
                layout key={n.id} 
                className={`bg-white border-4 border-[#2D2D2D] p-6 rounded-[2rem] shadow-[6px_6px_0px_#2D2D2D] flex items-center justify-between gap-6 ${!n.isActive ? "opacity-50 grayscale" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 border-[#2D2D2D] ${n.priority === 'urgent' ? 'bg-[#FF5F5F] text-white' : 'bg-[#FFD166]'}`}>
                      {n.priority}
                    </span>
                    <h4 className="font-black text-[#2D2D2D] uppercase tracking-widest text-xs">{n.title}</h4>
                  </div>
                  <p className="text-sm font-bold text-gray-600 line-clamp-1 italic">"{n.content}"</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleActive(n.id, n.isActive)} className={`p-3 rounded-xl border-2 border-[#2D2D2D] shadow-[2px_2px_0px_#2D2D2D] transition-all ${n.isActive ? "bg-[#06D6A0]" : "bg-white"}`}>
                    {n.isActive ? "🟢" : "⚪"}
                  </button>
                  <button onClick={() => handleEdit(n)} className="bg-white border-2 border-[#2D2D2D] px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-[#FFF9F0]">Edit</button>
                  <button onClick={() => deleteNotice(n.id)} className="text-red-500 border-2 border-red-500 p-2 rounded-xl">🗑️</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NoticesManager;
