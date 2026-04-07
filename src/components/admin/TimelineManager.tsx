"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";

const TimelineManager = () => {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState({ photo1: false, photo2: false });
  // 🔥 ENHANCEMENT: State to track if we are editing
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ year: "", event: "", description: "", photo1: "", photo2: "" });

  const IMGBB_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; 

  useEffect(() => {
    // We sort by year descending here just for the admin list view
    const q = query(collection(db, "timeline"), orderBy("year", "desc"));
    return onSnapshot(q, (snap) => setMilestones(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleUpload = async (e: any, key: 'photo1' | 'photo2') => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(prev => ({ ...prev, [key]: true }));
    const body = new FormData();
    body.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: "POST", body });
      const resData = await res.json();
      if (resData.success) {
        setFormData(prev => ({ ...prev, [key]: resData.data.url }));
      } else {
        alert("Upload Error");
      }
    } catch (err) {
      alert("Network Error");
    } finally {
      setIsUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // 🔥 ENHANCEMENT: Populate form with existing data to Edit
  const startEdit = (m: any) => {
    setEditId(m.id);
    setFormData({
      year: m.year,
      event: m.event,
      description: m.description || "",
      photo1: m.photo1 || "",
      photo2: m.photo2 || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.year || !formData.event) return alert("Year and Event are required!");

    try {
      if (editId) {
        // 🔥 ENHANCEMENT: Update existing doc instead of adding a new one
        await updateDoc(doc(db, "timeline", editId), formData);
        alert("Milestone Updated! ✨");
      } else {
        await addDoc(collection(db, "timeline"), formData);
        alert("Milestone Published! 🎞️");
      }
      setFormData({ year: "", event: "", description: "", photo1: "", photo2: "" });
      setEditId(null);
    } catch (err) {
      alert("Operation failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D]">
        <h2 className="font-black uppercase mb-6 text-xl tracking-tighter">
          {editId ? "🛠️ Edit Journey Record" : "➕ Add Memory to Journey"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="Year" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
            <input required type="text" placeholder="Event Name" value={formData.event} onChange={e => setFormData({...formData, event: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold bg-[#FFF9F0]" />
          </div>
          
          <textarea placeholder="Tell the story..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl h-32 font-medium" />
          
          <div className="grid grid-cols-2 gap-6">
            <div className="relative group h-32 bg-gray-50 border-4 border-dashed border-[#2D2D2D] rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-white">
               {isUploading.photo1 ? <span>⏳ Syncing...</span> : formData.photo1 ? <img src={formData.photo1} className="w-full h-full object-cover" /> : <p className="text-[9px] font-black uppercase">Photo 1</p>}
               <input type="file" onChange={(e) => handleUpload(e, 'photo1')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
            <div className="relative group h-32 bg-gray-50 border-4 border-dashed border-[#2D2D2D] rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-white">
               {isUploading.photo2 ? <span>⏳ Syncing...</span> : formData.photo2 ? <img src={formData.photo2} className="w-full h-full object-cover" /> : <p className="text-[9px] font-black uppercase">Photo 2</p>}
               <input type="file" onChange={(e) => handleUpload(e, 'photo2')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="flex-1 bg-[#06D6A0] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase shadow-[6px_6px_0px_#2D2D2D]">
              {editId ? "Save Changes" : "Publish Milestone"}
            </button>
            {editId && (
              <button type="button" onClick={() => {setEditId(null); setFormData({year:"",event:"",description:"",photo1:"",photo2:""})}} className="bg-red-500 text-white px-6 rounded-2xl border-4 border-[#2D2D2D] font-black uppercase">Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map(m => (
          <div key={m.id} className="bg-white border-4 border-[#2D2D2D] p-4 rounded-2xl flex justify-between items-center shadow-[4px_4px_0px_#2D2D2D]">
            <div className="flex-1">
              <p className="font-black text-[#FF5F5F] text-xs">{m.year}</p>
              <p className="font-bold uppercase text-[10px] truncate">{m.event}</p>
            </div>
            <div className="flex gap-2">
                {/* 🔥 ENHANCEMENT: Edit Button */}
                <button onClick={() => startEdit(m)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                <button onClick={() => deleteDoc(doc(db, "timeline", m.id))} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default TimelineManager;