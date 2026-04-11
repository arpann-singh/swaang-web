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

    return () => { unsubAuth(); noticeSub(); vaultSub(); settingsSub(); };
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
      <main className="min-h-screen bg-[#2D2D2D] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-[#FFF9F0] border-4 border-[#FFD166] p-12 rounded-[3rem] shadow-[20px_20px_0px_#FFD166] max-w-md w-full"
        >
          <div className="w-16 h-16 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔑</div>
          <h1 className="font-cinzel text-3xl font-black text-[#2D2D2D] mb-2 uppercase tracking-tighter">Stage Door</h1>
          <p className="font-bold text-[#2D2D2D]/60 text-[10px] uppercase tracking-widest mb-12">Crew Identity Required</p>
          
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-4 bg-white text-[#2D2D2D] border-4 border-[#2D2D2D] py-4 rounded-xl font-black uppercase shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all mb-4"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Continue with Google
          </button>
          
          {error && <p className="text-[#FF5F5F] font-black text-xs uppercase tracking-widest mt-4">Login failed. Try again.</p>}
          
          <p className="text-[9px] font-bold text-[#2D2D2D]/40 uppercase tracking-[0.2em] mt-8 leading-relaxed">
            Ensure you use your official email <br/> registered in the Swaang Personnel Desk.
          </p>
        </motion.div>
      </main>
    );
  }

  // 🎭 THE UNLOCKED CREW HUB
  return (
    <PageTransition>
      <main className="min-h-screen bg-[#2D2D2D] pt-32 pb-20 px-6 text-[#FFF9F0]">
        <div className="max-w-7xl mx-auto">

          {/* 🔔 NOTIFICATION PROMPT */}
          <AnimatePresence>
            {permissionStatus === "default" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-10 overflow-hidden">
                <div className="bg-[#FF5F5F] border-4 border-[#FFF9F0] p-6 rounded-[2.5rem] shadow-[8px_8px_0px_#FFF9F0] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#FFF9F0] text-[#FF5F5F] rounded-full flex items-center justify-center text-3xl">🔔</div>
                    <div>
                      <h4 className="font-black uppercase text-xl leading-none mb-1">Don't Miss the Call!</h4>
                      <p className="font-black uppercase tracking-widest text-[10px] opacity-90">Enable push alerts for urgent stage notices.</p>
                    </div>
                  </div>
                  <button onClick={enableNotifications} className="bg-[#2D2D2D] text-white px-8 py-4 rounded-xl font-black uppercase text-xs shadow-[4px_4px_0px_#FFF9F0] hover:translate-y-1 transition-all">Enable Alerts</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b-8 border-[#FFF9F0]/10 pb-8 gap-6 text-left">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-block bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#FFF9F0] px-4 py-1 rounded-full shadow-[4px_4px_0px_#FFF9F0]">
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Locker: {memberData?.name || "Member"}</span>
                </div>
              </div>
              <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#FFD166]">
                Backstage <span className="text-[#FFF9F0]">Hub</span>
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={handleLogout} className="px-6 py-3 border-4 border-[#FFF9F0]/20 rounded-xl font-black uppercase text-[10px] hover:bg-[#FF5F5F] hover:text-white transition-colors">
                Sign Out
              </button>
            </div>
          </div>

          {/* 📅 CALL SHEET - PRIORITY 1: TODAY'S FOCUS */}
          {(crewSettings.callDate || crewSettings.callTime) && (
            <motion.div 
              layout 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className={`bg-[#FFD166] text-[#2D2D2D] border-4 border-[#FFF9F0] rounded-[2rem] mb-12 shadow-[12px_12px_0px_#FFF9F0] text-left overflow-hidden relative ${priorityMode === 'HIGH_ALERT' ? 'ring-8 ring-[#FF5F5F] ring-offset-4 ring-offset-[#2D2D2D]' : ''}`}
            >
              {priorityMode === 'HIGH_ALERT' && (
                <div className="absolute top-0 right-0 bg-[#FF5F5F] text-white px-6 py-2 font-black uppercase text-[10px] tracking-widest rounded-bl-3xl">
                  Live: Report to Stage
                </div>
              )}
              <div className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h2 className="font-black uppercase text-[10px] tracking-[0.3em] opacity-60 mb-1">Daily Call Sheet</h2>
                    <p className="font-cinzel text-3xl md:text-6xl font-black tracking-tighter leading-none">{crewSettings.callDate || "TBD"}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 w-full md:w-auto">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Call Time</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{crewSettings.callTime || "TBD"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Location</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{crewSettings.callLocation || "TBD"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Who's Called</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{crewSettings.callWho || "Everyone"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            <div className="lg:col-span-7 space-y-8">
              
              {/* PROFILE EDITOR */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-3 bg-[#FF5F5F] rounded-full" />
                <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">My Ensemble Profile</h2>
              </div>
              <div className="bg-[#FFF9F0] text-[#2D2D2D] border-4 border-[#2D2D2D] rounded-[2rem] p-8 shadow-[8px_8px_0px_#FFD166]">
                <form onSubmit={syncProfile} className="space-y-6">
                   <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                      <div className="space-y-3 text-center">
                        <div className="w-32 h-32 rounded-3xl border-4 border-black overflow-hidden bg-gray-200">
                          {memberData?.image ? <img src={memberData.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center italic opacity-30 text-xs">No Photo</div>}
                        </div>
                        <label className="block bg-black text-white px-3 py-2 rounded-lg font-black uppercase text-[8px] cursor-pointer hover:bg-[#FF5F5F] transition-all">
                          {uploading ? "..." : "Change Image"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoUpload} />
                        </label>
                      </div>

                      <div className="flex-1 w-full space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Display Name</label>
                             <input type="text" value={memberData?.name || ""} onChange={e => setMemberData({...memberData, name: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold text-sm" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[9px] font-black uppercase opacity-40 ml-2">Mobile Number</label>
                             <input type="text" placeholder="e.g. 9876543210" value={memberData?.phone || ""} onChange={e => setMemberData({...memberData, phone: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold text-sm" />
                           </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase opacity-40 ml-2">Stage Bio (Publicly Visible)</label>
                          <textarea value={memberData?.description || ""} onChange={e => setMemberData({...memberData, description: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold h-24 resize-none text-sm" placeholder="Tell your story..." />
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-black/10 pt-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-2">Instagram</label>
                        <input type="text" placeholder="@username" value={memberData?.instagram || ""} onChange={e => setMemberData({...memberData, instagram: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold text-[10px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-2">LinkedIn</label>
                        <input type="text" placeholder="Profile URL" value={memberData?.linkedin || ""} onChange={e => setMemberData({...memberData, linkedin: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold text-[10px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase opacity-40 ml-2">GitHub</label>
                        <input type="text" placeholder="Username" value={memberData?.github || ""} onChange={e => setMemberData({...memberData, github: e.target.value})} className="w-full border-2 border-black p-3 rounded-xl font-bold text-[10px]" />
                      </div>
                   </div>

                   <button disabled={isUpdatingProfile} type="submit" className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#FF5F5F] transition-all shadow-[4px_4px_0px_#FFD166]">
                      {isUpdatingProfile ? "Syncing..." : "Update Ensemble Locker"}
                   </button>
                </form>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-3 bg-[#06D6A0] rounded-full" />
                <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">The Call Board</h2>
              </div>
              <div className="space-y-6">
                {notices.length === 0 ? (
                  <div className="border-4 border-dashed border-[#FFF9F0]/20 p-12 text-center rounded-[2rem]">
                    <p className="font-black uppercase text-[#FFF9F0]/40">No active notices.</p>
                  </div>
                ) : (
                  notices.map((notice) => (
                    <motion.div key={notice.id} className={`bg-[#FFF9F0] text-[#2D2D2D] border-4 border-[#2D2D2D] rounded-[2rem] p-8 shadow-[8px_8px_0px_${notice.priority === 'urgent' ? '#FF5F5F' : '#06D6A0'}]`}>
                      <div className="flex justify-between items-start mb-4 border-b-4 border-[#2D2D2D]/10 pb-4">
                        <h3 className="font-black text-2xl uppercase tracking-tighter leading-tight">{notice.title}</h3>
                        {notice.priority === 'urgent' && <span className="bg-[#FF5F5F] text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] animate-pulse">Urgent</span>}
                      </div>
                      <p className="font-medium text-sm mb-6 whitespace-pre-wrap">{notice.message}</p>
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t-2 border-dashed border-[#2D2D2D]/20 pt-4">
                        <div className="text-[10px] font-black uppercase opacity-60">
                          <span>{notice.author || "Directorate"}</span> • <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        </div>
                        {notice.priority === 'urgent' && (
                          <button onClick={() => acknowledgeNotice(notice.id, notice.acknowledgedBy)} className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] hover:bg-[#FF5F5F] transition-all">Acknowledge</button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-3 bg-[#FFD166] rounded-full" />
                <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter">My Schedule</h2>
              </div>
              <AvailabilityGrid userId={memberData?.id || "guest"} userName={memberData?.name || "Crew"} />

              {/* --- THE VAULT: PRIORITY 2 SMART LOCKER SORTING --- */}
              <div className="bg-[#FFF9F0] border-4 border-[#2D2D2D] rounded-[2rem] p-6 shadow-[8px_8px_0px_#06D6A0]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black uppercase text-xl text-black">The Vault</h3>
                  <span className="text-[9px] font-black uppercase px-2 py-1 bg-black text-white rounded-md tracking-widest">{memberData?.role || "CREW"} STORAGE</span>
                </div>
                
                <div className="space-y-4">
                  {filteredVault.length === 0 ? (
                    <p className="text-[10px] font-black uppercase opacity-40 py-4 text-center border-2 border-dashed border-black/10 rounded-xl">No specific files for your role yet.</p>
                  ) : (
                    filteredVault.map((item) => (
                      <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-white border-4 border-[#2D2D2D] p-4 rounded-xl hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 truncate">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border-2 border-black ${item.type === 'script' ? 'bg-[#FFD166]' : 'bg-[#06D6A0]'}`}>
                            {item.type === 'script' ? '📝' : '🎵'}
                          </div>
                          <div>
                            <h4 className="font-black text-[#2D2D2D] uppercase text-sm truncate">{item.title}</h4>
                            <div className="flex gap-1 mt-1">
                              {item.tags?.map((t: string) => (
                                <span key={t} className="text-[7px] font-black uppercase opacity-40">#{t}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#2D2D2D] text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">⤾</div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[#06D6A0] border-4 border-[#FFF9F0] rounded-[2rem] p-6 shadow-[8px_8px_0px_#FFF9F0] text-[#2D2D2D]">
                <h3 className="font-black uppercase text-xl mb-1 tracking-tighter">Media Staging</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6">Upload Photos to Archives</p>
                <label className={`block text-center cursor-pointer bg-[#2D2D2D] text-white py-4 rounded-xl font-black uppercase text-xs transition-all ${isBulkUploading ? "opacity-50" : "hover:translate-y-1"}`}>
                  {isBulkUploading ? "Staging Assets..." : "Select Multi-Photos"}
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handleBulkUpload} />
                </label>
              </div>
              
              <div className="bg-[#FF5F5F] border-4 border-[#FFF9F0] rounded-[2rem] p-6 shadow-[8px_8px_0px_#FFF9F0] text-[#FFF9F0]">
                <h3 className="font-black uppercase text-xl mb-1 tracking-tighter">Absence Ping</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-6">Alert the Stage Manager</p>
                {pingStatus === "sent" ? (
                  <div className="bg-[#FFF9F0] text-[#2D2D2D] p-6 rounded-xl text-center font-black uppercase text-sm">✅ Ping Sent.</div>
                ) : (
                  <form onSubmit={sendPing} className="space-y-3">
                    <input required type="text" placeholder="Your Name" value={pingForm.name || memberData?.name || ""} onChange={e => setPingForm({...pingForm, name: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-black p-3 rounded-xl text-black font-bold outline-none" />
                    <select value={pingForm.type} onChange={e => setPingForm({...pingForm, type: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-black p-3 rounded-xl text-black font-black uppercase text-xs outline-none cursor-pointer">
                      <option value="Late">Running Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                    <textarea placeholder="Reason / ETA" value={pingForm.message} onChange={e => setPingForm({...pingForm, message: e.target.value})} className="w-full bg-[#FFF9F0] border-2 border-black p-3 rounded-xl text-black font-bold outline-none h-16 resize-none" />
                    <button disabled={pingStatus === "sending"} type="submit" className="w-full bg-[#2D2D2D] text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-black transition-all">
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