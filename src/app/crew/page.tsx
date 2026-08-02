"use client";
import { useState, useEffect } from "react";
import { db, auth, googleProvider } from "@/lib/firebase"; 
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  arrayUnion, 
  addDoc, 
  setDoc,
  where,
  getDocs
} from "firebase/firestore";
import { 
  onAuthStateChanged, 
  signOut,
  signInWithPopup 
} from "firebase/auth";
import { getDeviceToken } from "@/lib/firebase";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import AvailabilityGrid from "@/components/crew/AvailabilityGrid";

export default function CrewPage() {
  // 🧠 Core State
  const [notices, setNotices] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  const [crewSettings, setCrewSettings] = useState({ 
    callDate: "", 
    callTime: "", 
    callLocation: "", 
    callWho: "" 
  });
  const [rehearsalReports, setRehearsalReports] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [liveCue, setLiveCue] = useState<any>({ state: 'IDLE' });
  const [loading, setLoading] = useState(true);

  // Profile State
  const [memberData, setMemberData] = useState<any>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Permission Tracking State
  const [permissionStatus, setPermissionStatus] = useState<string>("granted");

  // 🔒 Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // 🏃 Absence Ping State
  const [pingForm, setPingForm] = useState({ name: "", type: "Late", message: "" });
  const [pingStatus, setPingStatus] = useState("idle"); 

  // 🚀 MEDIA STAGING & IMAGE UPLOAD
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const IMGBB_API_KEY = "098e6a70fbe6f7594e40f4641a1998b0";

  // 🔥 1. SINGLE ACTION PRIORITY LOGIC
  // Logic to determine if a Call Sheet is the current absolute priority
  const getLayoutPriority = () => {
    if (!crewSettings.callDate) return "DEFAULT";
    
    const today = new Date().toLocaleDateString('en-GB'); // Matches DD/MM/YYYY
    const isToday = crewSettings.callDate.includes(today) || notices.some(n => n.priority === 'urgent');
    
    return isToday ? "HIGH_ALERT" : "DEFAULT";
  };

  const priorityMode = getLayoutPriority();

  // 🔥 2. SMART LOCKER SORTING
  // Filters vault items based on the logged-in user's role
  const filteredVault = vault.filter((item) => {
    // If no tags are set or tagged 'all', show to everyone
    if (!item.tags || item.tags.length === 0 || item.tags.includes("all")) return true;
    
    const userRole = memberData?.role?.toLowerCase() || "";
    
    // Check if the user's role matches any of the tags
    return item.tags.some((tag: string) => userRole.includes(tag.toLowerCase()));
  });

  useEffect(() => {
    // 🔥 UPDATED: Strict Auth State Listener with Authorization Check
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Verify if this Google Email exists in our registered 'team' collection
        const q = query(collection(db, "team"), where("email", "==", user.email));
        const snap = await getDocs(q);

        if (!snap.empty) {
          // ✅ AUTHORIZED: User exists in Swaang Directory
          const mData = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setMemberData(mData);
          setIsAuthenticated(true);
          
          // Set identifiers for AvailabilityGrid
          localStorage.setItem("swaang_crew_id", snap.docs[0].id);
          localStorage.setItem("swaang_crew_name", (mData as any).name);
        } else {
          // ❌ UNAUTHORIZED: Email not found in Directory
          await signOut(auth); // Boot them out immediately
          setIsAuthenticated(false);
          setMemberData(null);
          alert("Access Denied: Your email is not registered in the Swaang Personnel Directory. Contact the Directorate.");
        }
      } else {
        setIsAuthenticated(false);
        setMemberData(null);
      }
      setLoading(false);
    });

    // Check Notification Permission on Load
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

    // Fetch Settings (Call Sheet)
    const settingsSub = onSnapshot(doc(db, "settings", "crew"), (docSnap) => {
      if (docSnap.exists()) {
        setCrewSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    // Fetch Rehearsal Reports
    const reportSub = onSnapshot(query(collection(db, "rehearsal_reports"), orderBy("createdAt", "desc")), (snap) => {
      setRehearsalReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Active Team
    const teamSub = onSnapshot(query(collection(db, "team"), where("isActive", "==", true)), (snap) => {
      setTeamMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Live Cue
    const liveCueSub = onSnapshot(doc(db, "settings", "live_cue"), (docSnap) => {
      if (docSnap.exists()) {
        setLiveCue(docSnap.data());
      }
    });

    return () => { unsubAuth(); noticeSub(); vaultSub(); settingsSub(); reportSub(); teamSub(); liveCueSub(); };
  }, []);

  // 🔒 Handle Google Login
  const handleGoogleLogin = async () => {
    setError(false);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("swaang_crew_id");
    localStorage.removeItem("swaang_crew_name");
  };

  // 🔥 NEW: HANDLE PROFILE PHOTO UPLOAD
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setMemberData((prev: any) => ({ ...prev, image: json.data.url }));
      }
    } catch (err) { alert("Upload error."); } finally { setUploading(false); }
  };

  // ✅ Handle Acknowledgment
  const acknowledgeNotice = async (noticeId: string, currentAcks: string[]) => {
    const name = memberData?.name || window.prompt("Enter your name to acknowledge:");
    if (!name) return;
    
    if (currentAcks?.map(a => a.toLowerCase()).includes(name.toLowerCase())) {
      return alert("You have already acknowledged this notice.");
    }

    try {
      await updateDoc(doc(db, "callboard", noticeId), {
        acknowledgedBy: arrayUnion(name)
      });
    } catch (err) { alert("Failed to acknowledge."); }
  };

  // 🔥 PROFILE UPDATE LOGIC (EXPANDED TO ALL FIELDS)
  const syncProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberData?.id) return;
    setIsUpdatingProfile(true);
    try {
      await updateDoc(doc(db, "team", memberData.id), {
        name: memberData.name || "",
        phone: memberData.phone || "",
        image: memberData.image || "",
        description: memberData.description || "",
        instagram: memberData.instagram || "",
        linkedin: memberData.linkedin || "" ,
        github: memberData.github || ""
      });
      alert("Locker Details Synced! Changes are now live on the Ensemble. 🎭");
    } catch (err) { alert("Failed to update profile."); }
    finally { setIsUpdatingProfile(false); }
  };

  // 🏃 Absence Ping Logic
  const sendPing = async (e: React.FormEvent) => {
    e.preventDefault();
    setPingStatus("sending");
    try {
      await addDoc(collection(db, "messages"), {
        name: pingForm.name || memberData?.name,
        email: auth.currentUser?.email,
        phone: "",
        subject: `🚨 CREW PING: ${pingForm.type}`,
        message: pingForm.message || "No additional details provided.",
        status: "unread",
        createdAt: Date.now()
      });

      await fetch("/api/notify-crew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: "ABSENCE ALERT", 
          message: `${pingForm.name || memberData?.name} is ${pingForm.type}. MSG: ${pingForm.message}`,
          recipientType: "admin" 
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

  // 🎞️ MEDIA STAGING LOGIC
  const handleBulkUpload = async (e: any) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsBulkUploading(true);
    for (const file of files as File[]) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (data.success) {
          await addDoc(collection(db, "gallery"), {
            url: data.data.url,
            title: `Crew Upload - ${new Date().toLocaleDateString()}`,
            description: `Staged by ${memberData?.name || 'Crew'}.`,
            showOnHome: false,
            status: "Pending Curation",
            createdAt: Date.now()
          });
        }
      } catch (error) { console.error(error); }
    }
    setIsBulkUploading(false);
    alert("Media Staged! 🎞️");
  };

  const enableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission); 
      if (permission === 'denied') {
        alert("🚨 Notifications are BLOCKED!");
        return; 
      }
      const token = await getDeviceToken();
      if (token) {
        await setDoc(doc(db, "fcm_tokens", token), { 
          token, 
          email: auth.currentUser?.email,
          createdAt: Date.now(),
          platform: window.innerWidth < 768 ? "mobile" : "desktop"
        });
        alert("Push Notifications Enabled! 🔔");
      }
    } catch (err) { alert("Setup failed."); }
  };

  if (loading) return <div className="min-h-screen bg-[#2D2D2D] text-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest italic text-center">Unlocking Backstage...</div>;

  // 🛑 THE GOOGLE LOGIN SCREEN (STRICT GATEKEEPER)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#2D2D2D] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[repeating-linear-gradient(45deg,#FFD166,#FFD166_20px,#2D2D2D_20px,#2D2D2D_40px)] p-4 max-w-lg w-full shadow-[20px_20px_0px_#FF5F5F] border-8 border-black"
        >
          <div className="bg-[var(--bg-primary)] border-8 border-black p-12 relative overflow-hidden">
            {/* Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-20" />
            
            <div className="relative z-20">
              <div className="w-16 h-16 bg-[#FF5F5F] border-4 border-black text-white flex items-center justify-center mx-auto mb-6 text-3xl shadow-[4px_4px_0px_black]">🔒</div>
              <h1 className="font-cinzel text-4xl font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter">Restricted Area</h1>
              <p className="font-mono font-bold text-[#FF5F5F] text-[10px] uppercase tracking-[0.3em] mb-12">
                // SYS.AUTH.REQUIRED //
              </p>
              
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-4 bg-[#FFD166] text-black border-4 border-black py-4 font-black uppercase shadow-[6px_6px_0px_black] hover:translate-y-1 hover:shadow-[2px_2px_0px_black] active:translate-y-2 active:shadow-none transition-all mb-4"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white p-1 rounded-full border-2 border-black" />
                Initiate Login Sequence
              </button>
              
              {error && <p className="bg-black text-[#FF5F5F] p-2 font-mono text-xs uppercase tracking-widest mt-4 border-2 border-[#FF5F5F]">AUTH_ERR: Access Denied.</p>}
              
              <p className="text-[9px] font-mono font-bold text-[var(--text-primary)]/40 uppercase tracking-[0.2em] mt-8 leading-relaxed">
                Clearance granted only to official <br/> Swaang Personnel emails.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    );
  }

  // 🎭 THE UNLOCKED CREW HUB (CONTROL BOARD)
  return (
    <PageTransition>
      <main className="min-h-screen bg-[#2D2D2D] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pt-32 pb-20 px-6 text-[#FFF9F0] overflow-x-hidden">
        
        {/* 🔥 LIVE CUE BANNER */}
        <AnimatePresence>
          {liveCue?.state && liveCue.state !== 'IDLE' && (
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }} className={`fixed top-0 left-0 w-full z-[100] border-b-8 border-black p-4 shadow-[12px_12px_0px_black] text-black uppercase font-black text-center text-2xl md:text-5xl ${liveCue.state === 'STANDBY' ? 'bg-[#FFD166] animate-pulse' : 'bg-[#06D6A0]'}`}>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl">{liveCue.state === 'STANDBY' ? '⚠️' : '🟢'}</span>
                <span>{liveCue.message || liveCue.state}</span>
                <span className="text-4xl">{liveCue.state === 'STANDBY' ? '⚠️' : '🟢'}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto">

          {/* 🔔 NOTIFICATION PROMPT (HAZARD STYLE) */}
          <AnimatePresence>
            {permissionStatus === "default" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-10 overflow-hidden">
                <div className="bg-[#FF5F5F] border-8 border-black p-6 shadow-[12px_12px_0px_#FFD166] flex flex-col md:flex-row items-center justify-between gap-6 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] pointer-events-none" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 bg-black text-[#FF5F5F] border-4 border-[#FFF9F0] flex items-center justify-center text-3xl">⚠️</div>
                    <div>
                      <h4 className="font-black uppercase text-2xl leading-none mb-1 text-black">Action Required</h4>
                      <p className="font-mono font-black uppercase tracking-widest text-[10px] text-black">Enable notifications for urgent stage directives.</p>
                    </div>
                  </div>
                  <button onClick={enableNotifications} className="bg-black text-[#FF5F5F] px-8 py-4 border-4 border-black font-black uppercase text-xs shadow-[6px_6px_0px_black] hover:bg-[#FFF9F0] hover:text-black transition-colors relative z-10">
                    ENABLE NOTIFICATIONS
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-8 border-black pb-8 gap-6 text-left">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="inline-block bg-[#06D6A0] text-black border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
                  <span className="font-mono font-black uppercase tracking-wider text-sm">USER: {memberData?.name || "Member"}</span>
                </div>
                <div className="inline-block bg-[#FFD166] text-black border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
                  <span className="font-mono font-black uppercase tracking-wider text-sm">ROLE: {memberData?.role || "CREW"}</span>
                </div>
              </div>
              <h1 className="font-cinzel text-5xl md:text-8xl font-black uppercase tracking-tighter text-[#FFF9F0] leading-none" style={{ WebkitTextStroke: '2px black' }}>
                Control <span className="text-[#FF5F5F]">Board</span>
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={handleLogout} className="px-6 py-3 border-4 border-black bg-[#2D2D2D] font-black uppercase text-[10px] hover:bg-[#FF5F5F] hover:shadow-[4px_4px_0px_black] transition-all">
                TERMINATE SESSION
              </button>
            </div>
          </div>

          {/* 📅 CALL SHEET - NEON LEDGER */}
          {(crewSettings.callDate || crewSettings.callTime) && (
            <motion.div 
              layout 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`bg-[#FFD166] text-black border-8 border-black mb-12 shadow-[16px_16px_0px_black] text-left overflow-hidden relative ${priorityMode === 'HIGH_ALERT' ? 'animate-[pulse_3s_infinite]' : ''}`}
            >
              {priorityMode === 'HIGH_ALERT' && (
                <div className="absolute top-0 right-0 bg-[#FF5F5F] text-white border-b-4 border-l-4 border-black px-6 py-2 font-black uppercase text-[10px] tracking-widest z-20">
                  CRITICAL: REPORT TO STAGE
                </div>
              )}
              {/* Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30" />
              
              <div className="p-8 relative z-20">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
                  <div className="bg-black text-[#FFD166] p-6 border-4 border-black shadow-[8px_8px_0px_#FF5F5F]">
                    <h2 className="font-mono uppercase text-[10px] tracking-[0.3em] opacity-80 mb-2">{'>'} SYS.DATE</h2>
                    <p className="font-black text-4xl md:text-5xl uppercase tracking-tighter leading-none">{crewSettings.callDate || "TBD"}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto font-mono">
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{'>'} TIME</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{crewSettings.callTime || "TBD"}</p>
                    </div>
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{'>'} LOC</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{crewSettings.callLocation || "TBD"}</p>
                    </div>
                    <div className="border-l-4 border-black pl-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{'>'} TARGET</p>
                      <p className="font-black text-2xl uppercase tracking-tighter bg-black text-[#FFD166] inline-block px-2">{crewSettings.callWho || "ALL"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 text-left">
            <div className="xl:col-span-7 space-y-12">
              
              {/* PROFILE EDITOR (TERMINAL STYLE) */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-[#FF5F5F] border-4 border-black flex items-center justify-center font-black text-black">1</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">Agent Config</h2>
                </div>
                
                <div className="bg-[#FFF9F0] text-black border-8 border-black p-8 shadow-[12px_12px_0px_black] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,#06D6A0,#06D6A0_10px,#000_10px,#000_20px)] border-b-4 border-black" />
                  
                  <form onSubmit={syncProfile} className="space-y-6 mt-4 relative z-10">
                     <div className="flex flex-col md:flex-row gap-8 items-center md:items-start font-mono">
                        <div className="space-y-3 text-center shrink-0">
                          <div className="w-40 h-40 border-4 border-black bg-[#2D2D2D] flex items-center justify-center shadow-[6px_6px_0px_black]">
                            {memberData?.image ? <img src={memberData.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" /> : <div className="text-[#FFF9F0]/30 text-xs uppercase font-black">NO_IMG</div>}
                          </div>
                          <label className="block bg-[#06D6A0] text-black border-2 border-black px-3 py-2 font-black uppercase text-[10px] cursor-pointer hover:bg-black hover:text-[#06D6A0] transition-colors">
                            {uploading ? "UPLOADING..." : "[ CHANGE_IMG ]"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
                          </label>
                        </div>

                        <div className="flex-1 w-full space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                             <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase opacity-60">ID.NAME</label>
                               <input type="text" value={memberData?.name || ""} onChange={e => setMemberData({...memberData, name: e.target.value})} className="w-full bg-white border-4 border-black p-3 font-bold text-sm outline-none focus:bg-[#FFD166] transition-colors shadow-[4px_4px_0px_black]" />
                             </div>
                             <div className="space-y-1">
                               <label className="text-[10px] font-black uppercase opacity-60">COMMS.PHONE</label>
                               <input type="text" value={memberData?.phone || ""} onChange={e => setMemberData({...memberData, phone: e.target.value})} className="w-full bg-white border-4 border-black p-3 font-bold text-sm outline-none focus:bg-[#FFD166] transition-colors shadow-[4px_4px_0px_black]" />
                             </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase opacity-60">SYS.BIO</label>
                            <textarea value={memberData?.description || ""} onChange={e => setMemberData({...memberData, description: e.target.value})} className="w-full bg-white border-4 border-black p-3 font-bold h-24 resize-none text-sm outline-none focus:bg-[#FFD166] transition-colors shadow-[4px_4px_0px_black]" />
                          </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t-4 border-black pt-6 font-mono">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-60">NET.INSTA</label>
                          <input type="text" value={memberData?.instagram || ""} onChange={e => setMemberData({...memberData, instagram: e.target.value})} className="w-full bg-white border-2 border-black p-2 font-bold text-[10px] shadow-[2px_2px_0px_black] outline-none focus:bg-[#06D6A0]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-60">NET.LINKEDIN</label>
                          <input type="text" value={memberData?.linkedin || ""} onChange={e => setMemberData({...memberData, linkedin: e.target.value})} className="w-full bg-white border-2 border-black p-2 font-bold text-[10px] shadow-[2px_2px_0px_black] outline-none focus:bg-[#06D6A0]" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-60">NET.GITHUB</label>
                          <input type="text" value={memberData?.github || ""} onChange={e => setMemberData({...memberData, github: e.target.value})} className="w-full bg-white border-2 border-black p-2 font-bold text-[10px] shadow-[2px_2px_0px_black] outline-none focus:bg-[#06D6A0]" />
                        </div>
                     </div>

                     <button disabled={isUpdatingProfile} type="submit" className="w-full bg-black text-[#FFD166] border-4 border-black py-4 mt-4 font-black uppercase text-xs tracking-widest hover:bg-[#FF5F5F] hover:text-black transition-colors shadow-[6px_6px_0px_#2D2D2D]">
                        {isUpdatingProfile ? "EXECUTING..." : "COMMIT CHANGES"}
                     </button>
                  </form>
                </div>
              </div>

              {/* THE CALL BOARD */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-[#06D6A0] border-4 border-black flex items-center justify-center font-black text-black">2</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">The Call Board</h2>
                </div>
                <div className="space-y-6">
                  {notices.length === 0 ? (
                    <div className="border-4 border-dashed border-[#FFF9F0]/20 p-12 text-center bg-[#2D2D2D]">
                      <p className="font-mono font-black uppercase text-[#FFF9F0]/40 text-xs">NO_ACTIVE_NOTICES</p>
                    </div>
                  ) : (
                    notices.map((notice) => (
                      <motion.div key={notice.id} className={`bg-[#FFF9F0] text-black border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_${notice.priority === 'urgent' ? '#FF5F5F' : '#06D6A0'}]`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-4 border-black pb-4 gap-4">
                          <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight">{notice.title}</h3>
                          {notice.priority === 'urgent' && <span className="bg-[#FF5F5F] text-white border-2 border-black px-4 py-1 font-black uppercase text-[10px] shadow-[4px_4px_0px_black] animate-pulse">URGENT</span>}
                        </div>
                        <p className="font-bold text-sm mb-8 whitespace-pre-wrap leading-relaxed">{notice.message}</p>
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t-4 border-black pt-4 font-mono">
                          <div className="text-[10px] font-black uppercase opacity-60">
                            SRC: {notice.author || "SYS"} // {new Date(notice.createdAt).toLocaleDateString()}
                          </div>
                          {notice.priority === 'urgent' && (
                            <button onClick={() => acknowledgeNotice(notice.id, notice.acknowledgedBy)} className="bg-black text-[#06D6A0] border-2 border-black px-6 py-2 font-black uppercase text-[10px] hover:bg-[#FF5F5F] hover:text-black transition-colors">ACKNOWLEDGE</button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* THE ENSEMBLE DIRECTORY */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-[#FF5F5F] border-4 border-black flex items-center justify-center font-black text-black">5</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">Ensemble Directory</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="bg-[#FFF9F0] border-4 border-black p-4 text-black shadow-[6px_6px_0px_black] flex items-center gap-4 hover:-translate-y-1 transition-transform">
                      <div className="w-16 h-16 bg-[#2D2D2D] border-2 border-black flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <span className="text-[10px] text-white/50 font-black">NO_IMG</span>}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-black uppercase truncate text-lg leading-tight">{member.name}</h4>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#FF5F5F] truncate mb-1">{member.role}</p>
                        {member.phone && <p className="text-[10px] font-mono font-bold tracking-widest bg-[#FFD166] inline-block px-1 border border-black mb-1">{member.phone}</p>}
                        <div className="flex gap-2 mt-1">
                          {member.phone && <a href={`tel:${member.phone}`} className="bg-black text-[#06D6A0] px-2 py-1 text-[8px] font-black uppercase hover:bg-[#06D6A0] hover:text-black transition-colors">📞 CALL</a>}
                          {member.email && <a href={`mailto:${member.email}`} className="bg-black text-[#FFD166] px-2 py-1 text-[8px] font-black uppercase hover:bg-[#FFD166] hover:text-black transition-colors">✉️ MAIL</a>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="xl:col-span-5 space-y-12">
              
              {/* MY SCHEDULE */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-[#FFD166] border-4 border-black flex items-center justify-center font-black text-black">3</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">My Schedule</h2>
                </div>
                {/* Wrap grid in a sharp container to enforce brutalism over the child component if needed */}
                <div className="bg-[#FFF9F0] text-black border-8 border-black p-2 shadow-[12px_12px_0px_black]">
                  <AvailabilityGrid userId={memberData?.id || "guest"} userName={memberData?.name || "Crew"} />
                </div>
              </div>

              {/* THE VAULT */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-black border-4 border-white text-white flex items-center justify-center font-black">4</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">The Vault</h2>
                </div>
                
                <div className="bg-[#2D2D2D] border-4 border-[#FFF9F0] p-6 shadow-[12px_12px_0px_#FFF9F0]">
                  <div className="flex justify-between items-center mb-6 border-b-2 border-dashed border-[#FFF9F0]/20 pb-4">
                    <h3 className="font-mono font-black uppercase text-xs text-[#FFF9F0] opacity-50">SECURE_STORAGE</h3>
                    <span className="text-[9px] font-black uppercase px-3 py-1 bg-[#06D6A0] text-black border-2 border-black tracking-widest">{memberData?.role || "CREW"} CLEARANCE</span>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredVault.length === 0 ? (
                      <p className="text-[10px] font-mono font-black uppercase opacity-40 py-6 text-center border-2 border-dashed border-[#FFF9F0]/20">DIR_EMPTY</p>
                    ) : (
                      filteredVault.map((item) => (
                        <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-[#FFF9F0] text-black border-4 border-black p-4 hover:bg-[#FFD166] hover:translate-x-2 transition-transform shadow-[4px_4px_0px_black]">
                          <div className="flex items-center gap-4 truncate">
                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-black ${item.type === 'script' ? 'bg-[#FFD166]' : 'bg-[#FF5F5F]'}`}>
                              {item.type === 'script' ? '📝' : '🎵'}
                            </div>
                            <div>
                              <h4 className="font-black uppercase text-sm truncate">{item.title}</h4>
                              <div className="flex gap-1 mt-1 font-mono">
                                {item.tags?.map((t: string) => (
                                  <span key={t} className="text-[8px] font-bold uppercase opacity-60">#{t}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="bg-black text-[#06D6A0] w-8 h-8 border-2 border-black flex items-center justify-center shrink-0">⤾</div>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* REHEARSAL REPORTS */}
              <div>
                <div className="flex items-center gap-4 mb-6 border-b-4 border-[#FFF9F0]/20 pb-2">
                  <div className="h-8 w-8 bg-black border-4 border-[#06D6A0] text-[#06D6A0] flex items-center justify-center font-black">6</div>
                  <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">Rehearsal Reports</h2>
                </div>

                <div className="space-y-4">
                  {rehearsalReports.length === 0 ? (
                     <div className="border-4 border-dashed border-[#FFF9F0]/20 p-12 text-center bg-[#2D2D2D]">
                      <p className="font-mono font-black uppercase text-[#FFF9F0]/40 text-xs">NO_REPORTS_LOGGED</p>
                    </div>
                  ) : (
                    rehearsalReports.map(report => (
                      <div key={report.id} className="bg-[#2D2D2D] border-4 border-[#06D6A0] p-6 shadow-[8px_8px_0px_#06D6A0]">
                        <div className="flex justify-between items-start mb-4 border-b-2 border-dashed border-[#06D6A0]/30 pb-4">
                          <div>
                            <h3 className="font-black text-xl uppercase tracking-tighter text-white">{report.title}</h3>
                            <p className="text-[10px] font-mono text-[#06D6A0] mt-1">LOGGED BY: {report.author} • {new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="font-mono text-sm whitespace-pre-wrap leading-relaxed opacity-80 mb-4">{report.notes}</p>
                        {report.nextCall && (
                          <div className="bg-black border-l-4 border-[#FFD166] p-3 text-[#FFD166] font-mono text-xs font-black uppercase">
                            NEXT CALL: {report.nextCall}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MEDIA STAGING & ABSENCE PING (SPLIT OR STACKED) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-8">
                
                {/* Media Staging */}
                <div className="bg-[#06D6A0] border-8 border-black p-8 shadow-[12px_12px_0px_black] text-black font-mono">
                  <h3 className="font-black uppercase text-2xl mb-1 tracking-tighter">Media Staging</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-8 border-b-4 border-black pb-4">UPLOAD_TO_ARCHIVES</p>
                  <label className={`block text-center cursor-pointer bg-white border-4 border-black py-4 font-black uppercase text-xs transition-all shadow-[6px_6px_0px_black] ${isBulkUploading ? "bg-black text-white" : "hover:bg-black hover:text-white"}`}>
                    {isBulkUploading ? "UPLOADING..." : "[ SELECT_FILES ]"}
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
                  </label>
                </div>
                
                {/* Absence Ping */}
                <div className="bg-[#FF5F5F] border-8 border-black p-8 shadow-[12px_12px_0px_black] text-black font-mono">
                  <h3 className="font-black uppercase text-2xl mb-1 tracking-tighter">Absence Ping</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6 border-b-4 border-black pb-4">SYS_ALERT_SM</p>
                  
                  {pingStatus === "sent" ? (
                    <div className="bg-black text-[#06D6A0] border-4 border-black p-6 text-center font-black uppercase text-xs">✅ PACKET_DELIVERED.</div>
                  ) : (
                    <form onSubmit={sendPing} className="space-y-4">
                      <input required type="text" placeholder="ID.NAME" value={pingForm.name || memberData?.name || ""} onChange={e => setPingForm({...pingForm, name: e.target.value})} className="w-full bg-white border-4 border-black p-3 text-black font-bold outline-none focus:bg-black focus:text-white transition-colors text-sm" />
                      <select value={pingForm.type} onChange={e => setPingForm({...pingForm, type: e.target.value})} className="w-full bg-white border-4 border-black p-3 text-black font-black uppercase text-xs outline-none cursor-pointer focus:bg-black focus:text-white transition-colors">
                        <option value="Late">STATUS: LATE</option>
                        <option value="Absent">STATUS: ABSENT</option>
                        <option value="Emergency">STATUS: EMERGENCY</option>
                      </select>
                      <textarea placeholder="REASON_CODE" value={pingForm.message} onChange={e => setPingForm({...pingForm, message: e.target.value})} className="w-full bg-white border-4 border-black p-3 text-black font-bold outline-none h-24 resize-none focus:bg-black focus:text-white transition-colors text-sm" />
                      <button disabled={pingStatus === "sending"} type="submit" className="w-full bg-black text-[#FFD166] border-4 border-black py-4 font-black uppercase text-xs hover:bg-white hover:text-black transition-colors shadow-[6px_6px_0px_black]">
                        {pingStatus === "sending" ? "TRANSMITTING..." : "EXECUTE_PING"}
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}