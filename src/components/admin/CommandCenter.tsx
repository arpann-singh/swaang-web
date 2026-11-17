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

      for (const col of ["events", "production_archive", "team", "expenses", "messages", "auditions", "timeline"]) {
        try {
          const snap = await getDocs(collection(db, col));
          backupData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
          console.warn(`Could not export collection ${col}:`, e);
          backupData[col] = [];
        }
      }

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
    <div className="space-y-8 text-left pb-16 w-full text-zinc-100">
      {/* HEADER */}
      <div className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold tracking-tight text-[#FFF9F0]">
            Master Hub
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-xs font-mono font-medium tracking-wider text-amber-400">
              Operations & Production Center
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FIRESTORE SYNC
            </span>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
              SYS.RELEASE_2026
            </span>
          </div>
        </div>

        {/* 1-CLICK SYSTEM BACKUP */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSystemBackup}
            disabled={backupLoading}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/15 px-4 py-2.5 rounded-xl font-mono text-xs font-medium transition-all shadow-sm hover:border-amber-400/40 disabled:opacity-50"
            title="Download full JSON export of Firestore settings and records"
          >
            <Download size={14} className={backupLoading ? "animate-bounce text-amber-400" : "text-amber-400"} />
            {backupLoading ? "CREATING BACKUP..." : "BACKUP DATABASE (JSON)"}
          </button>
        </div>
      </div>

      {lastBackup && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl font-mono text-xs flex items-center justify-between">
          <span>✓ SYSTEM BACKUP EXPORTED SUCCESSFULLY AT {lastBackup}</span>
          <span className="text-[10px] text-emerald-400/60 uppercase">DOWNLOAD COMPLETE</span>
        </div>
      )}

      {/* QUICK LAUNCH SHORTCUTS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { tab: "auditions", label: "Judge Auditions", accent: "text-amber-400", border: "hover:border-amber-500/40", icon: "🎭" },
          { tab: "archive", label: "Production Archive", accent: "text-rose-400", border: "hover:border-rose-500/40", icon: "🎬" },
          { tab: "budget", label: "Manage Finances", accent: "text-emerald-400", border: "hover:border-emerald-500/40", icon: "💰" },
          { tab: "notices", label: "Issue Notice", accent: "text-sky-400", border: "hover:border-sky-500/40", icon: "📢" },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => onJump && onJump(item.tab)}
            className={`bg-[#16161A] hover:bg-[#1C1C22] text-zinc-200 border border-white/10 ${item.border} p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all group`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-mono text-xs font-bold text-zinc-100 group-hover:text-white transition-colors">{item.label}</span>
            </div>
            <ArrowRight size={14} className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {/* BENTO GRID OF CORE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(13rem,auto)]">
        {/* BIG PRODUCTION CARD */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-[#1C1B20] via-[#151518] to-[#101012] border border-amber-500/30 rounded-3xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/50 shadow-xl transition-all">
          <div className="absolute -right-8 -bottom-8 text-[16rem] opacity-[0.03] text-amber-400 font-serif select-none pointer-events-none group-hover:scale-105 transition-transform duration-700">
            🎭
          </div>
          <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <PlayCircle size={26} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
              Active Stage
            </span>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="font-cinzel text-3xl md:text-5xl font-bold tracking-tight text-[#FFF9F0] mb-2 group-hover:text-amber-200 transition-colors">
              {stats.activeShow}
            </h3>
            <p className="font-mono text-xs uppercase tracking-wider text-amber-400/80">
              Current Mainstage Production
            </p>
          </div>
        </div>

        {/* CALL TIME CARD */}
        <div className="md:col-span-1 lg:col-span-2 bg-gradient-to-br from-[#24171B] to-[#16161A] border border-rose-500/25 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg hover:border-rose-500/40 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300">
              <Clock size={22} />
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/15 px-2.5 py-1 rounded-full border border-rose-500/25">
              Next Call
            </span>
          </div>
          <div className="mt-auto">
            <p className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-1.5 leading-snug">
              {stats.nextCall}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-rose-300/70">
              Stage Rehearsal & Assembly
            </p>
          </div>
        </div>

        {/* CREW STAT CARD */}
        <div className="md:col-span-1 bg-[#16161A] border border-white/10 hover:border-emerald-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">ACTIVE</span>
          </div>
          <div className="mt-auto">
            <p className="font-mono text-5xl font-bold tracking-tight text-white mb-1">
              {stats.crewCount}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Total Roster Crew
            </p>
          </div>
        </div>

        {/* INBOX STAT CARD */}
        <div className="md:col-span-1 bg-[#16161A] border border-white/10 hover:border-sky-500/30 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-lg transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Mail size={20} />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">INQUIRIES</span>
          </div>
          <div className="mt-auto">
            <p className="font-mono text-5xl font-bold tracking-tight text-white mb-1">
              {stats.unreadCount}
            </p>
            <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Unread Inquiries
            </p>
          </div>
        </div>
      </div>

      {/* 🚨 PUBLIC BROADCAST BANNER CONTROLLER */}
      <div className="bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5 mb-6">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
              broadcast.enabled ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-white/[0.04] text-zinc-400 border-white/10"
            }`}>
              <Radio size={22} className={broadcast.enabled ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-cinzel font-bold text-[#FFF9F0]">
                  Sitewide Announcement Banner
                </h3>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                  broadcast.enabled ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-white/[0.04] text-zinc-400 border-white/10"
                }`}>
                  {broadcast.enabled ? "LIVE ON PORTAL" : "OFFLINE"}
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                Pushes an immediate high-priority alert across all public website pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setBroadcast({ ...broadcast, enabled: !broadcast.enabled })}
              className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border transition-all ${
                broadcast.enabled ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white"
              }`}
            >
              {broadcast.enabled ? "DISABLE" : "ENABLE BANNER"}
            </button>
            <button
              onClick={handleSaveBroadcast}
              disabled={broadcastSaving}
              className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {broadcastSaving ? "SYNCING..." : broadcastSaved ? "✓ PUBLISHED" : "PUBLISH ALERT"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-xs font-mono font-medium text-zinc-300 block mb-1.5">
                Headline / Announcement Content
              </label>
              <input
                type="text"
                placeholder="e.g. AUDITIONS EXTENDED TILL 11:59 PM TONIGHT | REHEARSAL VENUE SHIFTED TO OAT"
                value={broadcast.message || ""}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/50 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 block mb-1.5">
                  Action Link Text (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIEW AUDITION DETAILS ➔"
                  value={broadcast.linkText || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkText: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-mono font-medium text-zinc-400 block mb-1.5">
                  Target Destination URL / Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /auditions/resources"
                  value={broadcast.linkUrl || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkUrl: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-400/50 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#101014] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Banner Urgency Style
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "alert", label: "URGENT", style: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
                  { id: "info", label: "NOTICE", style: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
                  { id: "success", label: "UPDATE", style: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setBroadcast({ ...broadcast, type: s.id })}
                    className={`py-2 px-2 text-[10px] font-mono font-bold uppercase rounded-lg border transition-all ${
                      broadcast.type === s.id ? `${s.style} shadow-sm font-black` : "bg-white/[0.02] text-zinc-500 border-white/5 hover:text-zinc-300"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1.5">LIVE PREVIEW</p>
              <div className={`p-3 rounded-xl border font-mono text-xs truncate ${
                broadcast.type === "alert"
                  ? "bg-rose-500/10 text-rose-200 border-rose-500/30"
                  : broadcast.type === "success"
                  ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-200 border-amber-500/30"
              }`}>
                {broadcast.message || "No announcement is currently active"}
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