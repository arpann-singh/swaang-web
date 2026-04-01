"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";

const BrandingEditor = () => {
  const [homeData, setHomeData] = useState<any>({ styles: {} });
  const [footerData, setFooterData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ founder: false, hero: false });

  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0"; // 👈 PASTE YOUR KEY HERE

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, "settings", "homepage"), (d) => {
      if (d.exists()) setHomeData(d.data());
    });
    const unsubFooter = onSnapshot(doc(db, "settings", "footer"), (d) => {
      if (d.exists()) setFooterData(d.data());
      setLoading(false);
    });
    return () => { unsubHome(); unsubFooter(); };
  }, []);

  const updateNested = (section: string, field: string, value: any) => {
    setHomeData({
      ...homeData,
      [section]: { ...homeData[section], [field]: value }
    });
  };

  const handleFileUpload = async (e: any, type: 'founder' | 'hero') => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading({ ...uploading, [type]: true });
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: body,
      });
      const resData = await res.json();
      if (resData.success) {
        const field = type === 'founder' ? 'founderPhoto' : 'headerImageUrl';
        setHomeData({ ...homeData, [field]: resData.data.url });
        alert(`${type.toUpperCase()} Media Synced! 📸`);
      }
    } catch (err) { alert("Upload failed."); } finally { setUploading({ ...uploading, [type]: false }); }
  };

  const handleSave = async (e: any, collection: string, data: any) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "settings", collection), data);
      alert(`${collection.toUpperCase()} Identity Published! 🎭`);
    } catch (err) { alert("Error syncing assets."); }
  };

  const FontSlider = ({ section, field, label, max = 15 }: any) => {
    const currentValue = parseFloat(homeData[section]?.[field + 'Size']) || 1;
    return (
      <div className="bg-[#FFF9F0] p-4 rounded-2xl border-2 border-[#2D2D2D] space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-black uppercase text-[#FF5F5F] tracking-tighter">{label} Size</label>
          <span className="text-[10px] font-black">{currentValue}rem</span>
        </div>
        <input type="range" min="0.5" max={max} step="0.1" value={currentValue} onChange={(e) => updateNested(section, field + 'Size', e.target.value + 'rem')} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5F5F]" />
        <select value={homeData[section]?.[field + 'Font'] || 'font-cinzel'} onChange={(e) => updateNested(section, field + 'Font', e.target.value)} className="w-full border-2 border-[#2D2D2D] rounded-lg text-[9px] p-1 font-black uppercase">
          <option value="font-cinzel">Cinzel (Drama)</option>
          <option value="font-sans">Inter (Sans)</option>
        </select>
      </div>
    );
  };

  if (loading) return <div className="p-10 font-black animate-pulse">Syncing Social Riggings...</div>;

  return (
    <div className="space-y-12 pb-24">
      <div className="border-b-4 border-[#2D2D2D] pb-6">
        <h1 className="text-5xl font-black uppercase text-[#2D2D2D]">Identity Hub</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2">The Face of Swaang</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* --- HERO STAGE --- */}
        <form onSubmit={(e) => handleSave(e, "homepage", homeData)} className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3.5rem] shadow-[15px_15px_0px_#2D2D2D] space-y-8">
          <h3 className="text-xl font-black uppercase bg-[#FF5F5F] text-white px-4 py-1 rounded-lg inline-block">Hero Stage</h3>
          <div className="space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="Title" value={homeData.headerTitle || ""} onChange={e => setHomeData({...homeData, headerTitle: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-black text-2xl uppercase" />
              <FontSlider section="styles" field="heroTitle" label="Main Title" max={15} />
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Tagline" value={homeData.headerSub || ""} onChange={e => setHomeData({...homeData, headerSub: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-bold" />
              <FontSlider section="styles" field="heroSub" label="Sub Tagline" max={5} />
            </div>
          </div>
          <div className="pt-6 border-t-2 border-dashed space-y-4">
             <input type="text" placeholder="Video URL (.mp4)" value={homeData.headerVideoUrl || ""} onChange={e => setHomeData({...homeData, headerVideoUrl: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-xs" />
             <div className="relative group w-full h-24 bg-[#FFF9F0] border-4 border-dashed border-[#2D2D2D] rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer shadow-[6px_6px_0px_#2D2D2D]">
                {homeData.headerImageUrl ? <img src={homeData.headerImageUrl} className="h-full w-full object-cover" /> : <span className="text-[10px] font-black opacity-30">{uploading.hero ? "..." : "Hero Photo"}</span>}
                <input type="file" onChange={(e) => handleFileUpload(e, 'hero')} className="absolute inset-0 opacity-0 cursor-pointer" />
             </div>
          </div>
          <button type="submit" className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-5 rounded-2xl font-black uppercase shadow-[8px_8px_0px_#2D2D2D]">Publish Hero</button>
        </form>

        <div className="space-y-12">
          {/* --- FOUNDER HUB --- */}
          <form onSubmit={(e) => handleSave(e, "homepage", homeData)} className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3.5rem] shadow-[15px_15px_0px_#FFD166] space-y-6">
            <h3 className="text-xl font-black uppercase bg-[#FFD166] text-[#2D2D2D] px-4 py-1 rounded-lg inline-block">Founder Hub</h3>
            <div className="flex gap-6 items-center">
              <div className="relative group w-32 h-44 bg-[#FFF9F0] border-4 border-dashed border-[#2D2D2D] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center cursor-pointer shadow-[6px_6px_0px_#2D2D2D]">
                {homeData.founderPhoto ? <img src={homeData.founderPhoto} className="h-full w-full object-cover" /> : <span className="text-[8px] font-black opacity-30">Photo</span>}
                <input type="file" onChange={(e) => handleFileUpload(e, 'founder')} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div className="flex-1 space-y-3">
                <input type="text" placeholder="Name" value={homeData.founderName || ""} onChange={e => setHomeData({...homeData, founderName: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-black" />
                <FontSlider section="styles" field="founderName" label="Name Text" max={5} />
              </div>
            </div>
            <textarea placeholder="Founder Note" value={homeData.founderNote || ""} onChange={e => setHomeData({...homeData, founderNote: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 rounded-xl font-medium h-32" />
            <FontSlider section="styles" field="founderNote" label="Note Content" max={6} />
            <button type="submit" className="w-full bg-[#FFD166] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase shadow-[8px_8px_0px_#2D2D2D]">Sync Founder</button>
          </form>

          {/* --- ENHANCED CONNECT HUB (SOCIALS) --- */}
          <form onSubmit={(e) => handleSave(e, "footer", footerData)} className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3.5rem] shadow-[15px_15px_0px_#06D6A0] space-y-6">
            <h3 className="text-xl font-black uppercase bg-[#06D6A0] text-[#2D2D2D] px-4 py-1 rounded-lg inline-block">Connect Hub</h3>
            <div className="space-y-4">
              <textarea placeholder="Address" value={footerData.address || ""} onChange={e => setFooterData({...footerData, address: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-3 rounded-xl font-bold h-20 text-xs" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Phone" value={footerData.phone || ""} onChange={e => setFooterData({...footerData, phone: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-[10px]" />
                <input type="text" placeholder="Email" value={footerData.email || ""} onChange={e => setFooterData({...footerData, email: e.target.value})} className="border-2 border-[#2D2D2D] p-3 rounded-xl font-bold text-[10px]" />
              </div>
            </div>
            
            <div className="pt-4 border-t-2 border-dashed border-[#2D2D2D]/20 space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Social Media Links</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Instagram URL" value={footerData.instagram || ""} onChange={e => setFooterData({...footerData, instagram: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg font-bold text-[9px] bg-[#FFF9F0]" />
                <input type="text" placeholder="YouTube URL" value={footerData.youtube || ""} onChange={e => setFooterData({...footerData, youtube: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg font-bold text-[9px] bg-[#FFF9F0]" />
                <input type="text" placeholder="Twitter URL" value={footerData.twitter || ""} onChange={e => setFooterData({...footerData, twitter: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg font-bold text-[9px] bg-[#FFF9F0]" />
                <input type="text" placeholder="LinkedIn URL" value={footerData.linkedin || ""} onChange={e => setFooterData({...footerData, linkedin: e.target.value})} className="border-2 border-[#2D2D2D] p-2 rounded-lg font-bold text-[9px] bg-[#FFF9F0]" />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase shadow-[8px_8px_0px_#2D2D2D]">Sync Global Footer</button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default BrandingEditor;
