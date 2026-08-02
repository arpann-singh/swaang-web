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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      
      {/* HEADER SECTION */}
      <div className="mb-12 border-b-8 border-black pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[#FFD166] p-6 shadow-[8px_8px_0px_black]">
        <div>
          <h2 className="text-4xl md:text-6xl font-cinzel font-black uppercase tracking-tighter text-black leading-none">Backstage<br/>Control</h2>
          <p className="font-mono font-black uppercase tracking-[0.4em] text-black bg-white inline-block px-2 py-1 mt-4 border-4 border-black">Manage Crew Resources</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={registerAsAdmin} className="bg-white text-black border-4 border-black px-6 py-4 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
            👑 ADMIN SYNC
          </button>
          <button onClick={enableNotifications} className="bg-[#06D6A0] text-black border-4 border-black px-6 py-4 font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_black] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
            🔔 CREW ALERTS
          </button>
        </div>
      </div>

      {/* 🔥 NEW: LIVE CUE CONTROLLER */}
      <div className="bg-black border-8 border-black p-6 md:p-10 shadow-[12px_12px_0px_#FF5F5F] mb-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:40px_40px] pointer-events-none opacity-50" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-4 bg-[#FF5F5F]" />
              <h3 className="font-cinzel font-black text-3xl md:text-5xl uppercase tracking-tighter">LIVE CUE SYSTEM</h3>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] bg-[#FF5F5F] text-black font-black px-4 py-2 border-4 border-white shadow-[4px_4px_0px_white]">OVERRIDE ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => setLiveCueState("IDLE")} className={`py-8 border-4 border-white font-black uppercase text-2xl tracking-widest shadow-[6px_6px_0px_white] transition-all ${liveCue.state === 'IDLE' ? 'bg-white text-black translate-y-1 translate-x-1 shadow-none' : 'bg-transparent text-white hover:bg-white/10'}`}>
              IDLE [OFF]
            </button>
            <button onClick={() => setLiveCueState("STANDBY")} className={`py-8 border-4 border-[#FFD166] font-black uppercase text-2xl tracking-widest shadow-[6px_6px_0px_#FFD166] transition-all ${liveCue.state === 'STANDBY' ? 'bg-[#FFD166] text-black translate-y-1 translate-x-1 shadow-none animate-pulse' : 'bg-transparent text-[#FFD166] hover:bg-[#FFD166]/10'}`}>
              STANDBY
            </button>
            <button onClick={() => setLiveCueState("GO")} className={`py-8 border-4 border-[#06D6A0] font-black uppercase text-2xl tracking-widest shadow-[6px_6px_0px_#06D6A0] transition-all ${liveCue.state === 'GO' ? 'bg-[#06D6A0] text-black translate-y-1 translate-x-1 shadow-none animate-[pulse_0.5s_infinite]' : 'bg-transparent text-[#06D6A0] hover:bg-[#06D6A0]/10'}`}>
              GO! GO! GO!
            </button>
          </div>
        </div>
      </div>

      {/* DAILY CALL SHEET */}
      <div className="bg-white border-8 border-black p-6 md:p-10 shadow-[12px_12px_0px_black] mb-16 text-black">
        <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
           <div className="h-8 w-8 bg-[#FFD166] border-4 border-black flex items-center justify-center font-black">!</div>
           <h3 className="font-cinzel font-black text-3xl uppercase tracking-tighter">DAILY CALL SHEET & SECURITY</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">DATE</label>
            <input type="text" placeholder="e.g. OCT 24" value={crewSettings.callDate} onChange={e => setCrewSettings({...crewSettings, callDate: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] outline-none transition-all placeholder:text-black/30" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">TIME</label>
            <input type="text" placeholder="e.g. 17:00 HRS" value={crewSettings.callTime} onChange={e => setCrewSettings({...crewSettings, callTime: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] outline-none transition-all placeholder:text-black/30" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">LOCATION</label>
            <input type="text" placeholder="e.g. AUDITORIUM" value={crewSettings.callLocation} onChange={e => setCrewSettings({...crewSettings, callLocation: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] outline-none transition-all placeholder:text-black/30" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-1">CALLED</label>
            <input type="text" placeholder="e.g. LEADS ONLY" value={crewSettings.callWho} onChange={e => setCrewSettings({...crewSettings, callWho: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm focus:bg-[#FFD166] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] outline-none transition-all placeholder:text-black/30" />
          </div>
          <div className="space-y-2 lg:col-span-1 relative">
            <label className="text-[10px] font-black uppercase tracking-widest bg-[#FF5F5F] text-black border-2 border-black px-2 py-1 absolute -top-3 right-4 z-10 rotate-3">TOP SECRET</label>
            <label className="text-[10px] font-black uppercase tracking-widest bg-black text-[#FF5F5F] px-2 py-1">MASTER PASSCODE</label>
            <input type="text" value={crewSettings.passcode} onChange={e => setCrewSettings({...crewSettings, passcode: e.target.value})} className="w-full bg-[#FF5F5F] border-4 border-black p-4 font-black uppercase text-sm tracking-[0.2em] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[6px_6px_0px_black] outline-none transition-all text-black" />
          </div>
        </div>
        <button onClick={saveCrewSettings} className="mt-8 w-full bg-[#FFD166] text-black border-4 border-black py-5 font-black uppercase tracking-widest text-lg shadow-[8px_8px_0px_black] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_black] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all">
          [ UPDATE CALL SHEET & PASSCODE ]
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* CALL BOARD */}
        <div className="space-y-6 flex flex-col h-[700px]">
          <div className="flex items-center gap-3 bg-[#FFD166] border-4 border-black p-4 shadow-[4px_4px_0px_black]">
             <div className="h-6 w-6 bg-black flex items-center justify-center font-black text-[#FFD166]">1</div>
             <h3 className="font-black text-xl uppercase tracking-tighter text-black">CALL BOARD</h3>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] flex-shrink-0">
            <div className="space-y-4">
              <input placeholder="NOTICE TITLE" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
              <textarea placeholder="ANNOUNCEMENT..." value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-bold uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] h-24 resize-none placeholder:text-black/30" />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="AUTHOR" value={noticeForm.author} onChange={e => setNoticeForm({...noticeForm, author: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
                <select value={noticeForm.priority} onChange={e => setNoticeForm({...noticeForm, priority: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] cursor-pointer">
                  <option value="normal">NORMAL</option>
                  <option value="urgent">URGENT (!)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 border-4 border-black bg-[#FF5F5F] shadow-[4px_4px_0px_black] mt-2">
                <input type="checkbox" checked={noticeForm.sendPush} onChange={e => setNoticeForm({...noticeForm, sendPush: e.target.checked})} className="w-6 h-6 accent-black border-4 border-black cursor-pointer" />
                <label className="text-xs font-black uppercase tracking-widest text-black cursor-pointer">PUSH ALERT TO CREW</label>
              </div>

              <button onClick={postNotice} className="w-full bg-black text-white border-4 border-black py-4 mt-2 font-black uppercase tracking-widest shadow-[6px_6px_0px_#FFD166] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#FFD166] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                POST NOTICE
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 border-4 border-black bg-white p-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] custom-scrollbar">
            {notices.map(n => (
              <div key={n.id} className={`border-4 border-black p-4 flex flex-col gap-2 shadow-[4px_4px_0px_black] ${n.priority === 'urgent' ? 'bg-[#FF5F5F]' : 'bg-white'}`}>
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-black uppercase text-sm leading-tight text-black">{n.title}</h4>
                  <button onClick={() => deleteNotice(n.id)} className="bg-black text-white px-2 py-1 text-xs font-black uppercase hover:bg-[#FF5F5F] border-2 border-black">DEL</button>
                </div>
                <p className="font-bold text-xs uppercase opacity-80 text-black">{n.message}</p>
                <div className="mt-2 text-[9px] font-black uppercase bg-black text-white px-2 py-1 self-start inline-block">
                  BY {n.author}
                </div>
              </div>
            ))}
            {notices.length === 0 && <p className="text-center font-black uppercase opacity-30 mt-10 text-black">NO NOTICES</p>}
          </div>
        </div>

        {/* REHEARSAL REPORTS */}
        <div className="space-y-6 flex flex-col h-[700px]">
          <div className="flex items-center gap-3 bg-[#FF5F5F] border-4 border-black p-4 shadow-[4px_4px_0px_black]">
             <div className="h-6 w-6 bg-black flex items-center justify-center font-black text-[#FF5F5F]">2</div>
             <h3 className="font-black text-xl uppercase tracking-tighter text-black">REHEARSAL REPORTS</h3>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] flex-shrink-0">
            <div className="space-y-4">
              <input placeholder="REPORT TITLE" value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
              <textarea placeholder="DETAILED NOTES..." value={reportForm.notes} onChange={e => setReportForm({...reportForm, notes: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-bold uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] h-24 resize-none placeholder:text-black/30" />
              
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="NEXT CALL" value={reportForm.nextCall} onChange={e => setReportForm({...reportForm, nextCall: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
                <input placeholder="AUTHOR" value={reportForm.author} onChange={e => setReportForm({...reportForm, author: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
              </div>

              <button onClick={postReport} className="w-full bg-black text-white border-4 border-black py-4 mt-2 font-black uppercase tracking-widest shadow-[6px_6px_0px_#FF5F5F] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#FF5F5F] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                LOG REPORT
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 border-4 border-black bg-white p-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] custom-scrollbar">
            {rehearsalReports.map(r => (
              <div key={r.id} className="bg-white border-4 border-black p-4 flex flex-col gap-2 shadow-[4px_4px_0px_black]">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-black uppercase text-sm leading-tight text-black">{r.title}</h4>
                  <button onClick={() => deleteReport(r.id)} className="bg-black text-white px-2 py-1 text-xs font-black uppercase hover:bg-[#FF5F5F] border-2 border-black">DEL</button>
                </div>
                <p className="font-bold text-xs uppercase opacity-80 text-black">{r.notes}</p>
                {r.nextCall && <p className="font-black text-xs uppercase text-[#FF5F5F] mt-1">NEXT: {r.nextCall}</p>}
                <div className="mt-2 text-[9px] font-black uppercase bg-black text-white px-2 py-1 self-start inline-block">
                  BY {r.author} • {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {rehearsalReports.length === 0 && <p className="text-center font-black uppercase opacity-30 mt-10 text-black">NO REPORTS YET</p>}
          </div>
        </div>

        {/* VAULT */}
        <div className="space-y-6 flex flex-col h-[700px]">
          <div className="flex items-center gap-3 bg-[#06D6A0] border-4 border-black p-4 shadow-[4px_4px_0px_black]">
             <div className="h-6 w-6 bg-black flex items-center justify-center font-black text-[#06D6A0]">3</div>
             <h3 className="font-black text-xl uppercase tracking-tighter text-black">SCRIPT VAULT</h3>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] flex-shrink-0">
            <div className="space-y-4">
              <input placeholder="DOCUMENT NAME" value={vaultForm.title} onChange={e => setVaultForm({...vaultForm, title: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
              <input placeholder="SECURE LINK (DRIVE/PDF)" type="url" value={vaultForm.link} onChange={e => setVaultForm({...vaultForm, link: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] placeholder:text-black/30" />
              
              <select value={vaultForm.type} onChange={e => setVaultForm({...vaultForm, type: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-xs focus:bg-[#FFD166] outline-none shadow-[4px_4px_0px_black] cursor-pointer">
                <option value="script">SCRIPT (TXT/PDF)</option>
                <option value="audio">AUDIO FILE</option>
                <option value="document">OTHER DOC</option>
              </select>

              <div className="flex items-center gap-3 p-4 border-4 border-black bg-[#06D6A0] shadow-[4px_4px_0px_black] mt-2">
                <input type="checkbox" checked={vaultForm.sendPush} onChange={e => setVaultForm({...vaultForm, sendPush: e.target.checked})} className="w-6 h-6 accent-black border-4 border-black cursor-pointer" />
                <label className="text-xs font-black uppercase tracking-widest text-black cursor-pointer">NOTIFY CREW</label>
              </div>

              <button onClick={addToVault} className="w-full bg-black text-white border-4 border-black py-4 mt-2 font-black uppercase tracking-widest shadow-[6px_6px_0px_#06D6A0] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[10px_10px_0px_#06D6A0] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all">
                UPLOAD TO VAULT
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 border-4 border-black bg-white p-4 shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] custom-scrollbar">
            {vault.map(v => (
              <div key={v.id} className="bg-white border-4 border-black p-4 flex items-center justify-between gap-4 shadow-[4px_4px_0px_black]">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 bg-[#FFD166] border-4 border-black flex items-center justify-center shrink-0 font-black text-lg">
                    {v.type === 'script' ? 'S' : v.type === 'audio' ? 'A' : 'D'}
                  </div>
                  <div className="flex flex-col">
                    <a href={v.link} target="_blank" rel="noopener noreferrer" className="font-black uppercase text-sm truncate hover:underline hover:text-[#06D6A0] transition-colors">{v.title}</a>
                    <span className="text-[9px] font-black uppercase text-black/50">{v.type}</span>
                  </div>
                </div>
                <button onClick={() => deleteFromVault(v.id)} className="bg-black text-white px-2 py-2 text-xs font-black uppercase hover:bg-[#FF5F5F] border-2 border-black shrink-0">DEL</button>
              </div>
            ))}
            {vault.length === 0 && <p className="text-center font-black uppercase opacity-30 mt-10 text-black">VAULT EMPTY</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
