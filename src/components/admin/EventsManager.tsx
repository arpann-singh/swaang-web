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
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false); // 🔥 NEW: Modal State
  
  const initialForm = {
    title: "",
    description: "",
    image: "",       
    playbillUrl: "", 
    teaserUrl: "",   
    fullVideoUrl: "", 
    status: "Upcoming",
    date: "",
    time: "18:00",
    showOnHome: false,
    isRsvpEnabled: false
  };

  const [formData, setFormData] = useState(initialForm);
  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredEvents = events.filter(ev => 
    ev.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ev.date?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData(prev => ({ ...prev, image: json.data.url }));
        alert("Poster Uploaded! 📸");
      }
    } catch (err) { alert("Upload failed."); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return alert("Please upload a poster!");
    try {
      if (editingId) {
        await updateDoc(doc(db, "events", editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "events"), {
          ...formData,
          isSpotlight: false,
          createdAt: serverTimestamp()
        });
      }
      setFormData(initialForm);
      setIsFormOpen(false);
      alert("Archive Updated! 🎭");
    } catch (err) { alert("Error saving."); }
  };

  const handleEdit = (ev: any) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title || "",
      description: ev.description || "",
      image: ev.image || "",
      playbillUrl: ev.playbillUrl || "",
      teaserUrl: ev.teaserUrl || "",
      fullVideoUrl: ev.fullVideoUrl || "",
      status: ev.status || "Upcoming",
      date: ev.date || "",
      time: ev.time || "18:00",
      showOnHome: ev.showOnHome || false,
      isRsvpEnabled: ev.isRsvpEnabled || false
    });
    setIsFormOpen(true);
  };

  const toggleSpotlight = async (id: string, current: boolean) => {
    if (!current) {
      for (const ev of events) {
        if (ev.isSpotlight) await updateDoc(doc(db, "events", ev.id), { isSpotlight: false });
      }
    }
    await updateDoc(doc(db, "events", id), { isSpotlight: !current });
  };

  if (loading) return <div className="p-10 font-black opacity-20">Opening Archive...</div>;

  return (
    <div className="space-y-12 bg-[var(--bg-primary)] p-4 md:p-8 min-h-screen">
      <div className="border-b-8 border-[var(--border-primary)] pb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase text-[var(--text-primary)]">Playbill Desk</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2 text-left">Manage the Stage Legacy</p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          <div className="w-full md:w-80 relative">
            <input 
              type="text" 
              placeholder="Search Play Title or Status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-4 border-[var(--border-primary)] p-3 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_var(--border-primary)] outline-none focus:translate-y-1 focus:shadow-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditingId(null); setFormData(initialForm); setIsFormOpen(true); }}
            className="bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Register Play</span>
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      </div>

      {/* FULL WIDTH LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((ev) => (
          <div key={ev.id} className={`bg-white border-4 border-[var(--border-primary)] p-5 rounded-[2rem] flex flex-col gap-4 shadow-[8px_8px_0px_var(--border-primary)] transition-transform hover:-translate-y-1 ${ev.isSpotlight ? 'ring-4 ring-[#FFD166]' : ''}`}>
            
            <div className="flex items-start gap-4">
               <img src={ev.image} className="w-20 h-28 object-cover rounded-xl border-2 border-[var(--border-primary)] shadow-[4px_4px_0px_var(--border-primary)] shrink-0" />
               <div className="flex-1 text-left pt-1">
                 <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight line-clamp-2">{ev.title}</h3>
                 <p className="text-[10px] font-black uppercase text-[#FF5F5F] tracking-widest mt-1">{ev.date} {ev.time}</p>
                 <div className="flex flex-wrap gap-1 mt-2">
                     <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase ${ev.status === "Upcoming" ? "bg-[#06D6A0]" : "bg-gray-200"}`}>{ev.status}</span>
                     {ev.fullVideoUrl && <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase bg-[#FF5F5F] text-white">Full Show</span>}
                     {ev.showOnHome && <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase bg-[#2D2D2D] text-white">★ Home</span>}
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-auto border-t-2 border-dashed border-gray-200 pt-4">
              <button onClick={() => toggleSpotlight(ev.id, ev.isSpotlight)} className={`py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[9px] uppercase tracking-widest transition-colors ${ev.isSpotlight ? 'bg-[#FFD166] shadow-[2px_2px_0px_var(--border-primary)] translate-y-0' : 'bg-white hover:bg-gray-50'}`}>Spotlight</button>
              <button onClick={() => handleEdit(ev)} className="py-2 border-2 border-[var(--border-primary)] rounded-lg font-black text-[9px] uppercase tracking-widest bg-white hover:bg-blue-50 transition-colors">Edit</button>
              <button onClick={() => { if(confirm('Delete this event?')) deleteDoc(doc(db, "events", ev.id)) }} className="py-2 border-2 border-[#FF5F5F] text-[#FF5F5F] rounded-lg font-black text-[9px] uppercase tracking-widest bg-white hover:bg-[#FF5F5F] hover:text-white transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="p-20 border-4 border-dashed border-[var(--border-primary)]/20 rounded-[3rem] text-center opacity-40 font-black uppercase italic tracking-widest">
          No Plays Found Matching "{searchTerm}"
        </div>
      )}

      {/* OVERLAY MODAL FORM */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[var(--bg-primary)]/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10 overflow-y-auto"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white border-8 border-[var(--border-primary)] rounded-[3rem] shadow-[20px_20px_0px_var(--border-primary)] p-6 md:p-12 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsFormOpen(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] rounded-full font-black text-xl flex items-center justify-center shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all z-10"
              >
                ✕
              </button>

              <form onSubmit={handleSubmit} className="space-y-8 text-left max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="border-b-4 border-dashed border-[var(--border-primary)]/20 pb-4 pr-12">
                   <h2 className="font-black uppercase text-4xl tracking-tighter text-[var(--text-primary)] leading-none">{editingId ? "Edit Play" : "Register Play"}</h2>
                   <p className="text-[#FF5F5F] font-black uppercase text-[10px] tracking-widest mt-2">Swaang Production Dossier</p>
                </div>
                
                {/* 1. Basic Details */}
                <div className="space-y-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Play Title</label>
                      <input required type="text" placeholder="e.g. MEDISYN" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-black text-xl text-[var(--text-primary)] focus:border-[#FF5F5F] focus:bg-[var(--bg-primary)] outline-none transition-all" />
                   </div>
                   
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Synopsis</label>
                      <textarea required placeholder="A brief description of the play..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl h-28 font-medium focus:border-[#FF5F5F] focus:bg-[var(--bg-primary)] outline-none transition-all resize-none" />
                   </div>
                </div>
                
                {/* 2. Media Assets */}
                <div className="space-y-4 bg-gray-50 border-2 border-[var(--border-primary)] p-6 rounded-2xl">
                   <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-primary)] opacity-50 mb-2">Media & Assets</h3>
                   
                   <div className="flex flex-col md:flex-row items-center gap-4">
                     <div className="w-24 h-32 bg-white border-2 border-[var(--border-primary)] rounded-lg overflow-hidden shrink-0 shadow-[4px_4px_0px_var(--border-primary)]">
                       {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 font-black text-[10px] uppercase text-center p-2">No Poster</div>}
                     </div>
                     <label className="flex-1 w-full cursor-pointer bg-white border-2 border-[var(--border-primary)] p-4 rounded-xl text-center font-black uppercase text-xs hover:bg-[#FFD166] transition-colors shadow-[4px_4px_0px_var(--border-primary)] active:translate-y-1 active:shadow-none">
                       {uploading ? "Uploading..." : "Upload Master Poster"}
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                     </label>
                   </div>

                   <div className="space-y-3 pt-4 border-t-2 border-dashed border-[var(--border-primary)]/20">
                      <div className="relative">
                         <span className="absolute left-3 top-3 text-lg opacity-40">📄</span>
                         <input type="text" placeholder="Playbill (PDF / Google Drive Link)" value={formData.playbillUrl} onChange={e => setFormData({...formData, playbillUrl: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-3 pl-10 rounded-xl font-bold text-xs" />
                      </div>
                      <div className="relative">
                         <span className="absolute left-3 top-3 text-lg opacity-40">🎬</span>
                         <input type="text" placeholder="Teaser Trailer (YouTube Link)" value={formData.teaserUrl} onChange={e => setFormData({...formData, teaserUrl: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-3 pl-10 rounded-xl font-bold text-xs" />
                      </div>
                      <div className="relative">
                         <span className="absolute left-3 top-3 text-lg opacity-40">🎥</span>
                         <input type="text" placeholder="Full Production Video (YouTube)" value={formData.fullVideoUrl} onChange={e => setFormData({...formData, fullVideoUrl: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-3 pl-10 rounded-xl font-bold text-xs bg-[#FFD166]/10 focus:bg-white" />
                      </div>
                   </div>
                </div>

                {/* 3. Scheduling & Visibility */}
                <div className="space-y-4">
                   <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-primary)] opacity-50">Scheduling</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-bold text-sm bg-white focus:border-[#06D6A0] outline-none" />
                     <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-bold text-sm bg-white focus:border-[#06D6A0] outline-none" />
                   </div>
                   <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 rounded-xl font-black uppercase text-sm bg-white focus:border-[#06D6A0] outline-none cursor-pointer">
                     <option value="Upcoming">Status: UPCOMING</option>
                     <option value="Completed">Status: COMPLETED</option>
                     <option value="Postponed">Status: POSTPONED</option>
                   </select>

                   <div className="flex flex-col gap-3 pt-2">
                     <label className="flex items-center justify-between p-4 bg-white border-2 border-[var(--border-primary)] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                       <span className="text-[11px] font-black uppercase tracking-widest">Show on Homepage</span>
                       <input type="checkbox" checked={formData.showOnHome} onChange={e => setFormData({...formData, showOnHome: e.target.checked})} className="w-6 h-6 accent-[var(--border-primary)] cursor-pointer" />
                     </label>
                     <label className="flex items-center justify-between p-4 bg-white border-2 border-[var(--border-primary)] rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                       <span className="text-[11px] font-black uppercase tracking-widest">Enable RSVPs / Ticketing</span>
                       <input type="checkbox" checked={formData.isRsvpEnabled} onChange={e => setFormData({...formData, isRsvpEnabled: e.target.checked})} className="w-6 h-6 accent-[var(--border-primary)] cursor-pointer" />
                     </label>
                   </div>
                </div>

                <div className="pt-4 border-t-4 border-dashed border-[var(--border-primary)]/20">
                   <button type="submit" disabled={uploading} className="w-full bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] py-5 rounded-2xl font-black uppercase tracking-widest text-lg shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border-primary)] transition-all">
                     {editingId ? "Save Changes" : "Publish Play"}
                   </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventsManager;