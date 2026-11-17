"use client";
import { useState, useEffect } from "react";
import { Users, Mail, PlayCircle, Clock, Radio, Download, ExternalLink, ShieldCheck, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDocs, collection, getDoc } from "firebase/firestore";
import CrewActivityFeed from "./CrewActivityFeed";

export default function CommandCenter({ stats, onJump }: { stats: any; onJump?: (tabId: string) => void }) {
  // Emergency Broadcast State
  const [broadcast, setBroadcast] = useState<any>({
    enabled: false,
    message: "",
    type: "alert",
    linkText: "",
    linkUrl: "",
  });
  const [broadcastSaving, setBroadcastSaving] = useState(false);
  const [broadcastSaved, setBroadcastSaved] = useState(false);

  // Backup State
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  // Load Broadcast Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "broadcast"), (d) => {
      if (d.exists()) {
        setBroadcast(d.data());
      }
    }, (err) => console.warn("Broadcast listener error:", err));
    return () => unsub();
  }, []);

  // Save Broadcast Settings
  const handleSaveBroadcast = async () => {
    setBroadcastSaving(true);
    try {
      await setDoc(doc(db, "settings", "broadcast"), {
        ...broadcast,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setBroadcastSaved(true);
      setTimeout(() => setBroadcastSaved(false), 3000);
    } catch (err: any) {
      alert("Failed to save broadcast: " + err.message);
    } finally {
      setBroadcastSaving(false);
    }
  };

  // Full System JSON Backup
  const handleSystemBackup = async () => {
    setBackupLoading(true);
    try {
      const collectionsToBackup = [
        "settings",
        "events",
        "production_archive",
        "team",
        "expenses",
        "messages",
        "auditions",
        "timeline",
      ];

      const backupData: Record<string, any> = {
        meta: {
          system: "Swaang Dramatic Society CMS",
          exportedAt: new Date().toISOString(),
          version: "2.5.0",
        },
      };

      // Fetch critical single docs
      const [homepageSnap, brandingSnap, auditionResourcesSnap, broadcastSnap] = await Promise.all([
        getDoc(doc(db, "settings", "homepage")),
        getDoc(doc(db, "settings", "site_config")),
        getDoc(doc(db, "settings", "audition_resources")),
        getDoc(doc(db, "settings", "broadcast")),
      ]);

      backupData.settings = {
        homepage: homepageSnap.data() || null,
        site_config: brandingSnap.data() || null,
        audition_resources: auditionResourcesSnap.data() || null,
        broadcast: broadcastSnap.data() || null,
      };

      // Fetch collections
      for (const col of ["events", "production_archive", "team", "expenses", "messages", "auditions", "timeline"]) {
        try {
          const snap = await getDocs(collection(db, col));
          backupData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn(`Could not export collection ${col}:`, e);
          backupData[col] = [];
        }
      }

      // Create and trigger download
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateTag = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = `SWAANG_DB_BACKUP_${dateTag}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toLocaleTimeString());
    } catch (err: any) {
      alert("Backup generation failed: " + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left pb-16 w-full">
      {/* HEADER */}
      <div className="border-b-8 border-[#FFF9F0]/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-6xl font-cinzel font-black tracking-tighter uppercase text-[#FFF9F0]">
            Master Hub
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-[10px] md:text-xs font-mono font-black uppercase tracking-[0.4em] text-[#06D6A0]">
              Swaang Operations Grid
            </span>
            <span className="flex items-center gap-1.5 bg-black/60 text-[#06D6A0] text-[9px] font-mono font-bold uppercase px-2.5 py-1 border border-[#06D6A0]/40">
              <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse" />
              DB LIVE
            </span>
            <span className="text-[9px] font-mono font-bold uppercase text-white/50 bg-black/40 px-2 py-1 border border-white/10">
              SYS_REV_2026.4
            </span>
          </div>
        </div>

        {/* 1-CLICK SYSTEM BACKUP */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSystemBackup}
            disabled={backupLoading}
            className="flex items-center gap-2 bg-[#FFF9F0] text-black border-4 border-black px-5 py-3 font-mono font-black text-xs uppercase shadow-[4px_4px_0px_#06D6A0] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            title="Download full JSON export of Firestore settings and records"
          >
            <Download size={16} strokeWidth={3} className={backupLoading ? "animate-bounce" : ""} />
            {backupLoading ? "CREATING DUMP..." : "BACKUP DATABASE (JSON)"}
          </button>
        </div>
      </div>

      {lastBackup && (
        <div className="bg-[#06D6A0]/20 border-2 border-[#06D6A0] text-[#06D6A0] px-4 py-2 font-mono text-xs font-bold uppercase flex items-center justify-between">
          <span>✓ SYSTEM BACKUP EXPORTED SUCCESSFULLY AT {lastBackup}</span>
          <span className="text-[10px] text-white/70">SAVED LOCALLY</span>
        </div>
      )}

      {/* QUICK LAUNCH SHORTCUTS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { tab: "auditions", label: "Judge Auditions", color: "bg-[#FFD166]", icon: "🎭" },
          { tab: "archive", label: "Production Archive", color: "bg-[#FF5F5F]", icon: "🎬" },
          { tab: "budget", label: "Manage Finances", color: "bg-[#06D6A0]", icon: "💰" },
          { tab: "notices", label: "Issue Notice", color: "bg-[#FFF9F0]", icon: "📢" },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => onJump && onJump(item.tab)}
            className={`${item.color} text-black border-4 border-black p-3.5 flex items-center justify-between shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{item.icon}</span>
              <span className="font-mono font-black uppercase text-xs tracking-tight">{item.label}</span>
            </div>
            <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      {/* BENTO GRID OF CORE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(14rem,auto)]">
        {/* BIG PRODUCTION CARD */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-black text-white border-8 border-[#FFD166] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-[8px_8px_0px_#FFD166] transition-all shadow-[16px_16px_0px_#FFD166]">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,209,102,0.1)_25%,transparent_25%,transparent_50%,rgba(255,209,102,0.1)_50%,rgba(255,209,102,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] pointer-events-none opacity-20" />
          <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-5 text-white font-black leading-none group-hover:scale-110 transition-transform pointer-events-none">
            🎭
          </div>
          <div className="relative z-10 flex justify-between items-start mb-8">
            <div className="w-16 h-16 bg-[#FFD166] flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_black] group-hover:shadow-none group-hover:translate-y-1 transition-all">
              <PlayCircle size={32} className="text-black" />
            </div>
            <span className="font-mono font-black uppercase text-[10px] tracking-[0.3em] bg-[#FFD166] text-black px-4 py-2 border-2 border-black">
              Live Status
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none mb-4 break-words group-hover:text-[#FFD166] transition-colors">
              {stats.activeShow}
            </h3>
            <p className="font-mono font-black uppercase text-[10px] tracking-widest text-[#FFD166] opacity-80">
              &gt; Current Mainstage Production
            </p>
          </div>
        </div>

        {/* CALL TIME CARD */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#FF5F5F] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-black text-[#FF5F5F] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_white]">
              <Clock size={28} strokeWidth={4} />
            </div>
            <span className="font-mono font-black uppercase text-[10px] tracking-widest bg-white px-2 py-1 border-2 border-black">
              Next Up
            </span>
          </div>
          <div className="mt-auto">
            <p className="text-3xl lg:text-4xl font-black tracking-tighter leading-tight mb-2 break-words">
              {stats.nextCall}
            </p>
            <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">
              &gt; Next Scheduled Call
            </p>
          </div>
        </div>

        {/* CREW STAT CARD */}
        <div className="md:col-span-1 bg-[#06D6A0] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-black text-[#06D6A0] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_white]">
              <Users size={28} strokeWidth={4} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="font-mono text-7xl font-black tracking-tighter leading-none mb-2 group-hover:scale-105 origin-left transition-transform">
              {stats.crewCount}
            </p>
            <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">
              &gt; Total Active Crew
            </p>
          </div>
        </div>

        {/* INBOX STAT CARD */}
        <div className="md:col-span-1 bg-[#FFF9F0] text-black border-8 border-black shadow-[12px_12px_0px_black] p-6 md:p-8 flex flex-col justify-between hover:-translate-y-2 hover:shadow-[16px_16px_0px_black] transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-black text-[#FFF9F0] p-4 border-4 border-black group-hover:scale-110 transition-transform shadow-[4px_4px_0px_#FFD166]">
              <Mail size={28} strokeWidth={4} />
            </div>
          </div>
          <div className="mt-auto">
            <p className="font-mono text-7xl font-black tracking-tighter leading-none mb-2 group-hover:scale-105 origin-left transition-transform">
              {stats.unreadCount}
            </p>
            <p className="font-mono font-black uppercase text-[10px] tracking-widest opacity-80">
              &gt; Unread Inquiries
            </p>
          </div>
        </div>
      </div>

      {/* 🚨 EMERGENCY BROADCAST & HOMEPAGE BANNER CONTROLLER */}
      <div className="bg-[#2D2D2D] border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_#FF5F5F] text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-white/20 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 border-4 border-black ${broadcast.enabled ? "bg-[#FF5F5F] text-white animate-pulse" : "bg-gray-700 text-gray-400"}`}>
              <Radio size={24} strokeWidth={3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl md:text-2xl font-cinzel font-black uppercase tracking-tight">
                  Public Broadcast Banner
                </h3>
                <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border-2 border-black ${broadcast.enabled ? "bg-[#FF5F5F] text-white" : "bg-gray-600 text-gray-300"}`}>
                  {broadcast.enabled ? "LIVE ON WEBSITE" : "OFFLINE"}
                </span>
              </div>
              <p className="font-mono text-xs text-white/60 mt-0.5">
                Instant sitewide announcement bar rendered across the public web portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setBroadcast({ ...broadcast, enabled: !broadcast.enabled })}
              className={`px-4 py-2 border-4 border-black font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_black] transition-all ${
                broadcast.enabled ? "bg-[#06D6A0] text-black" : "bg-gray-600 text-white"
              }`}
            >
              {broadcast.enabled ? "SWITCH OFF" : "ENABLE BROADCAST"}
            </button>
            <button
              onClick={handleSaveBroadcast}
              disabled={broadcastSaving}
              className="bg-[#FFD166] text-black border-4 border-black px-6 py-2 font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
            >
              {broadcastSaving ? "SAVING..." : broadcastSaved ? "✓ SYNCED" : "PUBLISH ALERT"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[#FFD166] block mb-1">
                Announcement Headline / Notice Text
              </label>
              <input
                type="text"
                placeholder="e.g. AUDITION REGISTRATIONS EXTENDED TILL 11:59 PM TONIGHT | VENUE: OAT"
                value={broadcast.message || ""}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                className="w-full bg-black border-4 border-white p-3 font-mono font-bold text-sm text-[#06D6A0] focus:border-[#FFD166] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-white/70 block mb-1">
                  Optional Action Button Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. READ NOTICE ➔"
                  value={broadcast.linkText || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkText: e.target.value })}
                  className="w-full bg-black border-2 border-white/60 p-2.5 font-mono text-xs text-white focus:border-[#FFD166] outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-white/70 block mb-1">
                  Target Destination URL / Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /auditions/resources or https://..."
                  value={broadcast.linkUrl || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkUrl: e.target.value })}
                  className="w-full bg-black border-2 border-white/60 p-2.5 font-mono text-xs text-white focus:border-[#FFD166] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-black/60 border-4 border-white/20 p-4 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-mono font-black uppercase tracking-widest text-[#FF5F5F] mb-2">
                Banner Style
              </p>
              <div className="flex gap-2">
                {[
                  { id: "alert", label: "URGENT (RED)", bg: "bg-[#FF5F5F] text-white" },
                  { id: "info", label: "NOTICE (YELLOW)", bg: "bg-[#FFD166] text-black" },
                  { id: "success", label: "UPDATE (GREEN)", bg: "bg-[#06D6A0] text-black" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBroadcast({ ...broadcast, type: s.id })}
                    className={`flex-1 py-1.5 px-2 text-[9px] font-mono font-black uppercase border-2 border-black transition-all ${
                      broadcast.type === s.id ? `${s.bg} scale-105 shadow-[2px_2px_0px_white]` : "bg-gray-800 text-gray-400 opacity-60"
                    }`}
                  >
                    {s.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[9px] font-mono uppercase text-white/40 mb-1">PREVIEW</p>
              <div className={`p-2.5 border-2 border-black font-mono text-[10px] font-black uppercase truncate ${
                broadcast.type === "alert" ? "bg-[#FF5F5F] text-white" : broadcast.type === "success" ? "bg-[#06D6A0] text-black" : "bg-[#FFD166] text-black"
              }`}>
                {broadcast.message || "NO ANNOUNCEMENT ACTIVE"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <div className="w-full">
        <CrewActivityFeed />
      </div>
    </div>
  );
}