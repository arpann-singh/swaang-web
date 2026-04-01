"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";

const TimelineManager = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState({ photo1: false, photo2: false });
  const [formData, setFormData] = useState({ year: "", event: "", description: "", photo1: "", photo2: "" });

  const IMGBB_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; // 👈 DOUBLE CHECK THIS KEY

  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("year", "desc"));
    return onSnapshot(q, (snap) => setMilestones(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleUpload = async (e: any, key: 'photo1' | 'photo2') => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Show Loading State immediately
    setIsUploading(prev => ({ ...prev, [key]: true }));

    const body = new FormData();
    body.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body });
      const resData = await res.json();
      
      if (resData.success) {
        setFormData(prev => ({ ...prev, [key]: resData.data.url }));
        console.log(`Uploaded ${key}: `, resData.data.url);
      } else {
        alert("ImgBB Error: " + resData.error.message);
      }
    } catch (err) {
      alert("Network Error: Could not reach ImgBB");
    } finally {
      // 2. Hide Loading State
      setIsUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.year || !formData.event) return alert("Year and Event are required!");
    await addDoc(collection(db, "timeline"), formData);
    setFormData({ year: "", event: "", description: "", photo1: "", photo2: "" });
    alert("Milestone Added to Journey! 🎞️");
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D]">
        <h2 className="font-black uppercase mb-6 text-xl tracking-tighter">Add Memory to Journey</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="Year (e.g. 2024)" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
            <input required type="text" placeholder="Event Name" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
          </div>
          
          <textarea placeholder="Tell the story of this event..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl h-32 font-medium" />
          
          <div className="grid grid-cols-2 gap-6">
            {/* PHOTO 1 SLOT */}
            <div className="relative group h-32 bg-gray-50 border-4 border-dashed border-[#2D2D2D] rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-white">
               {isUploading.photo1 ? (
                 <div className="flex flex-col items-center animate-pulse">
                   <span className="text-[24px]">⏳</span>
                   <span className="text-[10px] font-black uppercase text-[#FF5F5F]">Syncing...</span>
                 </div>
               ) : formData.photo1 ? (
                 <img src={formData.photo1} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center">
                    <span className="text-2xl opacity-30">📸</span>
                    <p className="text-[9px] font-black uppercase opacity-40">Add Photo 1</p>
                 </div>
               )}
               <input type="file" onChange={(e) => handleUpload(e, 'photo1')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>

            {/* PHOTO 2 SLOT */}
            <div className="relative group h-32 bg-gray-50 border-4 border-dashed border-[#2D2D2D] rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-white">
               {isUploading.photo2 ? (
                 <div className="flex flex-col items-center animate-pulse">
                   <span className="text-[24px]">⏳</span>
                   <span className="text-[10px] font-black uppercase text-[#FF5F5F]">Syncing...</span>
                 </div>
               ) : formData.photo2 ? (
                 <img src={formData.photo2} className="w-full h-full object-cover" />
               ) : (
                 <div className="text-center">
                    <span className="text-2xl opacity-30">📸</span>
                    <p className="text-[9px] font-black uppercase opacity-40">Add Photo 2</p>
                 </div>
               )}
               <input type="file" onChange={(e) => handleUpload(e, 'photo2')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>

          <button type="submit" disabled={isUploading.photo1 || isUploading.photo2} className="w-full bg-[#06D6A0] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase shadow-[6px_6px_0px_#2D2D2D] disabled:opacity-50 disabled:shadow-none transition-all hover:-translate-y-1">
            { (isUploading.photo1 || isUploading.photo2) ? "Waiting for Assets..." : "Publish Milestone" }
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map(m => (
          <div key={m.id} className="bg-white border-4 border-[#2D2D2D] p-4 rounded-2xl flex justify-between items-center shadow-[4px_4px_0px_#2D2D2D]">
            <div>
              <p className="font-black text-[#FF5F5F] text-xs">{m.year}</p>
              <p className="font-bold uppercase text-[10px]">{m.event}</p>
            </div>
            <button onClick={() => deleteDoc(doc(db, "timeline", m.id))} className="bg-red-100 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimelineManager;
