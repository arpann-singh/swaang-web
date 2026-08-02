"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { getDeviceToken } from "@/lib/firebase";

export default function BackstageManager() {
  const [notices, setNotices] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  const [rehearsalReports, setRehearsalReports] = useState<any[]>([]);
  
  const [crewSettings, setCrewSettings] = useState({
    passcode: "SWAANG26",
    callDate: "",
    callTime: "",
    callLocation: "",
    callWho: "Full Cast & Crew"
  });

  const [liveCue, setLiveCue] = useState({
    state: "IDLE", // IDLE, STANDBY, GO
    message: "",
    timestamp: 0
  });

  const [noticeForm, setNoticeForm] = useState({ title: "", message: "", priority: "normal", author: "Directorate", sendPush: false });
  const [vaultForm, setVaultForm] = useState({ title: "", link: "", type: "script", sendPush: false });
  const [reportForm, setReportForm] = useState({ title: "", notes: "", nextCall: "", author: "Stage Manager" });

  useEffect(() => {
    const noticeSub = onSnapshot(collection(db, "callboard"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotices(fetched);
    });

    const vaultSub = onSnapshot(collection(db, "vault"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVault(fetched);
    });

    const reportSub = onSnapshot(collection(db, "rehearsal_reports"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRehearsalReports(fetched);
    });

    const settingsSub = onSnapshot(doc(db, "settings", "crew"), (docSnap) => {
      if (docSnap.exists()) {
        setCrewSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    const liveCueSub = onSnapshot(doc(db, "settings", "live_cue"), (docSnap) => {
      if (docSnap.exists()) {
        setLiveCue(docSnap.data() as any);
      }
    });

    return () => { noticeSub(); vaultSub(); reportSub(); settingsSub(); liveCueSub(); };
  }, []);

  const saveCrewSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "crew"), crewSettings, { merge: true });
      alert("Crew Settings Updated! 🔐");
    } catch (err) { alert("Failed to save settings."); }
  };

  const setLiveCueState = async (state: "IDLE" | "STANDBY" | "GO") => {
    try {
      const msg = state === "STANDBY" ? "STANDBY: PLACES PLEASE" : state === "GO" ? "GO! GO! GO!" : "";
      await setDoc(doc(db, "settings", "live_cue"), {
        state,
        message: msg,
        timestamp: Date.now()
      }, { merge: true });
    } catch (err) { alert("Failed to update Live Cue."); }
  };

  const registerAsAdmin = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') return alert("Reset browser permissions first.");

      const token = await getDeviceToken();
      if (token) {
        await setDoc(doc(db, "fcm_tokens", token), { 
          token, 
          role: "admin", 
          createdAt: Date.now() 
        }, { merge: true });
        alert("Admin device registered! You will now receive internal pings. 👑");
      }
    } catch (err) { alert("Admin setup failed."); }
  };

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'denied') return alert("Enable notifications in browser.");

      const token = await getDeviceToken();
      if (token) {
        await setDoc(doc(db, "fcm_tokens", token), { token, createdAt: Date.now() });
        alert("Push Notifications Enabled! 🔔");
      }
    } catch (err) { alert("Setup failed."); }
  };

  const postNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) return alert("Title and Message required!");
    try {
      await addDoc(collection(db, "callboard"), { 
        title: noticeForm.title,
        message: noticeForm.message,
        priority: noticeForm.priority,
        author: noticeForm.author,
        createdAt: Date.now(),
        acknowledgedBy: [] 
      });

      if (noticeForm.sendPush) {
        await fetch("/api/notify-crew", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: noticeForm.title, 
            message: noticeForm.message,
            recipientType: "all" 
          })
        });
      }
      setNoticeForm({ title: "", message: "", priority: "normal", author: "Directorate", sendPush: false });
      alert("Notice Posted!");
    } catch (err) { alert("Failed."); }
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Delete this notice?")) await deleteDoc(doc(db, "callboard", id));
  };

  const postReport = async () => {
    if (!reportForm.title || !reportForm.notes) return alert("Title and Notes required!");
    try {
      await addDoc(collection(db, "rehearsal_reports"), { 
        title: reportForm.title,
        notes: reportForm.notes,
        nextCall: reportForm.nextCall,
        author: reportForm.author,
        createdAt: Date.now()
      });

      setReportForm({ title: "", notes: "", nextCall: "", author: "Stage Manager" });
      alert("Rehearsal Report Logged!");
    } catch (err) { alert("Failed."); }
  };

  const deleteReport = async (id: string) => {
    if (confirm("Delete this report?")) await deleteDoc(doc(db, "rehearsal_reports", id));
  };

  const addToVault = async () => {
    if (!vaultForm.title || !vaultForm.link) return alert("Title and Link required!");
    try {
      await addDoc(collection(db, "vault"), { 
        title: vaultForm.title, 
        link: vaultForm.link, 
        type: vaultForm.type, 
        createdAt: Date.now() 
      });

      if (vaultForm.sendPush) {
        await fetch("/api/notify-crew", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: `📜 NEW ${vaultForm.type.toUpperCase()}`, 
            message: `${vaultForm.title} has been added to the Vault. Check it now!`,
            recipientType: "all"
          })
        });
      }

      setVaultForm({ title: "", link: "", type: "script", sendPush: false });
      alert("Vault Updated! 📁");
    } catch (err) { alert("Failed."); }
  };

  const deleteFromVault = async (id: string) => {
    if (confirm("Remove this item?")) await deleteDoc(doc(db, "vault", id));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 border-b-8 border-[var(--border-primary)] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Backstage Control</h2>
          <p className="font-black uppercase tracking-[0.3em] text-[#06D6A0] text-[10px] mt-1">Manage Crew Resources</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={registerAsAdmin} className="bg-[#FFD166] text-[var(--text-primary)] border-4 border-[var(--border-primary)] px-4 py-2 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 transition-all">
            👑 Admin Sync
          </button>
          <button onClick={enableNotifications} className="bg-[#06D6A0] text-white border-4 border-[var(--border-primary)] px-6 py-3 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 transition-all">
            🔔 Crew Alerts
          </button>
        </div>
      </div>

      {/* 🔥 NEW: LIVE CUE CONTROLLER */}
      <div className="bg-[#2D2D2D] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_black] mb-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] pointer-events-none opacity-20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-2 bg-white rounded-full" />
              <h3 className="font-black text-3xl uppercase tracking-tighter">LIVE CUE SYSTEM</h3>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest bg-black px-3 py-1 border-2 border-white">OVERRIDE ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setLiveCueState("IDLE")} className={`py-6 border-4 border-black font-black uppercase text-xl shadow-[6px_6px_0px_black] transition-all ${liveCue.state === 'IDLE' ? 'bg-black text-white translate-y-1 shadow-none' : 'bg-gray-400 text-black hover:bg-gray-300'}`}>
              IDLE (OFF)
            </button>
            <button onClick={() => setLiveCueState("STANDBY")} className={`py-6 border-4 border-black font-black uppercase text-xl shadow-[6px_6px_0px_black] transition-all ${liveCue.state === 'STANDBY' ? 'bg-[#FFD166] text-black translate-y-1 shadow-none animate-pulse' : 'bg-[#FFD166]/50 text-black hover:bg-[#FFD166]'}`}>
              STANDBY
            </button>
            <button onClick={() => setLiveCueState("GO")} className={`py-6 border-4 border-black font-black uppercase text-xl shadow-[6px_6px_0px_black] transition-all ${liveCue.state === 'GO' ? 'bg-[#06D6A0] text-black translate-y-1 shadow-none animate-pulse' : 'bg-[#06D6A0]/50 text-black hover:bg-[#06D6A0]'}`}>
              GO!
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#2D2D2D] border-4 border-[#FFD166] p-6 rounded-[2rem] shadow-[8px_8px_0px_#FFD166] mb-12 text-white">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-8 w-2 bg-[#FFD166] rounded-full" />
           <h3 className="font-black text-2xl uppercase tracking-tighter text-[#FFD166]">Daily Call Sheet & Security</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</label>
            <input type="text" placeholder="e.g. Oct 24" value={crewSettings.callDate} onChange={e => setCrewSettings({...crewSettings, callDate: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time</label>
            <input type="text" placeholder="e.g. 5:00 PM" value={crewSettings.callTime} onChange={e => setCrewSettings({...crewSettings, callTime: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
            <input type="text" placeholder="e.g. Auditorium" value={crewSettings.callLocation} onChange={e => setCrewSettings({...crewSettings, callLocation: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Who is Called?</label>
            <input type="text" placeholder="e.g. Leads Only" value={crewSettings.callWho} onChange={e => setCrewSettings({...crewSettings, callWho: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#FF5F5F]">Master Passcode</label>
            <input type="text" value={crewSettings.passcode} onChange={e => setCrewSettings({...crewSettings, passcode: e.target.value})} className="w-full bg-black/20 border-2 border-[#FF5F5F]/50 p-3 rounded-xl font-black tracking-widest text-[#FF5F5F]" />
          </div>
        </div>
        <button onClick={saveCrewSettings} className="mt-6 w-full bg-[#FFD166] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-3 rounded-xl font-black uppercase shadow-[4px_4px_0px_#FFF9F0] hover:translate-y-1 transition-all">
          Update Call Sheet & Passcode
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* CALL BOARD */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-2 bg-[#FFD166] rounded-full" />
             <h3 className="font-black text-2xl uppercase tracking-tighter">Call Board</h3>
          </div>

          <div className="bg-white border-4 border-[var(--border-primary)] p-6 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)]">
            <div className="space-y-4">
              <input placeholder="Notice Title" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              <textarea placeholder="Announcement..." value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl h-24 resize-none" />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Author" value={noticeForm.author} onChange={e => setNoticeForm({...noticeForm, author: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl text-sm" />
                <select value={noticeForm.priority} onChange={e => setNoticeForm({...noticeForm, priority: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-black uppercase text-sm rounded-xl">
                  <option value="normal">🔵 Normal</option>
                  <option value="urgent">🔴 Urgent (Requires Ack)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#FF5F5F]/10 border-2 border-[#FF5F5F] rounded-xl">
                <input type="checkbox" checked={noticeForm.sendPush} onChange={e => setNoticeForm({...noticeForm, sendPush: e.target.checked})} className="w-5 h-5 accent-[#FF5F5F]" />
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Push Alert to Crew</label>
              </div>

              <button onClick={postNotice} className="w-full bg-[#FFD166] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 transition-all">
                Post Notice
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {notices.map(n => (
              <div key={n.id} className="bg-white border-4 border-[var(--border-primary)] p-4 rounded-2xl flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-black uppercase text-sm leading-tight">{n.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 mt-1">{n.author} • {n.priority}</p>
                </div>
                <button onClick={() => deleteNotice(n.id)} className="bg-red-50 text-red-500 border-2 border-[var(--border-primary)] p-2 rounded-lg">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* REHEARSAL REPORTS */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-2 bg-[#FF5F5F] rounded-full" />
             <h3 className="font-black text-2xl uppercase tracking-tighter">Rehearsal Reports</h3>
          </div>

          <div className="bg-white border-4 border-[var(--border-primary)] p-6 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)]">
            <div className="space-y-4">
              <input placeholder="Report Title (e.g. Run Through Notes)" value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              <textarea placeholder="Detailed Notes for Cast & Crew..." value={reportForm.notes} onChange={e => setReportForm({...reportForm, notes: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl h-24 resize-none" />
              <input placeholder="Next Call Instructions" value={reportForm.nextCall} onChange={e => setReportForm({...reportForm, nextCall: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              <input placeholder="Author" value={reportForm.author} onChange={e => setReportForm({...reportForm, author: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              
              <button onClick={postReport} className="w-full bg-[#FF5F5F] text-white border-4 border-[var(--border-primary)] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 transition-all">
                Log Report
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {rehearsalReports.map(r => (
              <div key={r.id} className="bg-white border-4 border-[var(--border-primary)] p-4 rounded-2xl flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h4 className="font-black uppercase text-sm leading-tight">{r.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 mt-1">{r.author} • {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => deleteReport(r.id)} className="bg-red-50 text-red-500 border-2 border-[var(--border-primary)] p-2 rounded-lg">🗑️</button>
              </div>
            ))}
          </div>
        </div>

        {/* VAULT */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-2 bg-[#06D6A0] rounded-full" />
             <h3 className="font-black text-2xl uppercase tracking-tighter">Script Vault</h3>
          </div>

          <div className="bg-white border-4 border-[var(--border-primary)] p-6 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)]">
            <div className="space-y-4">
              <input placeholder="Document Name" value={vaultForm.title} onChange={e => setVaultForm({...vaultForm, title: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              <input placeholder="Drive Link" type="url" value={vaultForm.link} onChange={e => setVaultForm({...vaultForm, link: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-bold rounded-xl" />
              <select value={vaultForm.type} onChange={e => setVaultForm({...vaultForm, type: e.target.value})} className="w-full border-2 border-[var(--border-primary)] p-4 font-black uppercase text-sm rounded-xl">
                <option value="script">📝 Script</option>
                <option value="audio">🎵 Audio</option>
                <option value="document">📁 Document</option>
              </select>

              <div className="flex items-center gap-3 p-4 bg-[#06D6A0]/10 border-2 border-[#06D6A0] rounded-xl">
                <input type="checkbox" checked={vaultForm.sendPush} onChange={e => setVaultForm({...vaultForm, sendPush: e.target.checked})} className="w-5 h-5 accent-[#06D6A0]" />
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">Push Alert about update</label>
              </div>

              <button onClick={addToVault} className="w-full bg-[#06D6A0] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 transition-all">
                Upload to Vault
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {vault.map(v => (
              <div key={v.id} className="bg-white border-4 border-[var(--border-primary)] p-3 rounded-2xl flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-gray-100 border-2 border-[var(--border-primary)] rounded-lg flex items-center justify-center shrink-0">{v.type === 'script' ? '📝' : '📁'}</div>
                  <h4 className="font-black uppercase text-xs truncate">{v.title}</h4>
                </div>
                <button onClick={() => deleteFromVault(v.id)} className="bg-red-50 text-red-500 border-2 border-[var(--border-primary)] p-2 rounded-lg">🗑️</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}