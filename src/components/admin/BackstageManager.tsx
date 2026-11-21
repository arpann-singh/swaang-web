"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { getDeviceToken } from "@/lib/firebase";
import {
  Bell,
  ShieldCheck,
  Radio,
  KeyRound,
  Megaphone,
  ClipboardList,
  FolderLock,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function BackstageManager() {
  const [notices, setNotices] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  const [rehearsalReports, setRehearsalReports] = useState<any[]>([]);

  const [crewSettings, setCrewSettings] = useState({
    passcode: "SWAANG26",
    callDate: "",
    callTime: "",
    callLocation: "",
    callWho: "Full Cast & Crew",
  });

  const [liveCue, setLiveCue] = useState({
    state: "IDLE", // IDLE, STANDBY, GO
    message: "",
    timestamp: 0,
  });

  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    priority: "normal",
    author: "Directorate",
    sendPush: false,
  });
  const [vaultForm, setVaultForm] = useState({
    title: "",
    link: "",
    type: "script",
    sendPush: false,
  });
  const [reportForm, setReportForm] = useState({
    title: "",
    notes: "",
    nextCall: "",
    author: "Stage Manager",
  });

  useEffect(() => {
    const noticeSub = onSnapshot(collection(db, "callboard"), (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotices(fetched);
    });

    const vaultSub = onSnapshot(collection(db, "vault"), (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVault(fetched);
    });

    const reportSub = onSnapshot(collection(db, "rehearsal_reports"), (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRehearsalReports(fetched);
    });

    const settingsSub = onSnapshot(doc(db, "settings", "crew"), (docSnap) => {
      if (docSnap.exists()) {
        setCrewSettings((prev) => ({ ...prev, ...docSnap.data() }));
      }
    });

    const liveCueSub = onSnapshot(doc(db, "settings", "live_cue"), (docSnap) => {
      if (docSnap.exists()) {
        setLiveCue(docSnap.data() as any);
      }
    });

    return () => {
      noticeSub();
      vaultSub();
      reportSub();
      settingsSub();
      liveCueSub();
    };
  }, []);

  const saveCrewSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "crew"), crewSettings, { merge: true });
      alert("Crew Settings Updated! 🔐");
    } catch (err) {
      alert("Failed to save settings.");
    }
  };

  const setLiveCueState = async (state: "IDLE" | "STANDBY" | "GO") => {
    try {
      const msg =
        state === "STANDBY"
          ? "STANDBY: PLACES PLEASE"
          : state === "GO"
          ? "GO! GO! GO!"
          : "";
      await setDoc(
        doc(db, "settings", "live_cue"),
        {
          state,
          message: msg,
          timestamp: Date.now(),
        },
        { merge: true }
      );
    } catch (err) {
      alert("Failed to update Live Cue.");
    }
  };

  const registerAsAdmin = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") return alert("Reset browser permissions first.");

      const token = await getDeviceToken();
      if (token) {
        await setDoc(
          doc(db, "fcm_tokens", token),
          {
            token,
            role: "admin",
            createdAt: Date.now(),
          },
          { merge: true }
        );
        alert("Admin device registered! You will now receive internal pings. 👑");
      }
    } catch (err) {
      alert("Admin setup failed.");
    }
  };

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") return alert("Enable notifications in browser.");

      const token = await getDeviceToken();
      if (token) {
        await setDoc(doc(db, "fcm_tokens", token), { token, createdAt: Date.now() });
        alert("Push Notifications Enabled! 🔔");
      }
    } catch (err) {
      alert("Setup failed.");
    }
  };

  const postNotice = async () => {
    if (!noticeForm.title || !noticeForm.message)
      return alert("Title and Message required!");
    try {
      await addDoc(collection(db, "callboard"), {
        title: noticeForm.title,
        message: noticeForm.message,
        priority: noticeForm.priority,
        author: noticeForm.author,
        createdAt: Date.now(),
        acknowledgedBy: [],
      });

      if (noticeForm.sendPush) {
        const idToken = await auth.currentUser?.getIdToken();
        await fetch("/api/notify-crew", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            title: noticeForm.title,
            message: noticeForm.message,
            recipientType: "all",
          }),
        });
      }
      setNoticeForm({
        title: "",
        message: "",
        priority: "normal",
        author: "Directorate",
        sendPush: false,
      });
      alert("Notice Posted!");
    } catch (err) {
      alert("Failed.");
    }
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Delete this notice?")) await deleteDoc(doc(db, "callboard", id));
  };

  const postReport = async () => {
    if (!reportForm.title || !reportForm.notes)
      return alert("Title and Notes required!");
    try {
      await addDoc(collection(db, "rehearsal_reports"), {
        title: reportForm.title,
        notes: reportForm.notes,
        nextCall: reportForm.nextCall,
        author: reportForm.author,
        createdAt: Date.now(),
      });

      setReportForm({ title: "", notes: "", nextCall: "", author: "Stage Manager" });
      alert("Rehearsal Report Logged!");
    } catch (err) {
      alert("Failed.");
    }
  };

  const deleteReport = async (id: string) => {
    if (confirm("Delete this report?"))
      await deleteDoc(doc(db, "rehearsal_reports", id));
  };

  const addToVault = async () => {
    if (!vaultForm.title || !vaultForm.link)
      return alert("Title and Link required!");
    try {
      await addDoc(collection(db, "vault"), {
        title: vaultForm.title,
        link: vaultForm.link,
        type: vaultForm.type,
        createdAt: Date.now(),
      });

      if (vaultForm.sendPush) {
        const idToken = await auth.currentUser?.getIdToken();
        await fetch("/api/notify-crew", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            title: `📜 NEW ${vaultForm.type.toUpperCase()}`,
            message: `${vaultForm.title} has been added to the Vault. Check it now!`,
            recipientType: "all",
          }),
        });
      }

      setVaultForm({ title: "", link: "", type: "script", sendPush: false });
      alert("Vault Updated! 📁");
    } catch (err) {
      alert("Failed.");
    }
  };

  const deleteFromVault = async (id: string) => {
    if (confirm("Remove this item?")) await deleteDoc(doc(db, "vault", id));
  };

  return (
    <div className="space-y-6 text-left w-full">
      {/* HEADER SECTION */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Manage Crew Resources (/crew)</p>
          <h2 className="adm-title mt-1">Backstage Control</h2>
          <p className="adm-muted mt-1">
            Control live stage cues, daily call sheets, master crew passcodes, rehearsal reports, and the script vault.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={registerAsAdmin}
            className="adm-btn adm-btn-secondary"
          >
            <ShieldCheck size={15} className="text-adm-accent-text" />
            <span>Admin Sync</span>
          </button>
          <button
            type="button"
            onClick={enableNotifications}
            className="adm-btn adm-btn-primary"
          >
            <Bell size={15} />
            <span>Crew Alerts</span>
          </button>
        </div>
      </div>

      {/* 🔥 LIVE CUE CONTROLLER */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-adm-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-adm-danger/15 border border-adm-danger/35 flex items-center justify-center text-adm-danger">
              <Radio size={19} />
            </div>
            <div>
              <h3 className="adm-h2">Live Cue System</h3>
              <p className="adm-muted">Real-time stage cue dispatch to backstage devices</p>
            </div>
          </div>
          <span className="adm-badge adm-badge-danger">Override Active: {liveCue.state}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setLiveCueState("IDLE")}
            className={`py-5 rounded-xl border font-bold text-base tracking-wider transition-all ${
              liveCue.state === "IDLE"
                ? "bg-adm-fg text-adm-bg border-adm-fg"
                : "bg-adm-surface-2 text-adm-fg-2 border-adm-line hover:text-adm-fg"
            }`}
          >
            IDLE [OFF]
          </button>
          <button
            type="button"
            onClick={() => setLiveCueState("STANDBY")}
            className={`py-5 rounded-xl border font-bold text-base tracking-wider transition-all ${
              liveCue.state === "STANDBY"
                ? "bg-adm-accent text-adm-accent-fg border-adm-accent animate-pulse"
                : "bg-adm-accent/10 text-adm-accent-text border-adm-accent/35 hover:bg-adm-accent/20"
            }`}
          >
            STANDBY
          </button>
          <button
            type="button"
            onClick={() => setLiveCueState("GO")}
            className={`py-5 rounded-xl border font-bold text-base tracking-wider transition-all ${
              liveCue.state === "GO"
                ? "bg-adm-success text-black border-adm-success animate-pulse"
                : "bg-adm-success/10 text-adm-success border-adm-success/35 hover:bg-adm-success/20"
            }`}
          >
            GO! GO! GO!
          </button>
        </div>
      </div>

      {/* DAILY CALL SHEET */}
      <div className="adm-card p-5 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b border-adm-line pb-4">
          <div className="w-10 h-10 rounded-xl bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text">
            <KeyRound size={19} />
          </div>
          <div>
            <h3 className="adm-h2">Daily Call Sheet & Security</h3>
            <p className="adm-muted">Set the daily call details and backstage master passcode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="adm-label">Date</label>
            <input
              type="text"
              placeholder="e.g. OCT 24"
              value={crewSettings.callDate}
              onChange={(e) => setCrewSettings({ ...crewSettings, callDate: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Time</label>
            <input
              type="text"
              placeholder="e.g. 17:00 HRS"
              value={crewSettings.callTime}
              onChange={(e) => setCrewSettings({ ...crewSettings, callTime: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Location</label>
            <input
              type="text"
              placeholder="e.g. AUDITORIUM"
              value={crewSettings.callLocation}
              onChange={(e) =>
                setCrewSettings({ ...crewSettings, callLocation: e.target.value })
              }
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label">Called</label>
            <input
              type="text"
              placeholder="e.g. LEADS ONLY"
              value={crewSettings.callWho}
              onChange={(e) => setCrewSettings({ ...crewSettings, callWho: e.target.value })}
              className="adm-input"
            />
          </div>
          <div>
            <label className="adm-label text-adm-danger">Master Passcode</label>
            <input
              type="text"
              value={crewSettings.passcode}
              onChange={(e) => setCrewSettings({ ...crewSettings, passcode: e.target.value })}
              className="adm-input font-mono font-bold tracking-widest"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveCrewSettings}
          className="adm-btn adm-btn-primary w-full"
        >
          Update Call Sheet & Passcode
        </button>
      </div>

      {/* 3-COLUMN WORKSPACE: CALL BOARD, REHEARSAL REPORTS, SCRIPT VAULT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* 1. CALL BOARD */}
        <div className="adm-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <h3 className="adm-h2 flex items-center gap-2">
              <Megaphone size={17} className="text-adm-accent-text" />
              <span>1. Call Board</span>
            </h3>
            <span className="adm-badge adm-badge-neutral">{notices.length}</span>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Notice Title"
              value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
              className="adm-input"
            />
            <textarea
              placeholder="Announcement..."
              value={noticeForm.message}
              onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })}
              className="adm-input"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Author"
                value={noticeForm.author}
                onChange={(e) => setNoticeForm({ ...noticeForm, author: e.target.value })}
                className="adm-input"
              />
              <select
                value={noticeForm.priority}
                onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                className="adm-input"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent (!)</option>
              </select>
            </div>

            <label className="adm-panel p-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noticeForm.sendPush}
                onChange={(e) =>
                  setNoticeForm({ ...noticeForm, sendPush: e.target.checked })
                }
                className="adm-check"
              />
              <span className="text-xs font-semibold text-adm-fg">Push Alert to Crew</span>
            </label>

            <button
              type="button"
              onClick={postNotice}
              className="adm-btn adm-btn-primary w-full"
            >
              Post Notice
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto space-y-2.5 pt-3 border-t border-adm-line">
            {notices.map((n) => (
              <div
                key={n.id}
                className={`adm-panel p-3.5 space-y-1.5 ${
                  n.priority === "urgent" ? "border-adm-danger/45" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {n.priority === "urgent" && (
                      <span className="adm-badge adm-badge-danger text-[10px]">Urgent</span>
                    )}
                    <h4 className="font-semibold text-sm text-adm-fg truncate">{n.title}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteNotice(n.id)}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-xs text-adm-fg-2">{n.message}</p>
                <span className="text-[11px] text-adm-fg-3 block">By {n.author}</span>
              </div>
            ))}
            {notices.length === 0 && (
              <p className="text-center adm-muted py-6">No notices posted yet.</p>
            )}
          </div>
        </div>

        {/* 2. REHEARSAL REPORTS */}
        <div className="adm-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <h3 className="adm-h2 flex items-center gap-2">
              <ClipboardList size={17} className="text-adm-danger" />
              <span>2. Rehearsal Reports</span>
            </h3>
            <span className="adm-badge adm-badge-neutral">{rehearsalReports.length}</span>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Report Title"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              className="adm-input"
            />
            <textarea
              placeholder="Detailed Notes..."
              value={reportForm.notes}
              onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
              className="adm-input"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Next Call"
                value={reportForm.nextCall}
                onChange={(e) => setReportForm({ ...reportForm, nextCall: e.target.value })}
                className="adm-input"
              />
              <input
                placeholder="Author"
                value={reportForm.author}
                onChange={(e) => setReportForm({ ...reportForm, author: e.target.value })}
                className="adm-input"
              />
            </div>

            <button
              type="button"
              onClick={postReport}
              className="adm-btn adm-btn-primary w-full"
            >
              Log Report
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto space-y-2.5 pt-3 border-t border-adm-line">
            {rehearsalReports.map((r) => (
              <div key={r.id} className="adm-panel p-3.5 space-y-1.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-sm text-adm-fg">{r.title}</h4>
                  <button
                    type="button"
                    onClick={() => deleteReport(r.id)}
                    className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <p className="text-xs text-adm-fg-2">{r.notes}</p>
                {r.nextCall && (
                  <p className="text-xs font-semibold text-adm-accent-text">
                    Next Call: {r.nextCall}
                  </p>
                )}
                <span className="text-[11px] text-adm-fg-3 block">
                  By {r.author} • {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {rehearsalReports.length === 0 && (
              <p className="text-center adm-muted py-6">No reports logged yet.</p>
            )}
          </div>
        </div>

        {/* 3. SCRIPT VAULT */}
        <div className="adm-card p-5 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-adm-line pb-3">
            <h3 className="adm-h2 flex items-center gap-2">
              <FolderLock size={17} className="text-adm-success" />
              <span>3. Script Vault</span>
            </h3>
            <span className="adm-badge adm-badge-neutral">{vault.length}</span>
          </div>

          <div className="space-y-3">
            <input
              placeholder="Document Name"
              value={vaultForm.title}
              onChange={(e) => setVaultForm({ ...vaultForm, title: e.target.value })}
              className="adm-input"
            />
            <input
              placeholder="Secure Link (Drive/PDF)"
              type="url"
              value={vaultForm.link}
              onChange={(e) => setVaultForm({ ...vaultForm, link: e.target.value })}
              className="adm-input"
            />

            <select
              value={vaultForm.type}
              onChange={(e) => setVaultForm({ ...vaultForm, type: e.target.value })}
              className="adm-input"
            >
              <option value="script">Script (TXT/PDF)</option>
              <option value="audio">Audio File</option>
              <option value="document">Other Document</option>
            </select>

            <label className="adm-panel p-3 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={vaultForm.sendPush}
                onChange={(e) =>
                  setVaultForm({ ...vaultForm, sendPush: e.target.checked })
                }
                className="adm-check"
              />
              <span className="text-xs font-semibold text-adm-fg">Notify Crew</span>
            </label>

            <button
              type="button"
              onClick={addToVault}
              className="adm-btn adm-btn-primary w-full"
            >
              Upload to Vault
            </button>
          </div>

          <div className="max-h-[340px] overflow-y-auto space-y-2.5 pt-3 border-t border-adm-line">
            {vault.map((v) => (
              <div
                key={v.id}
                className="adm-panel p-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-adm-accent/15 border border-adm-accent/35 text-adm-accent-text flex items-center justify-center shrink-0 font-bold text-xs uppercase">
                    {v.type === "script" ? "S" : v.type === "audio" ? "A" : "D"}
                  </div>
                  <div className="min-w-0">
                    <a
                      href={v.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-adm-fg hover:text-adm-accent-text truncate flex items-center gap-1"
                    >
                      <span className="truncate">{v.title}</span>
                      <ExternalLink size={12} className="shrink-0" />
                    </a>
                    <span className="text-[11px] uppercase text-adm-fg-3">{v.type}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteFromVault(v.id)}
                  className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm shrink-0"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {vault.length === 0 && (
              <p className="text-center adm-muted py-6">Vault is empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
