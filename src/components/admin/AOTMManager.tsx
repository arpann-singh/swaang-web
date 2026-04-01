"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const AOTMManager = () => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState({
    name: "",
    role: "",
    month: "",
    citation: "",
    photo: "",
    achievements: ""
  });

  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; // 👈 ENSURE YOUR KEY IS HERE

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "aotm"), (d) => {
      if (d.exists()) setData(d.data() as any);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePhotoUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: body,
      });
      const resData = await res.json();
      if (resData.success) {
        setData({ ...data, photo: resData.data.url });
        alert("AOTM Portrait Uploaded! 🏆");
      }
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    try {
      // Use setDoc with merge: true to handle missing documents
      await setDoc(doc(db, "settings", "aotm"), data, { merge: true });
      alert("Artist of the Month updated on Mainstage! 🌟");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving AOTM data. Check console for details.");
    }
  };

  if (loading) return <div className="p-10 font-black text-gray-400">Fetching the Star...</div>;

  return (
    <div className="space-y-12">
      <div className="border-b-4 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-[#2D2D2D]">Star Spotlight</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">Honoring the Artist of the Month</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <form onSubmit={handleSave} className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3rem] shadow-[15px_15px_0px_#2D2D2D] space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Artist Name</label>
              <input type="text" value={data.name || ""} onChange={e => setData({...data, name: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Spotlight Month</label>
              <input type="text" placeholder="e.g. October 2025" value={data.month || ""} onChange={e => setData({...data, month: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Core Role</label>
            <input type="text" value={data.role || ""} onChange={e => setData({...data, role: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[#FF5F5F] tracking-widest">The "Why" (Citation)</label>
            <textarea value={data.citation || ""} onChange={e => setData({...data, citation: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-medium h-32" placeholder="Tell the story of their contribution..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Key Achievements</label>
            <input type="text" value={data.achievements || ""} onChange={e => setData({...data, achievements: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" placeholder="Acting, Direction, Discipline..." />
          </div>

          <button type="submit" className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-5 rounded-2xl font-black uppercase shadow-[6px_6px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">Update Home Spotlight</button>
        </form>

        <div className="space-y-8 text-center">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-6">Spotlight Portrait</h3>
             <div className="relative group w-full aspect-square bg-[#FFF9F0] border-4 border-dashed border-[#2D2D2D] rounded-[2rem] overflow-hidden flex items-center justify-center mx-auto max-w-sm shadow-[10px_10px_0px_#2D2D2D]">
                {data.photo ? <img src={data.photo} className="w-full h-full object-cover" alt="AOTM" /> : <span className="opacity-30 font-black uppercase text-[10px]">{uploading ? "Uploading..." : "Click to Upload Portrait"}</span>}
                <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
        </div>
      </div>
    </div>
  );
};
export default AOTMManager;
