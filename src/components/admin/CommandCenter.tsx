"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Mail,
  PlayCircle,
  Clock,
  Radio,
  Download,
  ArrowRight,
  UserCheck,
  Film,
  Wallet,
  Megaphone,
  Check,
  Sliders,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, getDocs, collection, getDoc } from "firebase/firestore";
import CrewActivityFeed from "./CrewActivityFeed";

export default function CommandCenter({
  stats,
  onJump,
}: {
  stats: any;
  onJump?: (tabId: string) => void;
}) {
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
    const unsub = onSnapshot(
      doc(db, "settings", "broadcast"),
      (d) => {
        if (d.exists()) {
          setBroadcast(d.data());
        }
      },
      (err) => console.warn("Broadcast listener error:", err)
    );
    return () => unsub();
  }, []);

  // Save Broadcast Settings
  const handleSaveBroadcast = async () => {
    setBroadcastSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "broadcast"),
        {
          ...broadcast,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
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
      const backupData: Record<string, any> = {
        meta: {
          system: "Swaang Dramatic Society CMS",
          exportedAt: new Date().toISOString(),
          version: "2.6.0",
        },
      };

      const [homepageSnap, brandingSnap, auditionResourcesSnap, broadcastSnap, joinFormsSnap] = await Promise.all([
        getDoc(doc(db, "settings", "homepage")),
        getDoc(doc(db, "settings", "site_config")),
        getDoc(doc(db, "settings", "audition_resources")),
        getDoc(doc(db, "settings", "broadcast")),
        getDoc(doc(db, "settings", "join_forms")),
      ]);

      backupData.settings = {
        homepage: homepageSnap.data() || null,
        site_config: brandingSnap.data() || null,
        audition_resources: auditionResourcesSnap.data() || null,
        broadcast: broadcastSnap.data() || null,
        join_forms: joinFormsSnap.data() || null,
      };

      for (const col of [
        "events",
        "production_archive",
        "team",
        "expenses",
        "messages",
        "auditions",
        "timeline",
      ]) {
        try {
          const snap = await getDocs(collection(db, col));
          backupData[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    <div className="space-y-6 text-left w-full">
      {/* HEADER */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Operations & Production Center</p>
          <h2 className="adm-title mt-1">Master Hub</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="adm-badge adm-badge-success">
              <span className="w-1.5 h-1.5 rounded-full bg-adm-success animate-pulse" />
              <span>Firestore Live Sync</span>
            </span>
            <span className="adm-badge adm-badge-neutral font-mono">SYS.RELEASE_2026</span>
          </div>
        </div>

        {/* 1-CLICK SYSTEM BACKUP */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSystemBackup}
            disabled={backupLoading}
            className="adm-btn adm-btn-secondary w-full md:w-auto"
            title="Download full JSON export of Firestore settings and records"
          >
            <Download
              size={15}
              className={backupLoading ? "animate-bounce text-adm-accent-text" : "text-adm-accent-text"}
            />
            <span>{backupLoading ? "Creating Backup..." : "Backup Database (JSON)"}</span>
          </button>
        </div>
      </div>

      {lastBackup && (
        <div className="rounded-xl border border-adm-success/35 bg-adm-success/10 text-adm-success px-4 py-3 text-xs font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Check size={15} />
            <span>System backup exported successfully at {lastBackup}</span>
          </span>
          <span className="text-[11px] uppercase tracking-wider">Saved Locally</span>
        </div>
      )}

      {/* QUICK LAUNCH SHORTCUTS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { tab: "form_builder", label: "Join Us Form Studio", sub: "Custom Fields & Wings", icon: Sliders },
          { tab: "auditions", label: "Judge Auditions", sub: "Casting Desk & Matrix", icon: UserCheck },
          { tab: "archive", label: "Production Archive", sub: "Plays & Short Films", icon: Film },
          { tab: "budget", label: "Manage Finances", sub: "Show Budget & Ledger", icon: Wallet },
          { tab: "notices", label: "Issue Notice", sub: "Global Alert Strip", icon: Megaphone },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onJump && onJump(item.tab)}
              className="adm-card p-4 flex items-center justify-between gap-3 text-left hover:border-adm-accent/50 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-adm-accent/15 border border-adm-accent/30 flex items-center justify-center text-adm-accent-text shrink-0">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-adm-fg truncate">{item.label}</p>
                  <p className="text-xs text-adm-fg-3 truncate">{item.sub}</p>
                </div>
              </div>
              <ArrowRight
                size={15}
                className="text-adm-fg-3 group-hover:text-adm-accent-text group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </button>
          );
        })}
      </div>

      {/* BENTO GRID OF CORE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BIG PRODUCTION CARD */}
        <div className="md:col-span-2 lg:col-span-2 adm-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text">
              <PlayCircle size={22} />
            </div>
            <span className="adm-badge adm-badge-accent">Active Stage</span>
          </div>
          <div className="mt-auto">
            <p className="adm-eyebrow mb-1">Current Mainstage Production</p>
            <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-adm-fg break-words">
              {stats.activeShow}
            </h3>
          </div>
        </div>

        {/* CALL TIME CARD */}
        <div className="md:col-span-2 lg:col-span-2 adm-card p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-adm-danger/12 border border-adm-danger/30 flex items-center justify-center text-adm-danger">
              <Clock size={22} />
            </div>
            <span className="adm-badge adm-badge-danger">Next Call</span>
          </div>
          <div className="mt-auto">
            <p className="adm-eyebrow mb-1">Stage Rehearsal & Assembly</p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-adm-fg leading-snug break-words">
              {stats.nextCall}
            </p>
          </div>
        </div>

        {/* CREW STAT CARD */}
        <div
          onClick={() => onJump && onJump("team")}
          className="md:col-span-1 lg:col-span-2 adm-card p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-adm-line-strong transition-colors"
        >
          <div>
            <p className="adm-muted font-medium">Total Active Crew</p>
            <p className="font-display text-4xl font-bold text-adm-fg mt-1">{stats.crewCount}</p>
            <p className="text-xs text-adm-fg-3 mt-1">Ensemble & Leadership Roster</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-adm-success/12 border border-adm-success/30 flex items-center justify-center text-adm-success shrink-0">
            <Users size={22} />
          </div>
        </div>

        {/* INBOX STAT CARD */}
        <div
          onClick={() => onJump && onJump("inbox")}
          className="md:col-span-1 lg:col-span-2 adm-card p-6 flex items-center justify-between gap-4 cursor-pointer hover:border-adm-line-strong transition-colors"
        >
          <div>
            <p className="adm-muted font-medium">Inbox Inquiries</p>
            <p className="font-display text-4xl font-bold text-adm-fg mt-1">{stats.unreadCount}</p>
            <p className="text-xs text-adm-fg-3 mt-1">Direct Messages & Invitations</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-adm-info/12 border border-adm-info/30 flex items-center justify-center text-adm-info shrink-0">
            <Mail size={22} />
          </div>
        </div>
      </div>

      {/* 🚨 PUBLIC BROADCAST BANNER CONTROLLER */}
      <div className="adm-card p-5 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-adm-line pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 transition-colors ${
                broadcast.enabled
                  ? "bg-adm-danger/15 text-adm-danger border-adm-danger/35"
                  : "bg-adm-surface-2 text-adm-fg-3 border-adm-line"
              }`}
            >
              <Radio size={20} className={broadcast.enabled ? "animate-pulse" : ""} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="adm-h2">Sitewide Announcement Banner</h3>
                <span className={`adm-badge ${broadcast.enabled ? "adm-badge-danger" : "adm-badge-neutral"}`}>
                  {broadcast.enabled ? "Live on Portal" : "Offline"}
                </span>
              </div>
              <p className="adm-muted mt-0.5">
                Pushes an immediate high-priority alert bar across all public website pages.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              type="button"
              onClick={() => setBroadcast({ ...broadcast, enabled: !broadcast.enabled })}
              className={`adm-btn flex-1 md:flex-none ${
                broadcast.enabled ? "adm-btn-success" : "adm-btn-secondary"
              }`}
            >
              {broadcast.enabled ? "Banner Enabled (Click to Disable)" : "Enable Banner"}
            </button>
            <button
              type="button"
              onClick={handleSaveBroadcast}
              disabled={broadcastSaving}
              className="adm-btn adm-btn-primary flex-1 md:flex-none"
            >
              {broadcastSaving ? "Syncing..." : broadcastSaved ? "✓ Published" : "Publish Alert"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="adm-label">Headline / Announcement Content</label>
              <input
                type="text"
                placeholder="e.g. AUDITIONS EXTENDED TILL 11:59 PM TONIGHT | REHEARSAL VENUE SHIFTED TO OAT"
                value={broadcast.message || ""}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                className="adm-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="adm-label">Action Link Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. VIEW AUDITION DETAILS ➔"
                  value={broadcast.linkText || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkText: e.target.value })}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="adm-label">Target Destination URL / Path</label>
                <input
                  type="text"
                  placeholder="e.g. /auditions/resources"
                  value={broadcast.linkUrl || ""}
                  onChange={(e) => setBroadcast({ ...broadcast, linkUrl: e.target.value })}
                  className="adm-input"
                />
              </div>
            </div>
          </div>

          <div className="adm-panel p-4 flex flex-col justify-between gap-4">
            <div>
              <p className="adm-label mb-2">Banner Urgency Style</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "alert", label: "Urgent", badge: "adm-badge-danger" },
                  { id: "info", label: "Notice", badge: "adm-badge-accent" },
                  { id: "success", label: "Update", badge: "adm-badge-success" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setBroadcast({ ...broadcast, type: s.id })}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
                      broadcast.type === s.id
                        ? "border-adm-accent bg-adm-accent/15 text-adm-fg"
                        : "border-adm-line bg-adm-surface text-adm-fg-3 hover:text-adm-fg"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-adm-line">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-adm-fg-3 mb-1.5">
                Live Preview
              </p>
              <div
                className={`p-3 rounded-xl border text-xs font-medium truncate ${
                  broadcast.type === "alert"
                    ? "bg-adm-danger/12 text-adm-danger border-adm-danger/30"
                    : broadcast.type === "success"
                    ? "bg-adm-success/12 text-adm-success border-adm-success/30"
                    : "bg-adm-accent/12 text-adm-accent-text border-adm-accent/35"
                }`}
              >
                {broadcast.message || "No announcement is currently active"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <CrewActivityFeed />
    </div>
  );
}