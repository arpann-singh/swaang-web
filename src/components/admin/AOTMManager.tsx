"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Sparkles, Upload, Save, Eye, Award, Zap } from "lucide-react";

export default function AOTMManager() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: "",
    role: "",
    month: "",
    citation: "",
    photo: "",
    achievement: "",
    impact: "",
  });

  const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "aotm"), (d) => {
      if (d.exists()) {
        const val = d.data() as any;
        setData({
          name: val.name || "",
          role: val.role || "",
          month: val.month || "",
          citation: val.citation || "",
          photo: val.photo || "",
          achievement: val.achievement || val.achievements || "",
          impact: val.impact || "",
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body,
      });
      const resData = await res.json();
      if (resData.success) {
        setData((prev) => ({ ...prev, photo: resData.data.url }));
        alert("AOTM Portrait Uploaded successfully! 📸");
      } else {
        alert("Upload error: " + (resData.error?.message || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed. Please check internet connection.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "aotm"),
        {
          name: data.name,
          role: data.role,
          month: data.month,
          citation: data.citation,
          photo: data.photo,
          achievement: data.achievement,
          achievements: data.achievement, // backward-compat
          impact: data.impact,
        },
        { merge: true }
      );
      alert("Spotlight: Artist of the Month updated live on Mainstage! 🌟");
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving AOTM data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 font-mono font-black uppercase tracking-widest text-[#FFF9F0] flex items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-black border-t-[#FFD166] animate-spin" />
        // ACCESSING.SPOTLIGHT.EDITORIAL... //
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-20 w-full">
      {/* Header */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#FFD166] text-black border-2 border-black shadow-[2px_2px_0px_black]">
              <Sparkles size={20} />
            </span>
            <span className="font-mono font-black text-xs uppercase tracking-widest bg-black text-[#FFD166] px-3 py-1 border-2 border-black">
              HOMEPAGE EDITORIAL
            </span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Artist Spotlight
          </h1>
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-black/70 mt-2">
            Configure the Artist of the Month featured on the homepage with live theatrical preview.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto bg-[#06D6A0] text-black border-4 border-black px-8 py-4 font-black uppercase text-sm shadow-[6px_6px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Publishing..." : "Publish Live to Homepage"}
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* EDIT FORM (7 Columns) */}
        <div className="xl:col-span-7 bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-6">
          <div className="border-b-4 border-black pb-3">
            <h2 className="font-mono font-black text-lg uppercase tracking-tight text-black flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FF5F5F] border border-black" />
              Editorial Profile Details
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-6 font-mono text-xs">
            {/* Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-black uppercase text-black mb-2 tracking-wider">
                  Artist Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAMINI YADAV"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full bg-white border-4 border-black p-3 font-black text-sm uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block font-black uppercase text-black mb-2 tracking-wider">
                  Role / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Performer & Vocalist"
                  value={data.role}
                  onChange={(e) => setData({ ...data, role: e.target.value })}
                  className="w-full bg-white border-4 border-black p-3 font-black text-sm uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
                />
              </div>
            </div>

            {/* Month / Issue */}
            <div>
              <label className="block font-black uppercase text-black mb-2 tracking-wider">
                Issue / Spotlight Period
              </label>
              <input
                type="text"
                placeholder="e.g. NOVEMBER 2026 // FESTIVAL REPERTOIRE"
                value={data.month}
                onChange={(e) => setData({ ...data, month: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-bold text-xs uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
              />
            </div>

            {/* Citation / Quote */}
            <div>
              <label className="block font-black uppercase text-black mb-2 tracking-wider">
                Artist Quote / Theatrical Citation *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. The stage is not where we escape reality — it is where we hold a magnifying glass up to it."
                value={data.citation}
                onChange={(e) => setData({ ...data, citation: e.target.value })}
                className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all resize-none"
              />
            </div>

            {/* Key Achievement & Core Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Award size={14} className="text-[#FF5F5F]" />
                  <label className="font-black uppercase text-black tracking-wider">
                    Key Achievement
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Best Actor in National Inter-University Nukkad Natak, 15+ Stage Appearances"
                  value={data.achievement}
                  onChange={(e) => setData({ ...data, achievement: e.target.value })}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap size={14} className="text-[#06D6A0]" />
                  <label className="font-black uppercase text-black tracking-wider">
                    Core Impact
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. Mentored 20+ juniors in physical theatre and voice modulation workshops."
                  value={data.impact}
                  onChange={(e) => setData({ ...data, impact: e.target.value })}
                  className="w-full bg-white border-4 border-black p-3 font-bold text-xs shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all resize-none"
                />
              </div>
            </div>

            {/* Photo Link & File Dropper */}
            <div className="p-4 bg-white border-4 border-black shadow-[4px_4px_0px_black] space-y-3">
              <label className="block font-black uppercase text-black tracking-wider">
                Portrait Photo URL / Direct Upload
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <input
                  type="url"
                  placeholder="https://i.ibb.co/... or paste image URL"
                  value={data.photo}
                  onChange={(e) => setData({ ...data, photo: e.target.value })}
                  className="flex-1 w-full bg-white border-2 border-black p-2.5 font-bold text-xs"
                />

                <label className="w-full sm:w-auto bg-[#FFD166] text-black border-2 border-black px-4 py-2.5 font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_black] hover:bg-black hover:text-[#FFD166] cursor-pointer transition-all shrink-0">
                  <Upload size={14} />
                  <span>{uploading ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* LIVE HOMEPAGE PREVIEW (5 Columns) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-black text-[#FFD166] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_black] flex items-center justify-between font-mono font-black text-xs uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <Eye size={14} /> Live Card Preview
            </span>
            <span className="text-[#06D6A0]">Spotlight.tsx</span>
          </div>

          <div className="bg-[#FFF9F0] border-4 border-black p-6 shadow-[8px_8px_0px_black] relative overflow-hidden flex flex-col justify-between">
            {/* The Image Frame */}
            <div className="relative aspect-[3/4] w-full bg-black border-4 border-black overflow-hidden shadow-[6px_6px_0px_#FF5F5F] mb-6">
              {data.photo ? (
                <img
                  src={data.photo}
                  alt={data.name || "AOTM"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500 font-mono font-black text-sm uppercase p-4 text-center">
                  <Sparkles size={36} className="text-[#FFD166] mb-2 opacity-50" />
                  NO PORTRAIT PHOTO
                </div>
              )}

              {/* Scanline CRT overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

              {/* Role badge */}
              <div className="absolute bottom-3 left-3 bg-[#06D6A0] text-black border-2 border-black px-3 py-1 font-mono font-black uppercase text-[10px] shadow-[3px_3px_0px_black]">
                {data.role || "Lead Performer"}
              </div>
            </div>

            {/* The Text Content */}
            <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_black] font-mono text-left">
              <span className="bg-black text-[#06D6A0] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider inline-block mb-3">
                {data.month || "ISSUE // SPOTLIGHT"}
              </span>

              <h3 className="text-3xl font-black uppercase leading-[0.85] tracking-tight mb-4 text-black">
                {data.name || "ARTIST NAME"}
              </h3>

              <div className="pl-3 border-l-4 border-[#06D6A0] mb-4">
                <p className="text-xs font-bold leading-relaxed text-black italic">
                  "{data.citation || "The stage is where we find our truest selves."}"
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t-2 border-dashed border-black">
                <div>
                  <h4 className="font-black uppercase text-[10px] text-white tracking-widest bg-black px-1.5 py-0.5 inline-block border border-black mb-1">
                    &gt; KEY_ACHIEVEMENT
                  </h4>
                  <p className="font-bold text-xs text-black">
                    {data.achievement || "N/A"}
                  </p>
                </div>

                <div>
                  <h4 className="font-black uppercase text-[10px] text-black tracking-widest bg-[#FFD166] px-1.5 py-0.5 inline-block border border-black mb-1">
                    &gt; CORE_IMPACT
                  </h4>
                  <p className="font-bold text-xs text-black">
                    {data.impact || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
