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
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-2xl border-4 border-[var(--border-primary)] overflow-hidden bg-gray-200 flex items-center justify-center shadow-[4px_4px_0px_var(--border-primary)] shrink-0">
      {loading ? (
        <div className="animate-spin text-2xl font-black">⏳</div>
      ) : url ? (
        <img src={url} className="w-full h-full object-cover" alt="Preview" />
      ) : (
        <span className="text-[10px] font-black opacity-30 uppercase text-center p-2">No Visual</span>
      )}
    </div>
  );

  // 📏 Reusable Slider Control
  const Slider = ({ label, field, min = 1, max = 15 }: any) => {
    const val = data.styles?.[field] ? parseFloat(data.styles[field]) : 4;
    return (
      <div className="flex flex-col gap-3 bg-gray-50 p-4 md:p-6 rounded-2xl border-2 border-[var(--border-primary)] w-full">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</label>
          <span className="text-[10px] font-black bg-[var(--border-primary)] text-[var(--bg-primary)] px-3 py-1 rounded-md">{val}rem</span>
        </div>
        <input 
          type="range" min={min} max={max} step="0.1" 
          value={val} 
          onChange={e => setData({...data, styles: {...data.styles, [field]: e.target.value + 'rem'}})}
          className="w-full h-2 bg-[var(--border-primary)]/20 accent-[#06D6A0] cursor-pointer appearance-none rounded-full"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-12 pb-40 text-left">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-[var(--border-primary)] pb-6 gap-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[var(--text-primary)]">Brand Identity</h1>
          <p className="text-[#FF5F5F] font-black uppercase text-[10px] tracking-[0.4em] mt-2">Swaang Aesthetic Blueprint</p>
        </div>
        <button onClick={syncAll} className="w-full md:w-auto bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] px-8 py-4 font-black uppercase rounded-2xl shadow-[6px_6px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border-primary)] transition-all text-xl">
          Publish Identity to Live
        </button>
      </header>

      <div className="space-y-12">
        
        {/* 🎬 1. HERO STAGE (Massive Top Section) */}
        <div className="bg-white border-4 border-[var(--border-primary)] rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_#06D6A0] flex flex-col lg:flex-row gap-12">
          
          {/* Hero Form */}
          <div className="flex-1 space-y-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest border-b-4 border-dashed border-[var(--border-primary)]/20 pb-4 text-[#06D6A0]">Mainstage Hero</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Slider label="Master Title Size" field="hTitleSize" max={18} />
              <Slider label="Subtitle Size" field="hTaglineSize" max={6} />
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">Primary Title</label>
                <input className="w-full border-4 border-[var(--border-primary)] p-5 font-black text-2xl uppercase tracking-tighter rounded-2xl focus:border-[#06D6A0] outline-none" placeholder="MAIN TITLE" value={data.headerTitle || ""} onChange={e => setData({...data, headerTitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-2">The Tagline</label>
                <textarea className="w-full border-4 border-[var(--border-primary)] p-5 font-bold text-lg rounded-2xl h-32 focus:border-[#06D6A0] outline-none resize-none" placeholder="Hero Tagline" value={data.headerTagline || ""} onChange={e => setData({...data, headerTagline: e.target.value})} />
              </div>
            </div>
            
            {/* Noir Toggle */}
            <div className="flex items-center gap-4 p-4 bg-[var(--bg-primary)] border-4 border-[var(--border-primary)] rounded-2xl">
              <input 
                type="checkbox" 
                checked={data.heroGrayscale !== false} 
                onChange={e => setData({...data, heroGrayscale: e.target.checked})} 
                className="w-6 h-6 accent-[#06D6A0] cursor-pointer" 
              />
              <label className="text-xs font-black uppercase tracking-widest">Noir Mode (Black & White Filter on Hero)</label>
            </div>
          </div>

          {/* Hero Image Dropper */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4">
             <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Hero Backdrop</label>
             <div className="flex-1 bg-[var(--bg-primary)] border-4 border-dashed border-[var(--border-primary)] rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors relative group min-h-[300px]">
                {data.headerImageUrl ? (
                   <img src={data.headerImageUrl} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" alt="Hero" />
                ) : (
                   <span className="font-black uppercase opacity-20 text-2xl tracking-tighter">No Backdrop</span>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                   <span className="bg-[#06D6A0] text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs border-2 border-white shadow-[2px_2px_0px_white]">
                     Upload High-Res Visual
                   </span>
                </div>
                <input type="file" onChange={(e) => handleUpload(e, "headerImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
             </div>
          </div>
        </div>

        {/* 🎭 MIDDLE ROW: DIRECTORATE & CONNECT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* DIRECTORATE HUB */}
          <div className="bg-white border-4 border-[var(--border-primary)] rounded-[3rem] p-8 md:p-10 shadow-[12px_12px_0px_#FFD166] flex flex-col h-full space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-[var(--border-primary)] pb-4 gap-4">
              <h2 className="text-2xl font-black uppercase tracking-widest text-[var(--text-primary)]">Directorate</h2>
              <div className="flex flex-wrap gap-2">
                {['founder', 'coFounder1', 'coFounder2'].map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 border-2 border-[var(--border-primary)] rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[var(--border-primary)] text-white shadow-[4px_4px_0px_gray]' : 'bg-gray-50 hover:bg-gray-200'}`}>
                    {i === 0 ? 'Founder' : `Core ${i}`}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              <input className="w-full border-4 border-[var(--border-primary)] p-4 font-black uppercase text-xl rounded-2xl focus:border-[#FFD166] outline-none" placeholder="Director Name" value={data[`${activeTab}Name`] || ""} onChange={e => setData({...data, [`${activeTab}Name`]: e.target.value})} />
              <textarea className="w-full border-4 border-[var(--border-primary)] p-4 font-bold rounded-2xl h-32 resize-none focus:border-[#FFD166] outline-none" placeholder="Director's Message or Vision" value={data[`${activeTab}Note`] || ""} onChange={e => setData({...data, [`${activeTab}Note`]: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                 <input className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#FFD166] outline-none" placeholder="Instagram URL" value={data[`${activeTab}Instagram`] || ""} onChange={e => setData({...data, [`${activeTab}Instagram`]: e.target.value})} />
                 <input className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#FFD166] outline-none" placeholder="LinkedIn URL" value={data[`${activeTab}Linkedin`] || ""} onChange={e => setData({...data, [`${activeTab}Linkedin`]: e.target.value})} />
              </div>
            </div>

            <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border-4 border-dashed border-[var(--border-primary)]/20 w-full mt-4">
               <Preview url={data[`${activeTab}Image`]} loading={uploading === `${activeTab}Image`} />
               <div className="flex flex-col gap-2 w-full">
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-widest">Director Portrait</label>
                  <label className="bg-[var(--border-primary)] text-white px-4 py-2 rounded-lg font-black uppercase text-[10px] cursor-pointer hover:bg-gray-800 transition-colors w-max">
                    Upload New
                    <input type="file" onChange={(e) => handleUpload(e, `${activeTab}Image`)} className="hidden" />
                  </label>
               </div>
            </div>
          </div>

          {/* GLOBAL CONNECT HUB */}
          <div className="bg-white border-4 border-[var(--border-primary)] rounded-[3rem] p-8 md:p-10 shadow-[12px_12px_0px_#FF5F5F] flex flex-col h-full space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest border-b-4 border-[var(--border-primary)] pb-4 text-[var(--text-primary)]">Global Connect</h2>
            
            <div className="space-y-8 flex-1">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-[#FF5F5F] tracking-widest">HQ Information</h3>
                <input placeholder="Physical Address" className="w-full border-4 border-[var(--border-primary)] p-3 font-bold rounded-xl text-sm focus:border-[#FF5F5F] outline-none" value={data.address || ""} onChange={e => setData({...data, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Phone Number" className="w-full border-4 border-[var(--border-primary)] p-3 font-bold rounded-xl text-sm focus:border-[#FF5F5F] outline-none" value={data.phone || ""} onChange={e => setData({...data, phone: e.target.value})} />
                  <input placeholder="Official Email" className="w-full border-4 border-[var(--border-primary)] p-3 font-bold rounded-xl text-sm focus:border-[#FF5F5F] outline-none" value={data.email || ""} onChange={e => setData({...data, email: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-[#06D6A0] tracking-widest">Digital Presence (Socials)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Instagram URL" className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#06D6A0] outline-none" value={data.instagram || ""} onChange={e => setData({...data, instagram: e.target.value})} />
                  <input placeholder="YouTube URL" className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#06D6A0] outline-none" value={data.youtube || ""} onChange={e => setData({...data, youtube: e.target.value})} />
                  <input placeholder="LinkedIn URL" className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#06D6A0] outline-none" value={data.linkedin || ""} onChange={e => setData({...data, linkedin: e.target.value})} />
                  <input placeholder="Twitter URL" className="w-full border-2 border-[var(--border-primary)] p-3 font-mono text-[10px] rounded-xl focus:border-[#06D6A0] outline-none" value={data.twitter || ""} onChange={e => setData({...data, twitter: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t-4 border-dashed border-[var(--border-primary)]/20">
                <h3 className="text-[10px] font-black uppercase text-[#FFD166] tracking-widest">Developer Credit</h3>
                <input placeholder="Curator (e.g. Arpan Singh)" className="w-full border-4 border-[var(--border-primary)] p-3 font-bold rounded-xl text-sm focus:border-[#FFD166] outline-none" value={data.curatorName || ""} onChange={e => setData({...data, curatorName: e.target.value})} />
              </div>
            </div>
          </div>

        </div>

        {/* 📟 BOTTOM ROW: STAGE CUES (Ticker) */}
        <div className="bg-[#2D2D2D] border-8 border-[var(--border-primary)] rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_white] text-white flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#06D6A0]">Monochrome Film Strip</h2>
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-[#FF5F5F]">The scrolling ticker at the bottom of the mainstage.</p>
          </div>
          
          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <input 
                type="checkbox" 
                checked={data.showTicker || false} 
                onChange={e => setData({...data, showTicker: e.target.checked})}
                className="w-8 h-8 accent-[#06D6A0] cursor-pointer"
              />
              <span className="font-black uppercase tracking-widest text-xl">Enable Ticker</span>
            </div>
            <textarea 
              className="w-full bg-black/40 border-4 border-white/20 p-5 font-mono text-sm md:text-base rounded-2xl focus:border-[#06D6A0] outline-none text-[#FFF9F0] h-32 resize-none" 
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