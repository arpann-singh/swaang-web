"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react"; // 🔥 Ensure Search icon is imported

// --- EXISTING COMPONENTS ---
import BrandingEditor from "@/components/admin/BrandingEditor";
import InboxManager from "@/components/admin/InboxManager";
import AuditionsManager from "@/components/admin/AuditionsManager";
import EventsManager from "@/components/admin/EventsManager";
import TeamManager from "@/components/admin/TeamManager";
import GalleryManager from "@/components/admin/GalleryManager";
import AOTMManager from "@/components/admin/AOTMManager";
import TimelineManager from "@/components/admin/TimelineManager";
import CreditsEditor from "@/components/admin/CreditsEditor";
import NoticesManager from "@/components/admin/NoticesManager";
import BackstageManager from "@/components/admin/BackstageManager";

// --- NEW PRODUCTIVITY COMPONENTS ---
import LetterGenerator from "@/components/admin/LetterGenerator"; 
import ConflictMapper from "@/components/admin/ConflictMapper";
import ProductionCalendar from "@/components/admin/ProductionCalendar";
import CommandCenter from "@/components/admin/CommandCenter"; 
import CommandPalette from "@/components/admin/CommandPalette"; 

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [auditions, setAuditions] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => { 
      if (!u) {
        router.push("/admin"); 
      } else {
        setAuthLoading(false);
      }
    });

    const unsubConfig = onSnapshot(doc(db, "settings", "site_config"), (d) => {
      setSiteConfig(d.data() || {});
    });

    const unsubInbox = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (s) => 
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const unsubAuditions = onSnapshot(query(collection(db, "auditions"), orderBy("submittedAt", "desc")), (s) => {
      setAuditions(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubTeam = onSnapshot(collection(db, "team"), (s) => {
      setTeam(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubSched = onSnapshot(query(collection(db, "production_schedule"), orderBy("date", "asc")), (s) => {
      setSchedule(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubConfig();
      unsubInbox();
      unsubAuditions();
      unsubTeam();
      unsubSched();
    };
  }, [router]);

  const handleJump = (tabId: string, queryText?: string) => {
    setActiveTab(tabId);
    setSearchQuery(queryText || "");
  };

  const aggregatedStats = {
    crewCount: team.filter(m => m.category === "active" || m.category === "president").length,
    unreadCount: messages.length,
    activeShow: siteConfig.currentProduction || "No Active Show",
    nextCall: schedule.length > 0 ? `${schedule[0].title} (${schedule[0].date})` : "No Calls Scheduled"
  };

  const tabs = [
    { id: "dashboard", label: "Command Center", color: "bg-[#06D6A0]" },
    { id: "branding", label: "Branding", color: "bg-[#FF5F5F]" },
    { id: "spotlight", label: "Spotlight", color: "bg-[#FFD166]" },
    { id: "timeline", label: "Timeline", color: "bg-[#06D6A0]" },
    { id: "inbox", label: "Inbox", color: "bg-[#FF5F5F]" },
    { id: "auditions", label: "Auditions", color: "bg-[#FFD166]" },
    { id: "events", label: "Events", color: "bg-[#06D6A0]" },
    { id: "team", label: "Team", color: "bg-[#FF5F5F]" },
    { id: "gallery", label: "Gallery", color: "bg-[#FFD166]" },
    { id: "letters", label: "Letters", color: "bg-[#FF5F5F]" },
    { id: "conflicts", label: "Conflicts", color: "bg-[#06D6A0]" },
    { id: "schedule", label: "Schedule", color: "bg-[#FF5F5F]" },
    { id: "notices", label: "Public", color: "bg-[#FFD166]" },
    { id: "backstage", label: "Backstage", color: "bg-[#06D6A0]" },
    { id: "credits", label: "Credits", color: "bg-[#FF5F5F]" },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">
        <div className="w-12 h-12 border-8 border-black border-t-[#06D6A0] rounded-full animate-spin mb-4" />
        Verifying Session...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">
        <div className="w-12 h-12 border-8 border-black border-t-[#FF5F5F] rounded-full animate-spin mb-4" />
        Syncing Dashboard...
      </div>
    );
  }

  return (
    /* 🔥 CHANGE: flex-col for mobile, flex-row for desktop */
    <div className="flex flex-col xl:flex-row h-screen w-full bg-[#FFF9F0] overflow-hidden font-sans text-[#2D2D2D]">
      
      <CommandPalette 
        onJump={handleJump} 
        tabs={tabs || []} 
        team={team || []} 
        events={schedule || []} 
        auditions={auditions || []}
      />

      {/* 📱💻 FIXED SIDEBAR / HEADER */}
      {/* 🔥 CHANGE: h-auto on mobile, h-full on desktop */}
      <aside className="w-full xl:w-72 bg-white border-b-4 xl:border-b-0 xl:border-r-4 border-[#2D2D2D] flex flex-col shrink-0 h-auto xl:h-full relative z-50 shadow-[4px_0px_0px_rgba(0,0,0,0.05)] text-left">
        
        <div className="p-4 xl:p-8 pb-3 xl:pb-0 flex justify-between items-center xl:items-start xl:flex-col">
          <div className="flex flex-col text-left">
            <h2 className="font-cinzel text-2xl xl:text-4xl font-black tracking-tighter uppercase leading-none">SWAANG</h2>
            <p className="text-[8px] font-black uppercase tracking-[0.5em] text-[#FF5F5F] mt-1">Admin Control</p>
          </div>

          {/* 🔥 Mobile Controls: Added Terminal Trigger Icon */}
          <div className="flex items-center gap-3 xl:hidden">
            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'k'}))}
              className="p-3 border-4 border-[#2D2D2D] rounded-xl bg-[#FFD166] shadow-[2px_2px_0px_#2D2D2D] active:translate-y-0.5 active:shadow-none transition-all"
              aria-label="Open Terminal"
            >
              <Search size={18} strokeWidth={3} />
            </button>
            <button onClick={() => signOut(auth)} className="px-4 py-2.5 border-4 border-[#2D2D2D] rounded-xl font-black uppercase text-[10px] bg-red-100 text-red-600 shadow-[2px_2px_0px_#2D2D2D] active:translate-y-0.5 active:shadow-none transition-all">
              Sign Out
            </button>
          </div>
        </div>

        <nav className="flex flex-row xl:flex-col gap-2 xl:gap-3 px-4 xl:px-8 pb-4 xl:pb-6 mt-6 xl:mt-10 overflow-x-auto xl:overflow-y-auto no-scrollbar items-center xl:items-stretch whitespace-nowrap w-full flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleJump(tab.id)}
              className={`shrink-0 px-4 py-2.5 xl:p-4 rounded-xl xl:rounded-2xl border-2 xl:border-4 border-[#2D2D2D] font-black uppercase text-[10px] xl:text-[11px] transition-all duration-200 ${
                activeTab === tab.id 
                ? `${tab.color} text-white shadow-[3px_3px_0px_#2D2D2D] xl:shadow-[6px_6px_0px_#2D2D2D] -translate-y-0.5 xl:-translate-y-1` 
                : "bg-white shadow-[2px_2px_0px_#2D2D2D] xl:shadow-[4px_4px_0px_#2D2D2D] hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.id === "inbox" && messages.length > 0 && ` (${messages.length})`}
              {tab.id === "auditions" && auditions.length > 0 && ` (${auditions.length})`}
            </button>
          ))}
        </nav>
        
        <div className="p-8 mt-auto hidden xl:block border-t-4 border-[#2D2D2D]/5">
            <button onClick={() => signOut(auth)} className="w-full p-4 border-4 border-[#2D2D2D] rounded-xl font-black uppercase text-[9px] bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all shadow-[4px_4px_0px_#2D2D2D] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            Secure Sign Out
            </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT AREA */}
      {/* 🔥 CHANGE: Added bg-[#FFF9F0] and ensured vertical height behaves correctly */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 xl:p-12 custom-scrollbar bg-[#FFF9F0]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full"
          >
            {activeTab === "dashboard" && <CommandCenter stats={aggregatedStats} />}
            {activeTab === "branding" && <BrandingEditor />}
            {activeTab === "spotlight" && <AOTMManager />}
            {activeTab === "timeline" && <TimelineManager />}
            {activeTab === "inbox" && <InboxManager messages={messages} />}
            {activeTab === "auditions" && <AuditionsManager auditions={auditions} />} 
            {activeTab === "events" && <EventsManager />}
            {activeTab === "team" && <TeamManager initialSearch={searchQuery} />}
            {activeTab === "gallery" && <GalleryManager />}
            {activeTab === "schedule" && <ProductionCalendar />}
            {activeTab === "letters" && <LetterGenerator />} 
            {activeTab === "conflicts" && <ConflictMapper />}
            {activeTab === "notices" && <NoticesManager />}
            {activeTab === "backstage" && <BackstageManager />}
            {activeTab === "credits" && <CreditsEditor />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}