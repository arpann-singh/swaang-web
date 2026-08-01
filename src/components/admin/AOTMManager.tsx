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

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

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
      await setDoc(doc(db, "settings", "aotm"), data, { merge: true });
      alert("Artist of the Month updated on Mainstage! 🌟");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving AOTM data. Check console for details.");
    }
  };

  if (loading) return <div className="p-10 font-black text-gray-400">Fetching the Star...</div>;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8 flex flex-col text-left">
      
      {/* HEADER */}
      <div className="border-b-8 border-[var(--border-primary)] pb-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-[var(--text-primary)]">Star Spotlight</h1>
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">The Magazine Editorial Configuration</p>
      </div>

      {/* MAGAZINE SPREAD LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 flex-1">
        
        {/* LEFT COLUMN: THE PORTRAIT (Massive Dropzone) */}
        <div className="w-full lg:w-5/12 flex flex-col">
          <div className="relative w-full aspect-[3/4] bg-[#2D2D2D] border-8 border-[var(--border-primary)] shadow-[20px_20px_0px_var(--border-primary)] flex flex-col items-center justify-center overflow-hidden group cursor-pointer">
            
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl font-black text-white/5 uppercase rotate-[-90deg] tracking-tighter whitespace-nowrap pointer-events-none">
              STAR
            </div>

            {data.photo ? (
              <img src={data.photo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="AOTM" />
            ) : (
              <span className="relative z-10 font-black uppercase text-xl text-white/40 tracking-widest text-center px-4">
                {uploading ? "Developing..." : "Drop Portrait Here"}
              </span>
            )}
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <span className="bg-[#FFD166] text-[var(--border-primary)] px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs">
                 {data.photo ? "Change Portrait" : "Upload Portrait"}
               </span>
            </div>

            <input type="file" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
          </div>
          
          <div className="mt-8 text-center lg:text-left">
             <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-40">Issue: {data.month || "Current Month"}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: THE TYPOGRAPHY FORM */}
        <div className="w-full lg:w-7/12">
          <form onSubmit={handleSave} className="space-y-12 h-full flex flex-col">
            
            {/* Headline Section */}
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black uppercase text-[#FF5F5F] tracking-[0.3em] ml-1">Spotlight Month</label>
                <input 
                  type="text" 
                  placeholder="e.g. October 2025" 
                  value={data.month || ""} 
                  onChange={e => setData({...data, month: e.target.value})} 
                  className="w-full bg-transparent border-b-4 border-[var(--border-primary)] py-2 text-2xl md:text-3xl font-black uppercase tracking-tighter placeholder:text-gray-300 focus:border-[#FF5F5F] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] ml-1">Artist Name (The Headline)</label>
                <input 
                  type="text" 
                  placeholder="ENTER FULL NAME"
                  value={data.name || ""} 
                  onChange={e => setData({...data, name: e.target.value})} 
                  className="w-full bg-transparent border-b-8 border-[var(--border-primary)] py-4 text-5xl md:text-7xl font-black uppercase tracking-tighter placeholder:text-gray-200 focus:border-[#06D6A0] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#06D6A0] tracking-[0.3em] ml-1">Core Role (The Subtitle)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lead Actor & Director"
                  value={data.role || ""} 
                  onChange={e => setData({...data, role: e.target.value})} 
                  className="w-full bg-transparent border-b-4 border-[var(--border-primary)] py-2 text-xl md:text-2xl font-black uppercase tracking-widest placeholder:text-gray-300 focus:border-[#06D6A0] outline-none transition-colors"
                />
              </div>
            </div>

            {/* Editorial Content */}
            <div className="space-y-8 flex-1 mt-8">
              <div className="bg-white p-6 md:p-8 border-4 border-[var(--border-primary)] rounded-3xl shadow-[8px_8px_0px_var(--border-primary)]">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-4 block">The "Why" (Citation)</label>
                <textarea 
                  value={data.citation || ""} 
                  onChange={e => setData({...data, citation: e.target.value})} 
                  className="w-full bg-transparent text-lg md:text-2xl font-serif italic leading-relaxed placeholder:text-gray-200 resize-none h-40 outline-none" 
                  placeholder="Tell the story of their contribution..." 
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] ml-1">Key Achievements (Bullet points)</label>
                <input 
                  type="text" 
                  value={data.achievements || ""} 
                  onChange={e => setData({...data, achievements: e.target.value})} 
                  className="w-full bg-transparent border-b-4 border-dashed border-[var(--border-primary)]/40 py-4 text-sm md:text-base font-bold tracking-wide placeholder:text-gray-300 focus:border-[var(--border-primary)] outline-none transition-colors" 
                  placeholder="Acting, Direction, Discipline..." 
                />
              </div>
            </div>

            {/* Action Area */}
            <div className="pt-10 mt-auto">
              <button 
                type="submit" 
                className="w-full bg-[#06D6A0] text-[var(--border-primary)] border-8 border-[var(--border-primary)] py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xl md:text-2xl shadow-[12px_12px_0px_var(--border-primary)] hover:translate-y-2 hover:shadow-none transition-all active:scale-95"
              >
                Publish Issue to Mainstage
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
export default AOTMManager;
