"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function BrandingEditor() {
  const [data, setData] = useState<any>({ styles: {} });
  const [activeTab, setActiveTab] = useState("founder");
  const [uploading, setUploading] = useState("");

  // 🎭 Load homepage data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      const homeDoc = await getDoc(doc(db, "settings", "homepage"));
      if (homeDoc.exists()) setData(homeDoc.data());
    };
    fetchAllData();
  }, []);

  // 🚀 Sync everything to Firebase
  const syncAll = async () => {
    try {
      await updateDoc(doc(db, "settings", "homepage"), data);
      alert("Full Stage Identity & Typography Synced! 🎭");
    } catch (err) {
      alert("Sync Error: " + err);
    }
  };

  // 📸 ImgBB Upload Logic
  const handleUpload = async (e: any, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(field);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const resData = await res.json();
      if (resData.success) {
        setData({ ...data, [field]: resData.data.url });
      }
    } catch (err) {
      alert("Upload Failed. Check API Key.");
    } finally {
      setUploading("");
    }
  };

  // 🖼️ Reusable Preview Component
  const Preview = ({ url, loading }: { url: string; loading: boolean }) => (
    <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-black overflow-hidden bg-[#2D2D2D] flex items-center justify-center shadow-[4px_4px_0px_black] shrink-0">
      {loading ? (
        <div className="animate-spin text-2xl font-black text-[#06D6A0]">⏳</div>
      ) : url ? (
        <img src={url} className="w-full h-full object-cover" alt="Preview" />
      ) : (
        <span className="text-[10px] font-mono font-black uppercase text-[#FF5F5F] text-center p-2">NO<br/>VISUAL</span>
      )}
    </div>
  );

  // 📏 Reusable Slider Control
  const Slider = ({ label, field, min = 1, max = 15 }: any) => {
    const val = data.styles?.[field] ? parseFloat(data.styles[field]) : 4;
    return (
      <div className="flex flex-col gap-3 bg-[#FFD166] p-4 border-4 border-black w-full shadow-[4px_4px_0px_black]">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black">{label}</label>
          <span className="text-[10px] font-mono font-black bg-black text-[#FFD166] px-3 py-1 border-2 border-black">{val}rem</span>
        </div>
        <input 
          type="range" min={min} max={max} step="0.1" 
          value={val} 
          onChange={e => setData({...data, styles: {...data.styles, [field]: e.target.value + 'rem'}})}
          className="w-full h-2 bg-black accent-black cursor-pointer appearance-none border-2 border-black"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-12 pb-40 text-left">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-6 gap-6">
        <div>
          <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none mb-2">Brand Identity</h1>
          <p className="text-[#06D6A0] bg-black inline-block px-2 py-1 border-2 border-black font-mono font-black uppercase text-[10px] tracking-[0.2em] mt-2">SYS.AESTHETICS</p>
        </div>
        <button onClick={syncAll} className="w-full md:w-auto bg-[#06D6A0] text-black border-8 border-black px-8 py-4 font-black uppercase shadow-[8px_8px_0px_black] hover:bg-[#FFD166] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_black] transition-all text-xl">
          Publish to Live
        </button>
      </header>

      <div className="space-y-12">
        
        {/* 🎬 1. HERO STAGE */}
        <div className="bg-[#FFF9F0] border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_#06D6A0] flex flex-col lg:flex-row gap-12">
          
          {/* Hero Form */}
          <div className="flex-1 space-y-8">
            <div className="border-b-8 border-black pb-4 mb-4 flex items-center">
               <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black bg-[#06D6A0] px-4 py-2 border-4 border-black inline-block">Mainstage Hero</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Slider label="Master Title Size" field="hTitleSize" max={18} />
              <Slider label="Subtitle Size" field="hTaglineSize" max={6} />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black">Primary Title</label>
                <input className="w-full bg-white border-4 border-black p-5 font-black text-2xl uppercase tracking-tighter shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 focus:border-black outline-none transition-all" placeholder="MAIN TITLE" value={data.headerTitle || ""} onChange={e => setData({...data, headerTitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black">The Tagline</label>
                <textarea className="w-full bg-white border-4 border-black p-5 font-bold text-lg h-32 resize-none shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 focus:border-black outline-none transition-all" placeholder="Hero Tagline" value={data.headerTagline || ""} onChange={e => setData({...data, headerTagline: e.target.value})} />
              </div>
            </div>
            
            {/* Noir Toggle */}
            <div className="flex items-center gap-4 p-4 bg-[#2D2D2D] text-white border-4 border-black shadow-[4px_4px_0px_black]">
              <input 
                type="checkbox" 
                checked={data.heroGrayscale !== false} 
                onChange={e => setData({...data, heroGrayscale: e.target.checked})} 
                className="w-6 h-6 accent-[#FFD166] cursor-pointer" 
              />
              <label className="text-[10px] font-mono font-black uppercase tracking-widest">Noir Mode (B&W Filter on Hero)</label>
            </div>
          </div>

          {/* Hero Image Dropper */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
             <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black">Hero Backdrop</label>
             <div className="flex-1 bg-black border-8 border-[#06D6A0] flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:border-[#FFD166] transition-colors relative group min-h-[300px]">
                {data.headerImageUrl ? (
                   <img src={data.headerImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Hero" />
                ) : (
                   <span className="font-black font-mono uppercase opacity-50 text-[#06D6A0] text-2xl tracking-tighter">NO_BACKDROP</span>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="bg-[#06D6A0] text-black px-6 py-3 font-black uppercase tracking-widest text-[10px] border-4 border-black shadow-[4px_4px_0px_black]">
                     UPLOAD VISUAL
                   </span>
                </div>
                <input type="file" onChange={(e) => handleUpload(e, "headerImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
             </div>
          </div>
        </div>

        {/* 🎭 MIDDLE ROW: DIRECTORATE & CONNECT */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          {/* DIRECTORATE HUB */}
          <div className="bg-[#FFF9F0] border-8 border-black p-8 md:p-10 shadow-[16px_16px_0px_#FFD166] flex flex-col h-full space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-8 border-black pb-4 gap-4">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black bg-[#FFD166] px-4 py-2 border-4 border-black inline-block">Directorate</h2>
              <div className="flex flex-wrap gap-2">
                {['founder', 'coFounder1', 'coFounder2'].map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 border-4 border-black font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-black text-[#FFD166] shadow-none translate-y-1' : 'bg-white shadow-[4px_4px_0px_black] hover:bg-gray-100 hover:translate-y-1 hover:shadow-none'}`}>
                    {i === 0 ? 'Founder' : `Core ${i}`}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <input className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xl shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" placeholder="DIRECTOR NAME" value={data[`${activeTab}Name`] || ""} onChange={e => setData({...data, [`${activeTab}Name`]: e.target.value})} />
              <textarea className="w-full bg-white border-4 border-black p-4 font-bold h-32 resize-none shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" placeholder="Director's Message or Vision" value={data[`${activeTab}Note`] || ""} onChange={e => setData({...data, [`${activeTab}Note`]: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                 <input className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" placeholder="IG URL" value={data[`${activeTab}Instagram`] || ""} onChange={e => setData({...data, [`${activeTab}Instagram`]: e.target.value})} />
                 <input className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" placeholder="LINKEDIN URL" value={data[`${activeTab}Linkedin`] || ""} onChange={e => setData({...data, [`${activeTab}Linkedin`]: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-[#FFD166] border-4 border-black w-full mt-4 shadow-[8px_8px_0px_black]">
               <Preview url={data[`${activeTab}Image`]} loading={uploading === `${activeTab}Image`} />
               <div className="flex flex-col gap-2 w-full">
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black">Portrait Link</label>
                  <label className="bg-black text-[#FFD166] px-4 py-2 font-black uppercase text-[10px] cursor-pointer hover:bg-gray-800 transition-colors w-max border-2 border-black">
                    UPLOAD
                    <input type="file" onChange={(e) => handleUpload(e, `${activeTab}Image`)} className="hidden" />
                  </label>
               </div>
            </div>
          </div>

          {/* GLOBAL CONNECT HUB */}
          <div className="bg-[#FFF9F0] border-8 border-black p-8 md:p-10 shadow-[16px_16px_0px_#FF5F5F] flex flex-col h-full space-y-6">
            <div className="border-b-8 border-black pb-4">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black bg-[#FF5F5F] px-4 py-2 border-4 border-black inline-block">Global Connect</h2>
            </div>
            
            <div className="space-y-8 flex-1">
              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-black uppercase text-black bg-[#FF5F5F] inline-block px-2 py-1 tracking-widest border-2 border-black">HQ Data</h3>
                <input placeholder="PHYSICAL ADDRESS" className="w-full bg-white border-4 border-black p-3 font-bold text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.address || ""} onChange={e => setData({...data, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="PHONE NUMBER" className="w-full bg-white border-4 border-black p-3 font-bold text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.phone || ""} onChange={e => setData({...data, phone: e.target.value})} />
                  <input placeholder="OFFICIAL EMAIL" className="w-full bg-white border-4 border-black p-3 font-bold text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.email || ""} onChange={e => setData({...data, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-mono font-black uppercase text-black bg-[#06D6A0] inline-block px-2 py-1 tracking-widest border-2 border-black">Social Matrix</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="IG URL" className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.instagram || ""} onChange={e => setData({...data, instagram: e.target.value})} />
                  <input placeholder="YT URL" className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.youtube || ""} onChange={e => setData({...data, youtube: e.target.value})} />
                  <input placeholder="IN URL" className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.linkedin || ""} onChange={e => setData({...data, linkedin: e.target.value})} />
                  <input placeholder="X URL" className="w-full bg-white border-4 border-black p-3 font-mono text-[10px] shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.twitter || ""} onChange={e => setData({...data, twitter: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t-8 border-black">
                <h3 className="text-[10px] font-mono font-black uppercase text-black bg-white inline-block px-2 py-1 tracking-widest border-2 border-black">Dev Credit</h3>
                <input placeholder="CURATOR NAME" className="w-full bg-white border-4 border-black p-3 font-bold text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" value={data.curatorName || ""} onChange={e => setData({...data, curatorName: e.target.value})} />
              </div>
            </div>
          </div>

        </div>

        {/* 📟 BOTTOM ROW: STAGE CUES (Ticker) */}
        <div className="bg-[#2D2D2D] border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_white] text-white flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
          <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[#06D6A0]">News Ticker</h2>
            <p className="text-[10px] font-mono font-black uppercase tracking-widest bg-black text-[#FF5F5F] inline-block px-2 py-1 border-2 border-black">Scrolling Marquee Config</p>
          </div>
          
          <div className="flex-1 w-full space-y-4 relative z-10">
            <div className="flex items-center gap-4 justify-center md:justify-start bg-black p-4 border-4 border-white inline-flex">
              <input 
                type="checkbox" 
                checked={data.showTicker || false} 
                onChange={e => setData({...data, showTicker: e.target.checked})}
                className="w-6 h-6 accent-[#06D6A0] cursor-pointer"
              />
              <span className="font-mono font-black uppercase tracking-widest text-[10px]">TICKER_ACTIVE</span>
            </div>
            <textarea 
              className="w-full bg-black border-4 border-white p-5 font-mono text-sm md:text-base focus:border-[#06D6A0] outline-none text-[#06D6A0] h-32 resize-none shadow-[6px_6px_0px_white] focus:shadow-none focus:translate-y-1 focus:translate-x-1 transition-all" 
              placeholder="TYPE TICKER CONTENT HERE..." 
              value={data.tickerText || ""} 
              onChange={e => setData({...data, tickerText: e.target.value})} 
            />
          </div>
        </div>

      </div>
    </div>
  );
}