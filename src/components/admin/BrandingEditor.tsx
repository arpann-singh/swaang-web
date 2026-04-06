"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function BrandingEditor() {
  const [data, setData] = useState<any>({ styles: {} });
  const [aotm, setAotm] = useState<any>({});
  const [activeTab, setActiveTab] = useState("founder");
  const [uploading, setUploading] = useState("");

  // 🎭 Load all stage data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      const homeDoc = await getDoc(doc(db, "settings", "homepage"));
      const spotlightDoc = await getDoc(doc(db, "settings", "aotm"));
      if (homeDoc.exists()) setData(homeDoc.data());
      if (spotlightDoc.exists()) setAotm(spotlightDoc.data());
    };
    fetchAllData();
  }, []);

  // 🚀 Sync everything to Firebase
  const syncAll = async () => {
    try {
      await updateDoc(doc(db, "settings", "homepage"), data);
      await updateDoc(doc(db, "settings", "aotm"), aotm);
      alert("Full Stage Identity, Typography, and Cues Synced! 🎭");
    } catch (err) {
      alert("Sync Error: " + err);
    }
  };

  // 📸 ImgBB Upload Logic
  const handleUpload = async (e: any, field: string, isAotm = false) => {
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
        const url = resData.data.url;
        if (isAotm) setAotm({ ...aotm, [field]: url });
        else setData({ ...data, [field]: url });
      }
    } catch (err) {
      alert("Upload Failed. Check API Key.");
    } finally {
      setUploading("");
    }
  };

  // 🖼️ Reusable Preview Component
  const Preview = ({ url, loading }: { url: string; loading: boolean }) => (
    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl border-4 border-black overflow-hidden bg-gray-200 flex items-center justify-center shadow-[2px_2px_0px_black] md:shadow-[4px_4px_0px_black] shrink-0">
      {loading ? (
        <div className="animate-spin text-xl font-black">⏳</div>
      ) : url ? (
        <img src={url} className="w-full h-full object-cover" alt="Preview" />
      ) : (
        <span className="text-[8px] font-black opacity-30 uppercase text-center p-1">No Photo</span>
      )}
    </div>
  );

  // 📏 Reusable Slider Control
  const Slider = ({ label, field, min = 1, max = 15 }: any) => {
    const val = data.styles?.[field] ? parseFloat(data.styles[field]) : 4;
    return (
      <div className="flex flex-col gap-2 bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-black/5 w-full">
        <div className="flex justify-between items-center">
          <label className="text-[9px] md:text-[10px] font-black uppercase opacity-40">{label}</label>
          <span className="text-[9px] md:text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded">{val}rem</span>
        </div>
        <input 
          type="range" min={min} max={max} step="0.1" 
          value={val} 
          onChange={e => setData({...data, styles: {...data.styles, [field]: e.target.value + 'rem'}})}
          className="w-full h-1.5 bg-black/10 accent-[#FF5F5F] cursor-pointer appearance-none rounded-full"
        />
      </div>
    );
  };

  return (
    <div className="p-0 md:p-4 w-full max-w-full overflow-x-hidden space-y-8 md:space-y-12 pb-40">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-8 border-black pb-6 md:pb-8 gap-4 md:gap-6">
        <div>
          <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter">Master Hub</h1>
          <p className="text-[#FF5F5F] font-bold uppercase text-[9px] md:text-[10px] tracking-[0.4em]">Swaang Identity Control</p>
        </div>
        <button onClick={syncAll} className="w-full md:w-auto bg-[#06D6A0] border-4 border-black px-8 py-4 font-black uppercase rounded-xl md:rounded-2xl shadow-[4px_4px_0px_black] md:shadow-[8px_8px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm md:text-xl">
          Sync Stage
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        
        {/* 🎬 1. HERO STAGE */}
        <div className="bg-white border-4 border-black rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-[6px_6px_0px_#06D6A0] md:shadow-[12px_12px_0px_#06D6A0] space-y-4 md:space-y-6 max-w-full">
          <h2 className="text-xl md:text-2xl font-black uppercase border-b-4 border-black pb-2 text-[#06D6A0]">Hero Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Slider label="Title Size" field="hTitleSize" max={18} />
            <Slider label="Tagline Size" field="hTaglineSize" max={6} />
          </div>
          <input className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" placeholder="Main Title" value={data.headerTitle || ""} onChange={e => setData({...data, headerTitle: e.target.value})} />
          <textarea className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl h-24 text-sm" placeholder="Hero Tagline" value={data.headerTagline || ""} onChange={e => setData({...data, headerTagline: e.target.value})} />
          
          {/* 🔥 NEW: Noir Mode / Grayscale Filter Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl">
            <input 
              type="checkbox" 
              checked={data.heroGrayscale !== false} 
              onChange={e => setData({...data, heroGrayscale: e.target.checked})} 
              className="w-5 h-5 accent-[#06D6A0] cursor-pointer" 
            />
            <label className="text-[10px] font-black uppercase opacity-60">Noir Mode (Black & White Filter)</label>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border-2 border-black w-full overflow-hidden">
             <Preview url={data.headerImageUrl} loading={uploading === 'headerImageUrl'} />
             <div className="flex flex-col gap-1 w-full">
                <label className="text-[10px] font-black uppercase opacity-50">Hero Image</label>
                <input type="file" onChange={(e) => handleUpload(e, "headerImageUrl")} className="text-[9px] md:text-[10px] w-full max-w-full" />
             </div>
          </div>
        </div>

        {/* 🔦 2. SPOTLIGHT HUB */}
        <div className="bg-white border-4 border-black rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-[6px_6px_0px_#FF5F5F] md:shadow-[12px_12px_0px_#FF5F5F] space-y-4 max-w-full">
          <h2 className="text-xl md:text-2xl font-black uppercase border-b-4 border-black pb-2 text-[#FF5F5F]">Spotlight Hub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="border-2 border-black p-3 font-bold rounded-xl text-sm w-full" placeholder="Full Name" value={aotm.name || ""} onChange={e => setAotm({...aotm, name: e.target.value})} />
            <input className="border-2 border-black p-3 font-bold rounded-xl text-sm w-full" placeholder="Core Role" value={aotm.role || ""} onChange={e => setAotm({...aotm, role: e.target.value})} />
          </div>
          <textarea className="w-full border-2 border-black p-3 font-bold rounded-xl h-20 text-sm" placeholder="Citation" value={aotm.citation || ""} onChange={e => setAotm({...aotm, citation: e.target.value})} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="border-2 border-black p-3 font-bold rounded-xl text-sm w-full" placeholder="Achievement" value={aotm.achievement || ""} onChange={e => setAotm({...aotm, achievement: e.target.value})} />
            <input className="border-2 border-black p-3 font-bold rounded-xl text-sm w-full" placeholder="Impact" value={aotm.impact || ""} onChange={e => setAotm({...aotm, impact: e.target.value})} />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border-2 border-black w-full overflow-hidden">
             <Preview url={aotm.photo} loading={uploading === 'photo'} />
             <div className="flex flex-col gap-1 w-full">
                <label className="text-[10px] font-black uppercase opacity-50">Portrait Upload</label>
                <input type="file" onChange={(e) => handleUpload(e, "photo", true)} className="text-[9px] md:text-[10px] w-full max-w-full" />
             </div>
          </div>
          <input className="w-full border-2 border-black p-3 font-mono text-xs rounded-xl" placeholder="Contributions URL" value={aotm.link || ""} onChange={e => setAotm({...aotm, link: e.target.value})} />
        </div>

        {/* 📟 3. STAGE CUES */}
        <div className="bg-[#2D2D2D] border-4 border-black rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-[6px_6px_0px_white] md:shadow-[12px_12px_0px_white] text-white space-y-4 md:space-y-6 max-w-full">
          <div className="flex justify-between items-center border-b border-white/20 pb-2">
            <h2 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#06D6A0]">Backstage Cues</h2>
            <input 
              type="checkbox" 
              checked={data.showTicker || false} 
              onChange={e => setData({...data, showTicker: e.target.checked})}
              className="w-5 h-5 md:w-6 md:h-6 accent-[#06D6A0] cursor-pointer"
            />
          </div>
          <p className="text-[9px] md:text-[10px] font-bold opacity-50 uppercase tracking-widest italic text-[#FF5F5F]">Display active notices in the Monochrome Film Strip</p>
          <textarea 
            className="w-full bg-black/30 border-2 border-white/10 p-3 md:p-4 font-mono text-xs md:text-sm rounded-xl focus:border-[#06D6A0] outline-none text-[#FFF9F0] h-24" 
            placeholder="TYPE NOTICE CUE HERE..." 
            value={data.tickerText || ""} 
            onChange={e => setData({...data, tickerText: e.target.value})} 
          />
        </div>

        {/* 🎭 4. DIRECTORATE HUB */}
        <div className="bg-white border-4 border-black rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-[6px_6px_0px_#FFD166] md:shadow-[12px_12px_0px_#FFD166] space-y-4 md:space-y-6 max-w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-3 md:pb-2 text-[#2D2D2D] gap-3">
            <h2 className="text-xl md:text-2xl font-black uppercase">Directorate</h2>
            <div className="flex flex-wrap gap-1">
              {['founder', 'coFounder1', 'coFounder2'].map((tab, i) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 md:px-4 py-2 border-2 border-black rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase transition-all ${activeTab === tab ? 'bg-black text-white shadow-[2px_2px_0px_gray] md:shadow-[4px_4px_0px_gray]' : 'bg-gray-100'}`}>
                  {i === 0 ? 'Founder' : `C${i}`}
                </button>
              ))}
            </div>
          </div>
          <input className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" placeholder="Director Name" value={data[`${activeTab}Name`] || ""} onChange={e => setData({...data, [`${activeTab}Name`]: e.target.value})} />
          <textarea className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl h-24 md:h-32 text-sm" placeholder="Director Message" value={data[`${activeTab}Note`] || ""} onChange={e => setData({...data, [`${activeTab}Note`]: e.target.value})} />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border-2 border-black w-full overflow-hidden">
             <Preview url={data[`${activeTab}Image`]} loading={uploading === `${activeTab}Image`} />
             <div className="flex flex-col gap-1 w-full">
                <label className="text-[10px] font-black uppercase opacity-50">Upload Photo</label>
                <input type="file" onChange={(e) => handleUpload(e, `${activeTab}Image`)} className="text-[9px] md:text-[10px] w-full max-w-full" />
             </div>
          </div>
        </div>

        {/* 📍 5. CONNECT HUB */}
        <div className="bg-white border-4 border-black rounded-[2rem] md:rounded-[3rem] p-5 md:p-8 shadow-[6px_6px_0px_#2D2D2D] md:shadow-[12px_12px_0px_#2D2D2D] lg:col-span-2 space-y-6 md:space-y-8 max-w-full">
          <h2 className="text-2xl md:text-3xl font-black uppercase border-b-4 border-black pb-4">Global Connect Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black uppercase text-[#FF5F5F]">Contact</h3>
              <input placeholder="Address" className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" value={data.address || ""} onChange={e => setData({...data, address: e.target.value})} />
              <input placeholder="Phone" className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" value={data.phone || ""} onChange={e => setData({...data, phone: e.target.value})} />
              <input placeholder="Email" className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" value={data.email || ""} onChange={e => setData({...data, email: e.target.value})} />
            </div>
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black uppercase text-[#06D6A0]">Socials</h3>
              <input placeholder="Instagram" className="w-full border-2 border-black p-3 md:p-4 font-mono text-[10px] md:text-xs rounded-xl" value={data.instagram || ""} onChange={e => setData({...data, instagram: e.target.value})} />
              <input placeholder="YouTube" className="w-full border-2 border-black p-3 md:p-4 font-mono text-[10px] md:text-xs rounded-xl" value={data.youtube || ""} onChange={e => setData({...data, youtube: e.target.value})} />
              <input placeholder="LinkedIn" className="w-full border-2 border-black p-3 md:p-4 font-mono text-[10px] md:text-xs rounded-xl" value={data.linkedin || ""} onChange={e => setData({...data, linkedin: e.target.value})} />
              <input placeholder="Twitter" className="w-full border-2 border-black p-3 md:p-4 font-mono text-[10px] md:text-xs rounded-xl" value={data.twitter || ""} onChange={e => setData({...data, twitter: e.target.value})} />
            </div>
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-[10px] md:text-xs font-black uppercase text-[#FFD166]">Developer</h3>
              <input placeholder="Curator (e.g. Arpan Singh)" className="w-full border-2 border-black p-3 md:p-4 font-bold rounded-xl text-sm" value={data.curatorName || ""} onChange={e => setData({...data, curatorName: e.target.value})} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}