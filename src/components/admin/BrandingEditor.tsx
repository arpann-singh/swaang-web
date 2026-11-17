"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Sparkles, Palette, Upload, Check, Sliders, Image, Award, Heart } from "lucide-react";

export default function BrandingEditor() {
  const [data, setData] = useState<any>({ styles: {} });
  const [activeTab, setActiveTab] = useState("founder");
  const [uploading, setUploading] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      const homeDoc = await getDoc(doc(db, "settings", "homepage"));
      if (homeDoc.exists()) setData(homeDoc.data());
    };
    fetchAllData();
  }, []);

  const syncAll = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "homepage"), data, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Sync Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

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

  const Preview = ({ url, loading }: { url: string; loading: boolean }) => (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-white/15 overflow-hidden bg-[#101014] flex items-center justify-center shrink-0 shadow-md">
      {loading ? (
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent animate-spin rounded-full" />
      ) : url ? (
        <img src={url} className="w-full h-full object-cover" alt="Preview" />
      ) : (
        <span className="text-[10px] font-mono text-zinc-500 text-center p-2 uppercase">NO PHOTO</span>
      )}
    </div>
  );

  const Slider = ({ label, field, min = 1, max = 15 }: any) => {
    const val = data.styles?.[field] ? parseFloat(data.styles[field]) : 4;
    return (
      <div className="flex flex-col gap-2.5 bg-white/[0.03] p-4 rounded-2xl border border-white/5 w-full">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono font-medium text-zinc-300">{label}</label>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">{val}rem</span>
        </div>
        <input 
          type="range" min={min} max={max} step="0.1" 
          value={val} 
          onChange={e => setData({...data, styles: {...data.styles, [field]: e.target.value + 'rem'}})}
          className="w-full h-2 bg-white/10 accent-amber-400 rounded-lg cursor-pointer appearance-none"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full space-y-10 pb-20 text-left text-zinc-100">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-6 gap-6">
        <div>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold tracking-tight text-[#FFF9F0]">
            Brand Identity
          </h1>
          <p className="text-xs font-mono text-amber-400 mt-1.5 uppercase tracking-wider">
            Visual Typography, Stage Identity & Directorate Archives
          </p>
        </div>
        <button 
          onClick={syncAll} 
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
        >
          {saving ? "SAVING..." : saved ? "✓ PUBLISHED LIVE" : "PUBLISH TO LIVE"}
        </button>
      </header>

      <div className="space-y-10">
        
        {/* 🎬 1. HERO STAGE */}
        <div className="bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-10 shadow-xl flex flex-col lg:flex-row gap-10">
          
          {/* Hero Form */}
          <div className="flex-1 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-cinzel font-bold text-[#FFF9F0]">Mainstage Hero</h2>
              <p className="text-xs font-mono text-zinc-400">Homepage landing title, tagline and scale metrics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Slider label="Master Title Scale" field="hTitleSize" max={18} />
              <Slider label="Subtitle Tagline Scale" field="hTaglineSize" max={6} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Primary Hero Title</label>
                <input 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 font-cinzel font-bold text-xl text-white outline-none focus:border-amber-400/50 transition-colors" 
                  placeholder="MAIN TITLE" 
                  value={data.headerTitle || ""} 
                  onChange={e => setData({...data, headerTitle: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Hero Tagline</label>
                <textarea 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 font-sans text-sm text-zinc-200 h-28 resize-none outline-none focus:border-amber-400/50 transition-colors" 
                  placeholder="Hero Tagline" 
                  value={data.headerTagline || ""} 
                  onChange={e => setData({...data, headerTagline: e.target.value})} 
                />
              </div>
            </div>
            
            {/* Noir Toggle */}
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/10 rounded-2xl">
              <input 
                type="checkbox" 
                checked={data.heroGrayscale !== false} 
                onChange={e => setData({...data, heroGrayscale: e.target.checked})} 
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer" 
              />
              <label className="text-xs font-mono text-zinc-300 cursor-pointer">
                Noir Filter Mode (Applies artistic monochromatic tone on hero)
              </label>
            </div>
          </div>

          {/* Hero Image Dropper */}
          <div className="w-full lg:w-1/3 flex flex-col gap-3">
            <label className="text-xs font-mono text-zinc-400">Hero Backdrop Image</label>
            <div className="flex-1 bg-[#101014] border border-white/15 rounded-2xl flex flex-col items-center justify-center p-6 text-center relative group min-h-[260px] overflow-hidden shadow-inner">
              {data.headerImageUrl ? (
                <img src={data.headerImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" alt="Hero" />
              ) : (
                <span className="font-mono text-xs text-zinc-500">NO HERO VISUAL</span>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-amber-500 text-black px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase shadow-md">
                  CHANGE IMAGE
                </span>
              </div>
              <input type="file" onChange={(e) => handleUpload(e, "headerImageUrl")} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
          </div>
        </div>

        {/* 🏛️ ROW: FACULTY BACKBONE & JOURNEY CONFIG */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* FACULTY BACKBONE HUB */}
          <div className="bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-full space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-cinzel font-bold text-[#FFF9F0]">Faculty Backbone</h2>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">Founding Mentor Tribute (Prof. Namrata Bhargava)</p>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Mentor Name</label>
                <input 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-cinzel font-bold text-base text-white outline-none focus:border-amber-400/50" 
                  placeholder="PROF. NAMRATA BHARGAVA" 
                  value={data.facultyName || ""} 
                  onChange={e => setData({...data, facultyName: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">Subtitle / Role</label>
                  <input 
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-mono text-xs text-zinc-200 outline-none focus:border-amber-400/50" 
                    placeholder="FOUNDER'S VISION" 
                    value={data.facultyTitle || ""} 
                    onChange={e => setData({...data, facultyTitle: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 block mb-1.5">Badge Title</label>
                  <input 
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-mono text-xs text-zinc-200 outline-none focus:border-amber-400/50" 
                    placeholder="Founding Mentor" 
                    value={data.facultyBadge || ""} 
                    onChange={e => setData({...data, facultyBadge: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Tribute Quote / Vision</label>
                <textarea 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-serif italic text-xs text-zinc-200 h-28 resize-none outline-none focus:border-amber-400/50" 
                  placeholder="EVERY STANDING OVATION IS A TESTAMENT TO THE STRUCTURE THAT HOLDS THE STAGE..." 
                  value={data.facultyQuote || ""} 
                  onChange={e => setData({...data, facultyQuote: e.target.value})} 
                />
              </div>

              <div className="flex items-center gap-4 p-3 bg-white/[0.03] border border-white/10 rounded-2xl">
                <Preview url={data.facultyImage} loading={uploading === "facultyImage"} />
                <div className="flex-1 space-y-2">
                  <label className="text-[11px] font-mono text-zinc-400 block">Mentor Portrait Photo</label>
                  <input 
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 font-mono text-[10px] text-zinc-300" 
                    placeholder="Image URL" 
                    value={data.facultyImage || ""} 
                    onChange={e => setData({...data, facultyImage: e.target.value})} 
                  />
                  <label className="bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer inline-block border border-white/10 transition-colors">
                    Upload Photo
                    <input type="file" onChange={(e) => handleUpload(e, "facultyImage")} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* JOURNEY GLIMPSE CONFIG */}
          <div className="bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col h-full space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-cinzel font-bold text-[#FFF9F0]">Journey Glimpse</h2>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">Chronicle Banner & Deep-Link Gateway to /journey</p>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Glimpse Header Tagline</label>
                <textarea 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 font-sans text-sm text-zinc-200 h-24 resize-none outline-none focus:border-amber-400/50" 
                  placeholder="A GLIMPSE INTO A DECADE OF REVOLUTIONARY STREET THEATRE & PROSCENIUM TRIUMPHS." 
                  value={data.journeyTagline || ""} 
                  onChange={e => setData({...data, journeyTagline: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 block mb-1.5">Gateway Call-to-Action Text</label>
                <input 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-mono text-xs text-zinc-200 outline-none focus:border-amber-400/50" 
                  placeholder="UNCOVER THE FULL 10-YEAR SWAANG ARCHIVE ➔" 
                  value={data.journeyCtaText || ""} 
                  onChange={e => setData({...data, journeyCtaText: e.target.value})} 
                />
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-mono text-amber-300 leading-relaxed">
                💡 <span className="font-bold">NOTE:</span> The individual timeline events are managed in the <strong className="underline">Timeline</strong> tab. The homepage automatically presents a curated 3-card Glimpse snapshot linking to <span className="font-bold">/journey</span>.
              </div>
            </div>
          </div>
        </div>

        {/* 🎭 FOUNDERS & DIRECTORATE IDENTITY */}
        <div className="bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-cinzel font-bold text-[#FFF9F0]">
              Founders & Directorate Identity
            </h2>
            <p className="font-mono text-xs text-zinc-400 mt-0.5">
              Founding Directorate Profiles, Stage Quotes & Portraits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Main Founder", prefix: "founder", color: "text-amber-400" },
              { title: "Co-Founder 1", prefix: "coFounder1", color: "text-emerald-400" },
              { title: "Co-Founder 2", prefix: "coFounder2", color: "text-rose-400" },
            ].map((f) => (
              <div key={f.prefix} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <span className={`font-cinzel font-bold text-lg ${f.color}`}>{f.title}</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Full Name</label>
                    <input
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-bold text-sm text-white outline-none focus:border-amber-400/50"
                      placeholder="Director Name"
                      value={data[`${f.prefix}Name`] || ""}
                      onChange={(e) => setData({ ...data, [`${f.prefix}Name`]: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Stage Message / Vision</label>
                    <textarea
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-serif italic text-xs text-zinc-300 h-24 resize-none outline-none focus:border-amber-400/50"
                      placeholder="Stage reflection or founding vision..."
                      value={data[`${f.prefix}Note`] || ""}
                      onChange={(e) => setData({ ...data, [`${f.prefix}Note`]: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-zinc-400 block mb-1">Portrait Photo</label>
                    <div className="flex items-center gap-3 p-2 bg-white/[0.02] border border-white/10 rounded-xl">
                      <Preview url={data[`${f.prefix}Image`]} loading={uploading === `${f.prefix}Image`} />
                      <div className="flex-1 space-y-1.5">
                        <input
                          className="w-full bg-white/[0.04] border border-white/10 rounded p-1 font-mono text-[9px] text-zinc-300"
                          placeholder="Photo URL"
                          value={data[`${f.prefix}Image`] || ""}
                          onChange={(e) => setData({ ...data, [`${f.prefix}Image`]: e.target.value })}
                        />
                        <label className="bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 px-2.5 py-1 rounded font-mono text-[10px] cursor-pointer inline-block border border-white/10 transition-colors">
                          Upload
                          <input type="file" onChange={(e) => handleUpload(e, `${f.prefix}Image`)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}