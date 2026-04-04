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
  
  const initialForm = {
    title: "",
    description: "",
    image: "",       
    playbillUrl: "", 
    teaserUrl: "",   
    fullVideoUrl: "", 
    status: "Upcoming",
    date: "",
    showOnHome: false
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
      showOnHome: ev.showOnHome || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="space-y-12 bg-[#FFF9F0] p-4 md:p-8 min-h-screen">
      <div className="border-b-8 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black uppercase text-[#2D2D2D]">Playbill Desk</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">Manage the Stage Legacy</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-4">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[12px_12px_0px_#2D2D2D] space-y-4 sticky top-10">
            <h2 className="font-black uppercase text-[#FF5F5F] text-xs">{editingId ? "Edit Play" : "Register Play"}</h2>
            <input required type="text" placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold" />
            <textarea required placeholder="Synopsis" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl h-24 font-medium" />
            
            <div className="flex items-center gap-4 border-2 border-[#2D2D2D] p-3 rounded-xl bg-gray-50">
              <div className="w-12 h-16 bg-white border-2 border-[#2D2D2D] rounded-lg overflow-hidden shrink-0">
                {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🖼️</div>}
              </div>
              <label className="flex-1 cursor-pointer bg-white border-2 border-[#2D2D2D] p-2 rounded-lg text-center font-black uppercase text-[10px]">
                {uploading ? "..." : "Upload Poster"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="space-y-2">
               <input type="text" placeholder="Playbill (PDF/Drive Link)" value={formData.playbillUrl} onChange={e => setFormData({...formData, playbillUrl: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
               <input type="text" placeholder="Teaser (YouTube Link)" value={formData.teaserUrl} onChange={e => setFormData({...formData, teaserUrl: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
               <input type="text" placeholder="Full Production Video (YouTube)" value={formData.fullVideoUrl} onChange={e => setFormData({...formData, fullVideoUrl: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs bg-[#FFD166]/10" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs bg-white" />
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs bg-white">
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
              </select>
            </div>

            {/* 🔥 RESTORED: Show on Homepage Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-[#2D2D2D] rounded-xl">
              <input type="checkbox" checked={formData.showOnHome} onChange={e => setFormData({...formData, showOnHome: e.target.checked})} className="w-5 h-5 accent-[#06D6A0]" />
              <label className="text-[10px] font-black uppercase tracking-widest">Show on Homepage</label>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 transition-all mt-4">
              {editingId ? "Save Changes" : "Publish Play"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-8 space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className={`bg-white border-4 border-[#2D2D2D] p-4 rounded-[2rem] flex items-center gap-6 shadow-[6px_6px_0px_#2D2D2D] ${ev.isSpotlight ? 'ring-4 ring-[#FFD166]' : ''}`}>
              <img src={ev.image} className="w-16 h-24 object-cover rounded-xl border-2 border-[#2D2D2D]" />
              <div className="flex-1">
                <h3 className="font-black text-xl uppercase">{ev.title}</h3>
                <div className="flex gap-2 mt-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase ${ev.status === "Upcoming" ? "bg-[#06D6A0]" : "bg-gray-200"}`}>{ev.status}</span>
                    {ev.fullVideoUrl && <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase bg-[#FF5F5F] text-white">Full Show</span>}
                    {/* 🔥 VISUAL BADGE: Shows if it's currently on the homepage */}
                    {ev.showOnHome && <span className="text-[8px] font-black px-2 py-0.5 rounded-full border border-black uppercase bg-[#2D2D2D] text-white">★ On Home</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleSpotlight(ev.id, ev.isSpotlight)} className={`px-4 py-2 border-2 border-[#2D2D2D] rounded-xl font-black text-[9px] ${ev.isSpotlight ? 'bg-[#FFD166]' : 'bg-white'}`}>Spotlight</button>
                <button onClick={() => handleEdit(ev)} className="px-4 py-2 border-2 border-[#2D2D2D] rounded-xl font-black text-[9px] bg-white">Edit</button>
                <button onClick={() => deleteDoc(doc(db, "events", ev.id))} className="p-2 border-2 border-red-500 rounded-xl text-red-500">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsManager;