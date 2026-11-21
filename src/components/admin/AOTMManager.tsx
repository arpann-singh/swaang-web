"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { Sparkles, Upload, Save, Eye, Award, Zap, Loader2 } from "lucide-react";

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
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Artist Spotlight editorial...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      {/* Header */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">Homepage Editorial</span>
          </div>
          <h1 className="adm-title">Artist Spotlight (AOTM)</h1>
          <p className="adm-muted mt-1">
            Configure the Artist of the Month featured on the homepage with a live theatrical preview.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="adm-btn adm-btn-primary adm-btn-lg w-full md:w-auto"
        >
          <Save size={16} />
          <span>{saving ? "Publishing..." : "Publish Live to Homepage"}</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* EDIT FORM (7 Columns) */}
        <div className="xl:col-span-7 adm-card p-5 sm:p-7 space-y-5">
          <div className="border-b border-adm-line pb-3">
            <h2 className="adm-h2">Editorial Profile Details</h2>
            <p className="adm-muted">All fields sync directly with the homepage Spotlight component</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name & Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="adm-label">Artist Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DAMINI YADAV"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="adm-input font-semibold"
                />
              </div>

              <div>
                <label className="adm-label">Role / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Performer & Vocalist"
                  value={data.role}
                  onChange={(e) => setData({ ...data, role: e.target.value })}
                  className="adm-input"
                />
              </div>
            </div>

            {/* Month / Issue */}
            <div>
              <label className="adm-label">Issue / Spotlight Period</label>
              <input
                type="text"
                placeholder="e.g. NOVEMBER 2026 // FESTIVAL REPERTOIRE"
                value={data.month}
                onChange={(e) => setData({ ...data, month: e.target.value })}
                className="adm-input"
              />
            </div>

            {/* Citation / Quote */}
            <div>
              <label className="adm-label">Artist Quote / Theatrical Citation *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. The stage is not where we escape reality — it is where we hold a magnifying glass up to it."
                value={data.citation}
                onChange={(e) => setData({ ...data, citation: e.target.value })}
                className="adm-input"
              />
            </div>

            {/* Key Achievement & Core Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="adm-label flex items-center gap-1.5">
                  <Award size={14} className="text-adm-danger" />
                  <span>Key Achievement</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Best Actor in National Inter-University Nukkad Natak, 15+ Stage Appearances"
                  value={data.achievement}
                  onChange={(e) => setData({ ...data, achievement: e.target.value })}
                  className="adm-input"
                />
              </div>

              <div>
                <label className="adm-label flex items-center gap-1.5">
                  <Zap size={14} className="text-adm-success" />
                  <span>Core Impact</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Mentored 20+ juniors in physical theatre and voice modulation workshops."
                  value={data.impact}
                  onChange={(e) => setData({ ...data, impact: e.target.value })}
                  className="adm-input"
                />
              </div>
            </div>

            {/* Photo Link & File Dropper */}
            <div className="adm-panel p-4 space-y-3">
              <label className="adm-label mb-0">Portrait Photo URL / Direct Upload</label>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="url"
                  placeholder="https://i.ibb.co/... or paste image URL"
                  value={data.photo}
                  onChange={(e) => setData({ ...data, photo: e.target.value })}
                  className="adm-input flex-1"
                />

                <label className="adm-btn adm-btn-secondary cursor-pointer shrink-0">
                  <Upload size={15} />
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
        <div className="xl:col-span-5 adm-card overflow-hidden">
          <div className="px-5 py-3.5 bg-adm-surface-2 border-b border-adm-line flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-adm-fg">
              <Eye size={14} className="text-adm-accent-text" />
              <span>Live Card Preview</span>
            </span>
            <span className="adm-badge adm-badge-accent font-mono">Spotlight.tsx</span>
          </div>

          <div className="p-5 space-y-5">
            {/* The Image Frame */}
            <div className="relative aspect-[3/4] w-full rounded-xl bg-adm-surface-2 border border-adm-line overflow-hidden">
              {data.photo ? (
                <img
                  src={data.photo}
                  alt={data.name || "AOTM"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-adm-fg-3 text-xs font-medium p-4 text-center">
                  <Sparkles size={32} className="text-adm-accent-text mb-2 opacity-60" />
                  <span>No Portrait Photo Uploaded</span>
                </div>
              )}

              {/* Role badge */}
              <div className="absolute bottom-3 left-3">
                <span className="adm-badge adm-badge-success bg-adm-surface/90 backdrop-blur-xs">
                  {data.role || "Lead Performer"}
                </span>
              </div>
            </div>

            {/* The Text Content */}
            <div className="adm-panel p-4 space-y-3">
              <span className="adm-badge adm-badge-accent">
                {data.month || "ISSUE // SPOTLIGHT"}
              </span>

              <h3 className="font-display text-2xl font-bold text-adm-fg">
                {data.name || "ARTIST NAME"}
              </h3>

              <blockquote className="pl-3 border-l-2 border-adm-accent text-sm italic text-adm-fg-2">
                "{data.citation || "The stage is where we find our truest selves."}"
              </blockquote>

              <div className="space-y-3 pt-3 border-t border-adm-line">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-adm-accent-text block mb-0.5">
                    &gt; KEY_ACHIEVEMENT
                  </span>
                  <p className="text-xs text-adm-fg-2">
                    {data.achievement || "N/A"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-adm-success block mb-0.5">
                    &gt; CORE_IMPACT
                  </span>
                  <p className="text-xs text-adm-fg-2">
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
