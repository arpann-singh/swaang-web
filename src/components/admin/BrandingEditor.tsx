"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Upload, Check, Globe, Radio, Sparkles, Loader2 } from "lucide-react";

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
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );
      const resData = await res.json();
      if (resData.success) {
        setData((prev: any) => ({ ...prev, [field]: resData.data.url }));
      }
    } catch (err) {
      alert("Upload Failed. Check API Key.");
    } finally {
      setUploading("");
    }
  };

  const Preview = ({ url, loading }: { url: string; loading: boolean }) => (
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-adm-line-strong overflow-hidden bg-adm-surface-2 flex items-center justify-center shrink-0">
      {loading ? (
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
      ) : url ? (
        <img src={url} className="w-full h-full object-cover" alt="Preview" />
      ) : (
        <span className="text-[11px] font-medium text-adm-fg-3 text-center p-2">No Photo</span>
      )}
    </div>
  );

  const Slider = ({ label, field, min = 1, max = 15 }: any) => {
    const val = data.styles?.[field] ? parseFloat(data.styles[field]) : 4;
    return (
      <div className="adm-panel p-4 flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-adm-fg-2">{label}</label>
          <span className="adm-badge adm-badge-accent font-mono">{val}rem</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step="0.1"
          value={val}
          onChange={(e) =>
            setData({ ...data, styles: { ...data.styles, [field]: e.target.value + "rem" } })
          }
          className="adm-range"
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-full space-y-6 text-left">
      {/* HEADER */}
      <header className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Visual Typography & Stage Identity</p>
          <h1 className="adm-title mt-1">Brand Identity</h1>
          <p className="adm-muted mt-1">
            Configure homepage hero, directorate profiles, global contact matrix, faculty tribute, journey glimpse, and marquee ticker.
          </p>
        </div>
        <button
          type="button"
          onClick={syncAll}
          disabled={saving}
          className="adm-btn adm-btn-primary adm-btn-lg w-full md:w-auto"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              <span>Published Live</span>
            </>
          ) : (
            <span>Publish to Live</span>
          )}
        </button>
      </header>

      {/* 🎬 1. HERO STAGE */}
      <div className="adm-card p-5 sm:p-7 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-5">
          <div className="border-b border-adm-line pb-3">
            <h2 className="adm-h2">Mainstage Hero</h2>
            <p className="adm-muted">Homepage landing title, tagline, scale metrics & noir filter</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Slider label="Master Title Scale" field="hTitleSize" max={18} />
            <Slider label="Subtitle Tagline Scale" field="hTaglineSize" max={6} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="adm-label">Primary Hero Title</label>
              <input
                className="adm-input font-display font-bold text-lg"
                placeholder="MAIN TITLE"
                value={data.headerTitle || ""}
                onChange={(e) => setData({ ...data, headerTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="adm-label">Hero Tagline</label>
              <textarea
                className="adm-input"
                placeholder="Hero Tagline"
                value={data.headerTagline || ""}
                onChange={(e) => setData({ ...data, headerTagline: e.target.value })}
              />
            </div>
          </div>

          {/* Noir Toggle */}
          <label className="adm-panel p-3.5 flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.heroGrayscale !== false}
              onChange={(e) => setData({ ...data, heroGrayscale: e.target.checked })}
              className="adm-check"
            />
            <span className="text-sm font-medium text-adm-fg">
              Noir Filter Mode (Applies monochromatic B&W filter on hero backdrop)
            </span>
          </label>
        </div>

        {/* Hero Image Dropper */}
        <div className="w-full lg:w-80 flex flex-col gap-2">
          <label className="adm-label">Hero Backdrop Image</label>
          <div className="flex-1 adm-panel flex flex-col items-center justify-center p-6 text-center relative group min-h-[240px] overflow-hidden">
            {data.headerImageUrl ? (
              <img
                src={data.headerImageUrl}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Hero Backdrop"
              />
            ) : (
              <span className="text-xs font-medium text-adm-fg-3">No Hero Visual Uploaded</span>
            )}

            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="adm-btn adm-btn-primary adm-btn-sm">
                <Upload size={14} />
                <span>{uploading === "headerImageUrl" ? "Uploading..." : "Upload Visual"}</span>
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "headerImageUrl")}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
          </div>
          <input
            type="url"
            placeholder="Or paste Hero Image URL..."
            value={data.headerImageUrl || ""}
            onChange={(e) => setData({ ...data, headerImageUrl: e.target.value })}
            className="adm-input text-xs"
          />
        </div>
      </div>

      {/* 🎭 2. DIRECTORATE QUICK TABS & GLOBAL CONNECT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* DIRECTORATE QUICK SWITCHER */}
        <div className="adm-card p-5 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-adm-line pb-3.5 gap-3">
            <div>
              <h2 className="adm-h2">Directorate Spotlight</h2>
              <p className="adm-muted">Edit Founder & Co-Founder social links and notes</p>
            </div>
            <div className="adm-seg">
              {["founder", "coFounder1", "coFounder2"].map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  data-active={activeTab === tab ? "true" : "false"}
                  className="adm-seg-item"
                >
                  {i === 0 ? "Founder" : `Core ${i}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="adm-label">Director Name</label>
              <input
                className="adm-input font-semibold"
                placeholder="Director Name"
                value={data[`${activeTab}Name`] || ""}
                onChange={(e) => setData({ ...data, [`${activeTab}Name`]: e.target.value })}
              />
            </div>
            <div>
              <label className="adm-label">Director's Message or Stage Vision</label>
              <textarea
                className="adm-input"
                placeholder="Director's Message or Vision"
                value={data[`${activeTab}Note`] || ""}
                onChange={(e) => setData({ ...data, [`${activeTab}Note`]: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="adm-label">Instagram URL</label>
                <input
                  className="adm-input text-xs"
                  placeholder="https://instagram.com/..."
                  value={data[`${activeTab}Instagram`] || ""}
                  onChange={(e) => setData({ ...data, [`${activeTab}Instagram`]: e.target.value })}
                />
              </div>
              <div>
                <label className="adm-label">LinkedIn URL</label>
                <input
                  className="adm-input text-xs"
                  placeholder="https://linkedin.com/in/..."
                  value={data[`${activeTab}Linkedin`] || ""}
                  onChange={(e) => setData({ ...data, [`${activeTab}Linkedin`]: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="adm-panel p-3.5 flex items-center gap-4">
            <Preview url={data[`${activeTab}Image`]} loading={uploading === `${activeTab}Image`} />
            <div className="flex-1 space-y-2 min-w-0">
              <label className="adm-label mb-0">Portrait Photo</label>
              <input
                className="adm-input py-1.5 text-xs"
                placeholder="Photo URL"
                value={data[`${activeTab}Image`] || ""}
                onChange={(e) => setData({ ...data, [`${activeTab}Image`]: e.target.value })}
              />
              <label className="adm-btn adm-btn-secondary adm-btn-sm cursor-pointer">
                <Upload size={13} />
                <span>Upload Portrait</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, `${activeTab}Image`)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* GLOBAL CONNECT HUB (HQ Data, Social Matrix, Dev Credit) */}
        <div className="adm-card p-5 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="border-b border-adm-line pb-3.5 flex items-center justify-between">
            <div>
              <h2 className="adm-h2">Global Connect & HQ</h2>
              <p className="adm-muted">Physical address, contact numbers, social channels & credits</p>
            </div>
            <Globe size={18} className="text-adm-accent-text shrink-0" />
          </div>

          <div className="space-y-5 flex-1">
            <div className="space-y-3">
              <span className="adm-eyebrow">HQ Contact Information</span>
              <div>
                <label className="adm-label">Physical Address</label>
                <input
                  placeholder="SSTC Campus, Junwani, Bhilai"
                  className="adm-input"
                  value={data.address || ""}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="adm-label">Phone Number</label>
                  <input
                    placeholder="+91 ..."
                    className="adm-input"
                    value={data.phone || ""}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="adm-label">Official Email</label>
                  <input
                    placeholder="contact@swaang.club"
                    className="adm-input"
                    value={data.email || ""}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-adm-line">
              <span className="adm-eyebrow">Social Matrix URLs</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="adm-label">Instagram URL</label>
                  <input
                    placeholder="https://instagram.com/..."
                    className="adm-input text-xs"
                    value={data.instagram || ""}
                    onChange={(e) => setData({ ...data, instagram: e.target.value })}
                  />
                </div>
                <div>
                  <label className="adm-label">YouTube URL</label>
                  <input
                    placeholder="https://youtube.com/..."
                    className="adm-input text-xs"
                    value={data.youtube || ""}
                    onChange={(e) => setData({ ...data, youtube: e.target.value })}
                  />
                </div>
                <div>
                  <label className="adm-label">LinkedIn URL</label>
                  <input
                    placeholder="https://linkedin.com/..."
                    className="adm-input text-xs"
                    value={data.linkedin || ""}
                    onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                  />
                </div>
                <div>
                  <label className="adm-label">X (Twitter) URL</label>
                  <input
                    placeholder="https://x.com/..."
                    className="adm-input text-xs"
                    value={data.twitter || ""}
                    onChange={(e) => setData({ ...data, twitter: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-adm-line">
              <label className="adm-label">Dev Credit / Curator Name</label>
              <input
                placeholder="CURATOR NAME"
                className="adm-input"
                value={data.curatorName || ""}
                onChange={(e) => setData({ ...data, curatorName: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🏛️ 3. FACULTY BACKBONE & JOURNEY GLIMPSE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* FACULTY BACKBONE HUB */}
        <div className="adm-card p-5 sm:p-7 flex flex-col h-full space-y-5">
          <div className="border-b border-adm-line pb-3.5">
            <h2 className="adm-h2">Faculty Backbone</h2>
            <p className="adm-muted">Executive Foundation & Chief Mentor Tribute (Prof. Namrata Bhargava)</p>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="adm-label">Mentor Name</label>
              <input
                className="adm-input font-semibold"
                placeholder="PROF. NAMRATA BHARGAVA"
                value={data.facultyName || ""}
                onChange={(e) => setData({ ...data, facultyName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="adm-label">Subtitle / Vision Tag</label>
                <input
                  className="adm-input"
                  placeholder="FOUNDER'S VISION"
                  value={data.facultyTitle || ""}
                  onChange={(e) => setData({ ...data, facultyTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="adm-label">Medal Badge Title</label>
                <input
                  className="adm-input"
                  placeholder="Founding Mentor"
                  value={data.facultyBadge || ""}
                  onChange={(e) => setData({ ...data, facultyBadge: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="adm-label">Tribute Quote / Vision</label>
              <textarea
                className="adm-input"
                placeholder="EVERY STANDING OVATION IS A TESTAMENT TO THE STRUCTURE THAT HOLDS THE STAGE..."
                value={data.facultyQuote || ""}
                onChange={(e) => setData({ ...data, facultyQuote: e.target.value })}
              />
            </div>

            <div className="adm-panel p-3.5 flex items-center gap-4">
              <Preview url={data.facultyImage} loading={uploading === "facultyImage"} />
              <div className="flex-1 space-y-2 min-w-0">
                <label className="adm-label mb-0">Mentor Portrait Photo</label>
                <input
                  className="adm-input py-1.5 text-xs"
                  placeholder="Image URL"
                  value={data.facultyImage || ""}
                  onChange={(e) => setData({ ...data, facultyImage: e.target.value })}
                />
                <label className="adm-btn adm-btn-secondary adm-btn-sm cursor-pointer">
                  <Upload size={13} />
                  <span>Upload Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUpload(e, "facultyImage")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* JOURNEY GLIMPSE CONFIG */}
        <div className="adm-card p-5 sm:p-7 flex flex-col h-full space-y-5">
          <div className="border-b border-adm-line pb-3.5">
            <h2 className="adm-h2">Journey Glimpse</h2>
            <p className="adm-muted">Homepage Chronicle Banner & Deep-Link Gateway to /journey</p>
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <label className="adm-label">Glimpse Header Tagline</label>
              <textarea
                className="adm-input"
                placeholder="A GLIMPSE INTO A DECADE OF REVOLUTIONARY STREET THEATRE & PROSCENIUM TRIUMPHS."
                value={data.journeyTagline || ""}
                onChange={(e) => setData({ ...data, journeyTagline: e.target.value })}
              />
            </div>

            <div>
              <label className="adm-label">Gateway Call-to-Action Text</label>
              <input
                className="adm-input"
                placeholder="UNCOVER THE FULL 10-YEAR SWAANG ARCHIVE ➔"
                value={data.journeyCtaText || ""}
                onChange={(e) => setData({ ...data, journeyCtaText: e.target.value })}
              />
            </div>

            <div className="rounded-xl border border-adm-accent/35 bg-adm-accent/10 p-4 text-xs text-adm-fg-2 leading-relaxed">
              <strong className="text-adm-accent-text">Tip:</strong> Individual timeline milestones are managed in the{" "}
              <strong className="text-adm-fg">Timeline & Journey</strong> module. The homepage presents a curated 3-card Glimpse snapshot linking directly to{" "}
              <code className="font-mono text-adm-accent-text">/journey</code>.
            </div>
          </div>
        </div>
      </div>

      {/* 🎭 4. FOUNDERS & DIRECTORATE ALL-IN-ONE GRID */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="border-b border-adm-line pb-3.5">
          <h2 className="adm-h2">Founders & Directorate Identity Overview</h2>
          <p className="adm-muted">Side-by-side comparison and editing for all three founding directors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { title: "Main Founder", prefix: "founder", badge: "adm-badge-accent" },
            { title: "Co-Founder 1", prefix: "coFounder1", badge: "adm-badge-success" },
            { title: "Co-Founder 2", prefix: "coFounder2", badge: "adm-badge-danger" },
          ].map((f) => (
            <div key={f.prefix} className="adm-panel p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-adm-line pb-2.5">
                  <h3 className="adm-h3">{f.title}</h3>
                  <span className={`adm-badge ${f.badge}`}>{f.prefix}</span>
                </div>

                <div>
                  <label className="adm-label">Full Name</label>
                  <input
                    className="adm-input"
                    placeholder="Director Name"
                    value={data[`${f.prefix}Name`] || ""}
                    onChange={(e) => setData({ ...data, [`${f.prefix}Name`]: e.target.value })}
                  />
                </div>

                <div>
                  <label className="adm-label">Stage Message / Bio</label>
                  <textarea
                    className="adm-input text-xs"
                    placeholder="Stage reflection or founding vision..."
                    value={data[`${f.prefix}Note`] || ""}
                    onChange={(e) => setData({ ...data, [`${f.prefix}Note`]: e.target.value })}
                  />
                </div>

                <div>
                  <label className="adm-label">Portrait Photo</label>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-adm-surface border border-adm-line">
                    <Preview url={data[`${f.prefix}Image`]} loading={uploading === `${f.prefix}Image`} />
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        className="adm-input py-1.5 text-xs"
                        placeholder="Photo URL"
                        value={data[`${f.prefix}Image`] || ""}
                        onChange={(e) => setData({ ...data, [`${f.prefix}Image`]: e.target.value })}
                      />
                      <label className="adm-btn adm-btn-secondary adm-btn-sm cursor-pointer w-full">
                        <Upload size={13} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(e, `${f.prefix}Image`)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 📟 5. NEWS TICKER (Scrolling Marquee Config) */}
      <div className="adm-card p-5 sm:p-7 flex flex-col md:flex-row gap-6 items-start">
        <div className="md:w-1/3 space-y-2">
          <div className="flex items-center gap-2">
            <Radio size={17} className="text-adm-accent-text" />
            <h2 className="adm-h2">News Ticker</h2>
          </div>
          <p className="adm-muted">
            Configure the scrolling marquee bar displayed on the homepage for stage cues and quick announcements.
          </p>
          <label className="adm-panel p-3 mt-3 inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showTicker || false}
              onChange={(e) => setData({ ...data, showTicker: e.target.checked })}
              className="adm-check"
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-adm-fg">
              Ticker Active
            </span>
          </label>
        </div>

        <div className="flex-1 w-full">
          <label className="adm-label">Ticker Marquee Content</label>
          <textarea
            className="adm-input font-mono text-xs"
            placeholder="TYPE TICKER CONTENT HERE..."
            value={data.tickerText || ""}
            onChange={(e) => setData({ ...data, tickerText: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}