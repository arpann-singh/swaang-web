"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function BackstageManager() {
  const [notices, setNotices] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  
  // 🔥 NEW: State for Call Sheet and Security
  const [crewSettings, setCrewSettings] = useState({
    passcode: "SWAANG26",
    callDate: "",
    callTime: "",
    callLocation: "",
    callWho: "Full Cast & Crew"
  });

  const [noticeForm, setNoticeForm] = useState({ title: "", message: "", priority: "normal", author: "Directorate" });
  const [vaultForm, setVaultForm] = useState({ title: "", link: "", type: "script" });

  useEffect(() => {
    // Fetch Private Call Board
    const noticeSub = onSnapshot(collection(db, "callboard"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotices(fetched);
    });

    // Fetch Vault
    const vaultSub = onSnapshot(collection(db, "vault"), (snap) => {
      let fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setVault(fetched);
    });

    // 🔥 NEW: Fetch Crew Settings (Passcode & Call Sheet)
    const settingsSub = onSnapshot(doc(db, "settings", "crew"), (docSnap) => {
      if (docSnap.exists()) {
        setCrewSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => { noticeSub(); vaultSub(); settingsSub(); };
  }, []);

  // 🔥 NEW: Save Call Sheet & Security
  const saveCrewSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "crew"), crewSettings, { merge: true });
      alert("Crew Settings Updated! 🔐");
    } catch (err) { alert("Failed to save settings."); }
  };

  const postNotice = async () => {
    if (!noticeForm.title || !noticeForm.message) return alert("Title and Message required!");
    try {
      await addDoc(collection(db, "callboard"), { 
        ...noticeForm, 
        createdAt: Date.now(),
        acknowledgedBy: [] // 🔥 NEW: Empty array to track who read it!
      });
      setNoticeForm({ title: "", message: "", priority: "normal", author: "Directorate" });
    } catch (err) { alert("Failed to post notice."); }
  };

  const deleteNotice = async (id: string) => {
    if (confirm("Delete this notice?")) await deleteDoc(doc(db, "callboard", id));
  };

  const addToVault = async () => {
    if (!vaultForm.title || !vaultForm.link) return alert("Title and Link required!");
    try {
      await addDoc(collection(db, "vault"), { ...vaultForm, createdAt: Date.now() });
      setVaultForm({ title: "", link: "", type: "script" });
    } catch (err) { alert("Failed to add to vault."); }
  };

  const deleteFromVault = async (id: string) => {
    if (confirm("Remove this item from the vault?")) await deleteDoc(doc(db, "vault", id));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 border-b-8 border-[#2D2D2D] pb-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Backstage Control</h2>
        <p className="font-black uppercase tracking-[0.3em] text-[#06D6A0] text-[10px] mt-1">Manage Crew Resources</p>
      </div>

      {/* 🔥 NEW: THE COMMAND CENTER (Call Sheet & Passcode) */}
      <div className="bg-[#2D2D2D] border-4 border-[#FFD166] p-6 rounded-[2rem] shadow-[8px_8px_0px_#FFD166] mb-12 text-white">
        <div className="flex items-center gap-3 mb-6">
           <div className="h-8 w-2 bg-[#FFD166] rounded-full" />
           <h3 className="font-black text-2xl uppercase tracking-tighter text-[#FFD166]">Daily Call Sheet & Security</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Date</label>
            <input type="text" placeholder="e.g. Oct 24" value={crewSettings.callDate} onChange={e => setCrewSettings({...crewSettings, callDate: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none transition-colors" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Time</label>
            <input type="text" placeholder="e.g. 5:00 PM" value={crewSettings.callTime} onChange={e => setCrewSettings({...crewSettings, callTime: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none transition-colors" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
            <input type="text" placeholder="e.g. Auditorium" value={crewSettings.callLocation} onChange={e => setCrewSettings({...crewSettings, callLocation: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none transition-colors" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Who is Called?</label>
            <input type="text" placeholder="e.g. Leads Only" value={crewSettings.callWho} onChange={e => setCrewSettings({...crewSettings, callWho: e.target.value})} className="w-full bg-black/20 border-2 border-[#FFD166]/30 p-3 rounded-xl font-bold focus:border-[#FFD166] outline-none transition-colors" />
          </div>
          <div className="space-y-2 lg:col-span-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#FF5F5F]">Master Passcode</label>
            <input type="text" value={crewSettings.passcode} onChange={e => setCrewSettings({...crewSettings, passcode: e.target.value})} className="w-full bg-black/20 border-2 border-[#FF5F5F]/50 p-3 rounded-xl font-black tracking-widest focus:border-[#FF5F5F] outline-none transition-colors text-[#FF5F5F]" />
          </div>
        </div>
        <button onClick={saveCrewSettings} className="mt-6 w-full bg-[#FFD166] text-[#2D2D2D] border-4 border-[#FFD166] py-3 rounded-xl font-black uppercase shadow-[4px_4px_0px_#FFF9F0] hover:translate-y-1 hover:shadow-none transition-all">
          Update Call Sheet & Passcode
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        
        {/* 📢 THE MEGAPHONE */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-2 bg-[#FFD166] rounded-full" />
             <h3 className="font-black text-2xl uppercase tracking-tighter">Call Board</h3>
          </div>

          <div className="bg-white border-4 border-[#2D2D2D] p-6 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D]">
            <div className="space-y-4">
              <input placeholder="Notice Title (e.g. Call Time Changed)" value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
              <textarea placeholder="Type your internal announcement here..." value={noticeForm.message} onChange={e => setNoticeForm({...noticeForm, message: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl h-24 resize-none" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Author (e.g. Arpan / Stage Mgr)" value={noticeForm.author} onChange={e => setNoticeForm({...noticeForm, author: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl text-sm" />
                <select value={noticeForm.priority} onChange={e => setNoticeForm({...noticeForm, priority: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-black uppercase text-sm rounded-xl cursor-pointer">
                  <option value="normal">🔵 Normal</option>
                  <option value="urgent">🔴 Urgent (Requires Ack)</option>
                </select>
              </div>
              <button onClick={postNotice} className="w-full bg-[#FFD166] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                Post to Call Board
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {notices.map(n => (
              <div key={n.id} className={`bg-white border-4 border-[#2D2D2D] p-4 rounded-2xl flex justify-between items-start gap-4 ${n.priority === 'urgent' ? 'border-l-8 border-l-[#FF5F5F]' : ''}`}>
                <div className="flex-1">
                  <h4 className="font-black uppercase text-sm leading-tight">{n.title}</h4>
                  <p className="text-[10px] font-bold opacity-60 line-clamp-1 mt-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#06D6A0] block">{n.author}</span>
                    {/* 🔥 NEW: Acknowledgment Counter */}
                    {n.priority === 'urgent' && (
                      <span className="text-[8px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-md">
                        👀 {n.acknowledgedBy?.length || 0} Read
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => deleteNotice(n.id)} className="bg-red-50 text-red-500 border-2 border-[#2D2D2D] p-2 rounded-lg hover:bg-[#FF5F5F] hover:text-white transition-colors shrink-0">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🗄️ THE FILING CABINET */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="h-8 w-2 bg-[#06D6A0] rounded-full" />
             <h3 className="font-black text-2xl uppercase tracking-tighter">Script Vault</h3>
          </div>

          <div className="bg-white border-4 border-[#2D2D2D] p-6 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D]">
            <div className="space-y-4">
              <input placeholder="Document Name" value={vaultForm.title} onChange={e => setVaultForm({...vaultForm, title: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
              <input placeholder="Drive Link" type="url" value={vaultForm.link} onChange={e => setVaultForm({...vaultForm, link: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-bold rounded-xl" />
              <select value={vaultForm.type} onChange={e => setVaultForm({...vaultForm, type: e.target.value})} className="w-full border-2 border-[#2D2D2D] p-4 font-black uppercase text-sm rounded-xl cursor-pointer">
                <option value="script">📝 Script</option>
                <option value="audio">🎵 Audio</option>
                <option value="document">📁 Document</option>
              </select>
              <button onClick={addToVault} className="w-full bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                Upload to Vault
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-10">
            {vault.map(v => (
              <div key={v.id} className="bg-white border-4 border-[#2D2D2D] p-3 rounded-2xl flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-gray-100 border-2 border-[#2D2D2D] rounded-lg flex items-center justify-center shrink-0 text-xs">
                    {v.type === 'script' ? '📝' : v.type === 'audio' ? '🎵' : '📁'}
                  </div>
                  <div className="truncate pr-2">
                    <h4 className="font-black uppercase text-xs truncate">{v.title}</h4>
                    <a href={v.link} target="_blank" rel="noreferrer" className="text-[8px] font-black uppercase tracking-widest text-blue-500 hover:underline">Link ⤾</a>
                  </div>
                </div>
                <button onClick={() => deleteFromVault(v.id)} className="bg-red-50 text-red-500 border-2 border-[#2D2D2D] p-2 rounded-lg hover:bg-[#FF5F5F] hover:text-white transition-colors shrink-0">
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
