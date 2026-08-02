"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, doc, deleteDoc, updateDoc,
  serverTimestamp, onSnapshot, query, orderBy
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit, CheckSquare, Square, Zap } from "lucide-react";

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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-8 border-black border-t-[#06D6A0] animate-spin shadow-[4px_4px_0px_black]"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-24">
      <div className="border-b-8 border-black pb-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white" style={{ WebkitTextStroke: '2px black' }}>News Strip</h1>
        <p className="text-xs md:text-sm font-mono font-black uppercase tracking-[0.4em] bg-[#FFD166] text-black inline-block px-4 py-2 mt-4 border-4 border-black shadow-[4px_4px_0px_black]">
          GLOBAL ALERTS & UPDATES
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* --- NEWS DESK FORM --- */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-[#FFF9F0] border-4 border-black p-8 shadow-[8px_8px_0px_#FF5F5F] space-y-6 sticky top-10">
            <h2 className="font-mono font-black uppercase text-black tracking-widest text-lg flex items-center gap-3 bg-[#FF5F5F] border-4 border-black p-3 -mx-8 -mt-8 mb-8">
              <Zap size={24} /> {editingId ? "EDIT ALERT" : "CREATE ALERT"}
            </h2>
            
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black uppercase tracking-widest text-black">Header</label>
              <input required type="text" placeholder="e.g. AUDITIONS" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-4 border-black p-4 font-mono font-bold bg-white uppercase text-sm tracking-widest shadow-[4px_4px_0px_black] focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-[0px_0px_0px_black] transition-all" />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black uppercase tracking-widest text-black">Message Body</label>
              <textarea required placeholder="Forms open in 2 days..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full border-4 border-black p-4 h-32 font-mono font-bold text-sm shadow-[4px_4px_0px_black] bg-white focus:outline-none focus:translate-y-1 focus:translate-x-1 focus:shadow-[0px_0px_0px_black] transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-black uppercase tracking-widest text-black">Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border-4 border-black p-3 font-mono font-black text-xs uppercase bg-[#FFD166] shadow-[4px_4px_0px_black] focus:outline-none">
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-[10px] font-black uppercase tracking-widest text-black">Status</label>
                <div 
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})} 
                  className={`w-full border-4 border-black p-3 font-mono font-black text-xs uppercase flex justify-center items-center gap-2 cursor-pointer shadow-[4px_4px_0px_black] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${formData.isActive ? 'bg-[#06D6A0] text-black' : 'bg-gray-300 text-gray-500'}`}
                >
                  {formData.isActive ? <CheckSquare size={16} /> : <Square size={16} />} LIVE NOW
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-black text-[#06D6A0] border-4 border-black py-4 font-mono font-black uppercase tracking-widest shadow-[6px_6px_0px_#06D6A0] hover:bg-white hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_black] transition-all">
                {editingId ? "UPDATE NEWS" : "PUSH TO FEED"}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setFormData({title:"", content:"", isActive:true, priority:"normal"})}} className="bg-white text-black border-4 border-black px-6 font-mono font-black uppercase text-xl shadow-[4px_4px_0px_black] hover:bg-[#FF5F5F] hover:text-white transition-all">
                  X
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- LIVE FEED LIST --- */}
        <div className="xl:col-span-2 space-y-6">
          <AnimatePresence>
            {notices.map((n) => (
              <motion.div 
                layout key={n.id} 
                className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${!n.isActive ? "opacity-60 bg-gray-100" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <span className={`text-[10px] font-mono font-black uppercase px-3 py-1 border-2 border-black shadow-[2px_2px_0px_black] ${n.priority === 'urgent' ? 'bg-[#FF5F5F] text-white' : n.priority === 'highlight' ? 'bg-[#FFD166] text-black' : 'bg-gray-300 text-black'}`}>
                      {n.priority}
                    </span>
                    <h4 className="font-mono font-black text-black uppercase tracking-widest text-lg">{n.title}</h4>
                  </div>
                  <p className="text-sm font-sans font-bold text-gray-800 italic border-l-4 border-black pl-4 py-1">"{n.content}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                  <button onClick={() => toggleActive(n.id, n.isActive)} className={`w-12 h-12 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${n.isActive ? "bg-[#06D6A0] text-black" : "bg-gray-200 text-gray-500"}`} title={n.isActive ? "Deactivate" : "Activate"}>
                    {n.isActive ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                  <button onClick={() => handleEdit(n)} className="w-12 h-12 flex items-center justify-center bg-[#FFD166] border-4 border-black text-black shadow-[4px_4px_0px_black] hover:bg-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all" title="Edit">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteNotice(n.id)} className="w-12 h-12 flex items-center justify-center bg-[#FF5F5F] border-4 border-black text-black shadow-[4px_4px_0px_black] hover:bg-black hover:text-[#FF5F5F] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all" title="Delete">
                    <Trash2 size={18} />
                  </button>
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
