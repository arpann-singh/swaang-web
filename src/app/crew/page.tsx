"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion, addDoc, setDoc } from "firebase/firestore";
// 🔥 NEW: Import our token generator
import { getDeviceToken } from "@/lib/firebase";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

export default function CrewPage() {
  // 🧠 Core State
  const [notices, setNotices] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  const [crewSettings, setCrewSettings] = useState({ passcode: "SWAANG26", callDate: "", callTime: "", callLocation: "", callWho: "" });
  const [loading, setLoading] = useState(true);

  // 🔥 NEW: Permission Tracking State
  const [permissionStatus, setPermissionStatus] = useState<string>("granted");

  // 🔒 Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [error, setError] = useState(false);

  // 🏃 Absence Ping State
  const [pingForm, setPingForm] = useState({ name: "", type: "Late", message: "" });
  const [pingStatus, setPingStatus] = useState("idle"); 

  useEffect(() => {
    // Check if they already logged in recently
    if (localStorage.getItem("swaang_crew_auth") === "true") {
      setIsAuthenticated(true);
    }

    // 🔥 NEW: Check Notification Permission on Load
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    // Fetch Private Call Board
    const noticeSub = onSnapshot(query(collection(db, "callboard"), orderBy("createdAt", "desc")), (snap) => {
      setNotices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Vault
    const vaultSub = onSnapshot(query(collection(db, "vault"), orderBy("createdAt", "desc")), (snap) => {
      setVault(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Settings (Passcode & Call Sheet)
    const settingsSub = onSnapshot(doc(db, "settings", "crew"), (docSnap) => {
      if (docSnap.exists()) {
        setCrewSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
      setLoading(false);
    });

    return () => { noticeSub(); vaultSub(); settingsSub(); };
  }, []);

  // 🔒 Handle Passcode Submission
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.toUpperCase() === crewSettings.passcode.toUpperCase()) {
      setIsAuthenticated(true);
      localStorage.setItem("swaang_crew_auth", "true");
      setError(false);
    } else {
      setError(true);
      setPasscodeInput("");
    }
  };

  // ✅ Handle Acknowledgment
  const acknowledgeNotice = async (noticeId: string, currentAcks: string[]) => {
    const name = window.prompt("Enter your name to acknowledge this notice:");
    if (!name) return;
    
    if (currentAcks?.map(a => a.toLowerCase()).includes(name.toLowerCase())) {
      return alert("You have already acknowledged this notice.");
    }

    try {
      await updateDoc(doc(db, "callboard", noticeId), {
        acknowledgedBy: arrayUnion(name)
      });
    } catch (err) { alert("Failed to acknowledge. Check connection."); }
  };

  // 🔥 UPDATED: Absence Ping sends data AND a push notification to Admins
  const sendPing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPingStatus("sending");
    try {
      // 1. Save record to Inbox
      await addDoc(collection(db, "messages"), {
        name: pingForm.name,
        email: "crew@internal.swaang",
        phone: "",
        subject: `🚨 CREW PING: ${pingForm.type}`,
        message: pingForm.message || "No additional details provided.",
        status: "unread",
        createdAt: Date.now()
      });

      // 2. 🔥 TRIGGER ADMIN PING (ONLY you and Harsh get this)
      await fetch("/api/notify-crew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: "ABSENCE ALERT", 
          message: `${pingForm.name} is ${pingForm.type}. MSG: ${pingForm.message}`,
          recipientType: "admin" // 🔥 This targets only Admin-roled tokens
        })
      });

      setPingStatus("sent");
      setPingForm({ name: "", type: "Late", message: "" });
      setTimeout(() => setPingStatus("idle"), 3000);
    } catch (err) {
      alert("Failed to send ping.");
      setPingStatus("idle");
    }
  };

  // 🔥 UPDATED: Automatic Enable Logic
  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission); // Update UI state instantly
      
      if (permission === 'denied') {
        alert("🚨 Notifications are currently BLOCKED in your browser! Please click the padlock icon in your address bar, change Notifications to 'Allow', and refresh.");
        return; 
      }

      const token = await getDeviceToken();
      if (token) {
        await setDoc(doc(db, "fcm_tokens", token), { token, createdAt: Date.now() });
        alert("Push Notifications Enabled! You will now receive alerts on this device. 🔔");
      } else {
        alert("Failed to get token. If you are on iPhone, you must 'Add to Home Screen' first.");
      }
    } catch (err) {
      console.error(err);
      alert("Notification setup failed.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#2D2D2D] text-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest italic">Unlocking Backstage...</div>;

  // 🛑 THE LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#2D2D2D] flex items-center justify-center p-6 text-center">
        <motion.form 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          onSubmit={handleUnlock} 
          className="bg-[#FFF9F0] border-4 border-[#FFD166] p-12 rounded-[3rem] shadow-[20px_20px_0px_#FFD166] max-w-md w-full"
        >
          <div className="w-16 h-16 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔒</div>
          <h1 className="font-cinzel text-3xl font-black text-[#2D2D2D] mb-2 uppercase tracking-tighter">Stage Door</h1>
          <p className="font-bold text-[#2D2D2D]/60 text-xs uppercase tracking-widest mb-8">Enter Cast Passcode</p>
          
          <input 
            type="password" 
            value={passcodeInput} 
            onChange={e => setPasscodeInput(e.target.value)} 
            placeholder="••••••••"
            className={`w-full border-4 p-4 text-center text-2xl tracking-[0.5em] font-black rounded-xl outline-none transition-colors mb-4 ${error ? 'border-[#FF5F5F] text-[#FF5F5F]' : 'border-[#2D2D2D] text-[#2D2D2D]'}`}
          />
          {error && <p className="text-[#FF5F5F] font-black text-xs uppercase tracking-widest mb-4 animate-bounce">Incorrect Passcode</p>}
          
          <button type="submit" className="w-full bg-[#FFD166] text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
            Unlock
          </button>
        </motion.form>
      </main>
    );
  }

  // 🎭 THE UNLOCKED CREW HUB
  return (
    <PageTransition>
      <main className="min-h-screen bg-[#2D2D2D] pt-32 pb-20 px-6 text-[#FFF9F0]">
        <div className="max-w-7xl mx-auto">

          {/* 🔥 NEW: AUTOMATIC NOTIFICATION PROMPT BANNER */}
          <AnimatePresence>
            {permissionStatus === "default" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="mb-10 overflow-hidden"
              >
                <div className="bg-[#FF5F5F] border-4 border-[#FFF9F0] p-6 md:p-8 rounded-[2.5rem] shadow-[8px_8px_0px_#FFF9F0] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#FFF9F0] text-[#FF5F5F] rounded-full flex items-center justify-center text-3xl shadow-[4px_4px_0px_#2D2D2D] shrink-0">🔔</div>
                    <div>
                      <h4 className="font-black uppercase text-xl md:text-2xl leading-none mb-1">Don't Miss the Call!</h4>
                      <p className="font-black uppercase tracking-widest text-[9px] md:text-[10px] opacity-90">Enable push alerts to get instant notifications for urgent notices.</p>
                    </div>
                  </div>
                  <button 
                    onClick={enableNotifications} 
                    className="w-full md:w-auto bg-[#2D2D2D] text-white px-8 py-4 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_#FFF9F0] hover:translate-y-1 hover:shadow-none transition-all shrink-0"
                  >
                    Enable Alerts Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-8 border-[#FFF9F0]/10 pb-8 gap-6">
            <div>
              <div className="inline-block bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#FFF9F0] px-4 py-1 rounded-full mb-4 shadow-[4px_4px_0px_#FFF9F0]">
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Access Granted</span>
              </div>
              <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#FFD166]">
                Backstage <span className="text-[#FFF9F0]">Hub</span>
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => { localStorage.removeItem("swaang_crew_auth"); setIsAuthenticated(false); }} className="px-6 py-3 border-4 border-[#FFF9F0]/20 rounded-xl font-black uppercase text-[10px] hover:bg-[#FFF9F0] hover:text-[#2D2D2D] transition-colors">
                Lock Screen
              </button>
            </div>
          </div>

          {/* 📅 THE DAILY CALL SHEET */}
          {(crewSettings.callDate || crewSettings.callTime) && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#FFD166] text-[#2D2D2D] border-4 border-[#FFF9F0] rounded-[2rem] p-6 md:p-8 mb-12 shadow-[8px_8px_0px_#FFF9F0] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px] opacity-40 -z-0" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-black uppercase text-[10px] tracking-[0.3em] opacity-60 mb-1">Daily Call Sheet</h2>
                  <p className="font-cinzel text-3xl md:text-5xl font-black tracking-tighter leading-none">{crewSettings.callDate || "TBD"}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Call Time</p>
                    <p className="font-black text-xl md:text-2xl uppercase tracking-tighter">{crewSettings.callTime || "TBD"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Location</p>
                    <p className="font-black text-xl md:text-2xl uppercase tracking-tighter">{crewSettings.callLocation || "TBD"}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Who's Called</p>
                    <p className="font-black text-xl md:text-2xl uppercase tracking-tighter">{crewSettings.callWho || "Everyone"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* 📢 THE CALL BOARD */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-3 bg-[#06D6A0] rounded-full" />
                <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">The Call Board</h2>
              </div>

              {notices.length === 0 ? (
                <div className="border-4 border-dashed border-[#FFF9F0]/20 p-12 text-center rounded-[2rem]">
                  <p className="font-black uppercase tracking-widest text-[#FFF9F0]/40">No active notices.</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                    key={notice.id} 
                    className={`bg-[#FFF9F0] text-[#2D2D2D] border-4 border-[#2D2D2D] rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0px_${notice.priority === 'urgent' ? '#FF5F5F' : '#06D6A0'}]`}
                  >
                    <div className="flex justify-between items-start mb-4 border-b-4 border-[#2D2D2D]/10 pb-4 gap-4">
                      <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight">{notice.title}</h3>
                      {notice.priority === 'urgent' && (
                        <span className="bg-[#FF5F5F] text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-widest shrink-0 animate-pulse">Urgent</span>
                      )}
                    </div>
                    <p className="font-medium text-sm md:text-base leading-relaxed mb-6 whitespace-pre-wrap">{notice.message}</p>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t-2 border-dashed border-[#2D2D2D]/20 pt-4">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>Posted by: {notice.author || "Directorate"}</span>
                        <span className="mx-2">•</span>
                        <span>{notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : "Just now"}</span>
                      </div>
                      
                      {notice.priority === 'urgent' && (
                        <button 
                          onClick={() => acknowledgeNotice(notice.id, notice.acknowledgedBy)}
                          className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] tracking-widest hover:bg-[#FF5F5F] transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none w-full sm:w-auto"
                        >
                          Acknowledge 
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* 🗄️ THE VAULT & PING */}
            <div className="lg:col-span-5 space-y-8">
              
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-3 bg-[#FF5F5F] rounded-full" />
                <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">The Vault</h2>
              </div>

              <div className="bg-[#FFF9F0] border-4 border-[#2D2D2D] rounded-[2rem] p-6 shadow-[8px_8px_0px_#06D6A0]">
                {vault.length === 0 ? (
                  <p className="font-black uppercase tracking-widest text-[#2D2D2D]/40 text-center py-8 text-sm">Vault is empty.</p>
                ) : (
                  <div className="space-y-4">
                    {vault.map((item) => (
                      <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="group flex items-center justify-between bg-white border-4 border-[#2D2D2D] p-4 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2D2D2D] transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className={`w-10 h-10 rounded-lg border-2 border-[#2D2D2D] flex items-center justify-center shrink-0 ${item.type === 'script' ? 'bg-[#FFD166]' : item.type === 'audio' ? 'bg-[#06D6A0]' : 'bg-gray-200'}`}>
                            {item.type === 'script' ? '📝' : item.type === 'audio' ? '🎵' : '📁'}
                          </div>
                          <div className="truncate pr-4">
                            <h4 className="font-black text-[#2D2D2D] uppercase text-sm truncate">{item.title}</h4>
                            <p className="font-bold text-[9px] text-[#2D2D2D]/50 uppercase tracking-widest mt-0.5">{item.type}</p>
                          </div>
                        </div>
                        <div className="bg-[#2D2D2D] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 group-hover:bg-[#FF5F5F] transition-colors">
                          <span className="text-xs">⤾</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 🏃 THE ABSENCE PING */}
              <div className="bg-[#FF5F5F] border-4 border-[#FFF9F0] rounded-[2rem] p-6 shadow-[8px_8px_0px_#FFF9F0] text-[#FFF9F0]">
                <h3 className="font-black uppercase text-xl mb-1 tracking-tighter">Absence Ping</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">Alert the Stage Manager Instantly</p>
                
                {pingStatus === "sent" ? (
                  <div className="bg-[#FFF9F0] text-[#2D2D2D] p-6 rounded-xl text-center font-black uppercase text-sm">
                    ✅ Ping Sent to Inbox.
                  </div>
                ) : (
                  <form onSubmit={sendPing} className="space-y-3">
                    <input required type="text" placeholder="Your Name" value={pingForm.name} onChange={e => setPingForm({...pingForm, name: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-[#2D2D2D] p-3 rounded-xl text-[#2D2D2D] font-bold outline-none" />
                    <select value={pingForm.type} onChange={e => setPingForm({...pingForm, type: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-[#2D2D2D] p-3 rounded-xl text-[#2D2D2D] font-black uppercase text-xs outline-none cursor-pointer">
                      <option value="Late">Running Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Emergency">Emergency Issue</option>
                    </select>
                    <textarea placeholder="Reason / ETA (Optional)" value={pingForm.message} onChange={e => setPingForm({...pingForm, message: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-[#2D2D2D] p-3 rounded-xl text-[#2D2D2D] font-bold outline-none h-16 resize-none" />
                    <button disabled={pingStatus === "sending"} type="submit" className="w-full bg-[#2D2D2D] text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-colors disabled:opacity-50">
                      {pingStatus === "sending" ? "Pinging..." : "Send Ping"}
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}