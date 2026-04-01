"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, addDoc, doc, deleteDoc, updateDoc, 
  serverTimestamp, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const EventsManager = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    status: "Upcoming",
    date: "",
    showOnHome: false
  });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), formData);
        setEditingId(null);
        alert("Production Updated! 🎭");
      } else {
        await addDoc(collection(db, "events"), {
          ...formData,
          isSpotlight: false,
          createdAt: serverTimestamp()
        });
        alert("New Production Published! ✨");
      }
      setFormData({ title: "", description: "", image: "", status: "Upcoming", date: "", showOnHome: false });
    } catch (err) {
      alert("Error saving production.");
    }
  };

  const handleEdit = (ev: any) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title,
      description: ev.description,
      image: ev.image,
      status: ev.status,
      date: ev.date,
      showOnHome: ev.showOnHome || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSpotlight = async (id: string, current: boolean) => {
    if (!current) {
      // Turn off all other spotlights first
      for (const ev of events) {
        if (ev.isSpotlight) await updateDoc(doc(db, "events", ev.id), { isSpotlight: false });
      }
    }
    await updateDoc(doc(db, "events", id), { isSpotlight: !current });
  };

  const deleteEvent = async (id: string) => {
    if (confirm("Are you sure? This will remove the production from the archives forever.")) {
      await deleteDoc(doc(db, "events", id));
    }
  };

  if (loading) return <div className="p-10 font-black text-gray-400 animate-pulse">Loading Stage...</div>;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center border-b-4 border-[#2D2D2D] pb-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-[#2D2D2D]">Productions</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">Manage the Swaang Playbill</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* --- ADD/EDIT FORM --- */}
        <div className="xl:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D] space-y-5 sticky top-10">
            <h2 className="font-black uppercase text-[#FF5F5F] tracking-widest text-sm">
              {editingId ? "Edit Production ✍️" : "New Production ✨"}
            </h2>
            
            <input required type="text" placeholder="Play Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
            
            <textarea required placeholder="Synopsis / Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl h-32 font-medium" />
            
            <input required type="text" placeholder="Poster Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold" />
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs bg-white">
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#06D6A0]/10 border-2 border-dashed border-[#06D6A0] rounded-xl">
              <input type="checkbox" checked={formData.showOnHome} onChange={e => setFormData({...formData, showOnHome: e.target.checked})} className="w-5 h-5 accent-[#06D6A0]" />
              <label className="text-[10px] font-black uppercase tracking-widest">Show on Homepage</label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                {editingId ? "Save Changes" : "Publish Play"}
              </button>
              {editingId && (
                <button type="button" onClick={() => {setEditingId(null); setFormData({title:"", description:"", image:"", status:"Upcoming", date:"", showOnHome:false})}} className="bg-gray-200 border-4 border-[#2D2D2D] px-4 rounded-xl font-black underline text-xs">X</button>
              )}
            </div>
          </form>
        </div>

        {/* --- EVENTS LIST --- */}
        <div className="xl:col-span-2 space-y-6">
          <AnimatePresence>
            {events.map((ev) => (
              <motion.div 
                layout
                key={ev.id} 
                className={`bg-white border-4 border-[#2D2D2D] p-6 rounded-[2.5rem] shadow-[8px_8px_0px_#2D2D2D] flex flex-col md:flex-row gap-6 items-center transition-all ${ev.isSpotlight ? "ring-4 ring-[#FFD166] border-[#FFD166]" : ""}`}
              >
                <img src={ev.image} alt={ev.title} className="w-28 h-40 object-cover rounded-2xl border-4 border-[#2D2D2D] shadow-[4px_4px_0px_#2D2D2D]" />
                
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-[#2D2D2D] ${ev.status === "Upcoming" ? "bg-[#06D6A0]" : "bg-gray-200"}`}>
                      {ev.status}
                    </span>
                    {ev.showOnHome && <span className="text-[9px] font-black uppercase px-3 py-1 rounded-full border-2 border-[#2D2D2D] bg-[#FFD166]">Home Visible</span>}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-none">{ev.title}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{ev.date}</p>
                  <p className="text-xs font-medium text-gray-600 line-clamp-2 italic">"{ev.description}"</p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => toggleSpotlight(ev.id, ev.isSpotlight)} 
                    className={`px-6 py-2 rounded-xl border-2 border-[#2D2D2D] font-black text-[9px] uppercase shadow-[3px_3px_0px_#2D2D2D] transition-all ${ev.isSpotlight ? "bg-[#FFD166]" : "bg-white"}`}
                  >
                    {ev.isSpotlight ? "⭐ Spotlighted" : "Make Spotlight"}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(ev)} className="flex-1 bg-white border-2 border-[#2D2D2D] py-2 rounded-xl text-[9px] font-black uppercase hover:bg-[#FFF9F0]">Edit</button>
                    <button onClick={() => deleteEvent(ev.id)} className="flex-1 bg-white text-red-500 border-2 border-red-500 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EventsManager;
