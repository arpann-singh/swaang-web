"use client";
import { useState, useEffect } from "react";
import { verifyAdminAccess } from "@/lib/authConfig";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  LogOut, 
  Terminal, 
  Compass, 
  UserCheck, 
  Clock, 
  Mail, 
  LayoutGrid, 
  Sparkles,
  ArrowRight
} from "lucide-react";

// --- EXISTING COMPONENTS ---
import BrandingEditor from "@/components/admin/BrandingEditor";
import InboxManager from "@/components/admin/InboxManager";
import AuditionsManager from "@/components/admin/AuditionsManager";
import EventsManager from "@/components/admin/EventsManager";
import TeamManager from "@/components/admin/TeamManager";
import GalleryManager from "@/components/admin/GalleryManager";
import RsvpsManager from "@/components/admin/RsvpsManager";
import AOTMManager from "@/components/admin/AOTMManager";
import TimelineManager from "@/components/admin/TimelineManager";
import CreditsEditor from "@/components/admin/CreditsEditor";
import NoticesManager from "@/components/admin/NoticesManager";
import BackstageManager from "@/components/admin/BackstageManager";

// --- PRODUCTIVITY & ARCHIVE COMPONENTS ---
import LetterGenerator from "@/components/admin/LetterGenerator"; 
import ConflictMapper from "@/components/admin/ConflictMapper";
import ProductionCalendar from "@/components/admin/ProductionCalendar";
import CommandCenter from "@/components/admin/CommandCenter"; 
import CommandPalette from "@/components/admin/CommandPalette"; 
import AlumniManager from "@/components/admin/AlumniManager";
import BlogManager from "@/components/admin/BlogManager";
import ArchiveManager from "@/components/admin/ArchiveManager";
import ResourcesManager from "@/components/admin/ResourcesManager";
import BudgetManager from "@/components/admin/BudgetManager";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [sidebarFilter, setSidebarFilter] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [siteConfig, setSiteConfig] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [auditions, setAuditions] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true); 
  const router = useRouter();

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const unsubAuth = onAuthStateChanged(auth, async (u) => { 
      if (!u) {
        router.push("/admin"); 
      } else {
        const hasAccess = await verifyAdminAccess(u);
        if (!hasAccess) {
          await signOut(auth);
          alert(`ACCESS DENIED: Your account (${u.email || "no email"}) does not possess Administrative Clearance.`);
          router.push("/admin");
          return;
        }
        setCurrentUser(u);
        setAuthLoading(false);

        // ✅ Initialize Real-Time Data Listeners only AFTER Admin Clearance is Verified
        const unsubConfig = onSnapshot(doc(db, "settings", "site_config"), (d) => {
          setSiteConfig(d.data() || {});
        }, (err) => console.warn("Site config listener warning:", err));

        const unsubInbox = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (s) => 
          setMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))),
          (err) => console.warn("Inbox listener warning:", err)
        );

        const unsubAuditions = onSnapshot(query(collection(db, "auditions"), orderBy("submittedAt", "desc")), (s) => {
          setAuditions(s.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => console.warn("Auditions listener warning:", err));

        const unsubTeam = onSnapshot(collection(db, "team"), (s) => {
          setTeam(s.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => console.warn("Team listener warning:", err));

        const unsubSched = onSnapshot(query(collection(db, "production_schedule"), orderBy("date", "asc")), (s) => {
          setSchedule(s.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }, (err) => {
          console.warn("Schedule listener warning:", err);
          setLoading(false);
        });

        unsubs = [unsubConfig, unsubInbox, unsubAuditions, unsubTeam, unsubSched];
      }
    });

    return () => {
      unsubAuth();
      unsubs.forEach(unsub => unsub());
    };
  }, [router]);

  const handleJump = (tabId: string, queryText?: string) => {
    setActiveTab(tabId);
    setSearchQuery(queryText || "");
    setMobileMenuOpen(false);
  };

  const aggregatedStats = {
    crewCount: team.filter(m => m.category === "active" || m.category === "president").length,
    unreadCount: messages.length,
    activeShow: siteConfig.currentProduction || "No Active Show",
    nextCall: schedule.length > 0 ? `${schedule[0].title} (${schedule[0].date})` : "No Calls Scheduled"
  };

  const pendingAuditionsCount = auditions.filter(a => !a.status || a.status === "pending").length;

  // 🗂️ CATEGORIZED TAB ARCHITECTURE
  const tabCategories = [
    {
      title: "EXECUTIVE HUB",
      tabs: [
        { id: "dashboard", label: "Master Hub", color: "bg-[#06D6A0]" },
        { id: "analytics", label: "Analytics", color: "bg-[#FFD166]" },
      ]
    },
    {
      title: "EDITORIAL & MEDIA",
      tabs: [
        { id: "branding", label: "Branding", color: "bg-[#FF5F5F]" },
        { id: "spotlight", label: "Spotlight", color: "bg-[#FFD166]" },
        { id: "timeline", label: "Timeline", color: "bg-[#06D6A0]" },
        { id: "archive", label: "Archive", color: "bg-[#FF5F5F]" },
        { id: "blog", label: "Blog", color: "bg-[#FF5F5F]" },
        { id: "gallery", label: "Gallery", color: "bg-[#FFD166]" },
      ]
    },
    {
      title: "CASTING & PEOPLE",
      tabs: [
        { id: "auditions", label: "Casting Desk", color: "bg-[#FFD166]", badge: pendingAuditionsCount },
        { id: "resources", label: "Audition Prep", color: "bg-[#06D6A0]" },
        { id: "team", label: "Crew Roster", color: "bg-[#FFD166]" },
        { id: "alumni", label: "Alumni", color: "bg-[#06D6A0]" },
      ]
    },
    {
      title: "STAGE & BACKSTAGE",
      tabs: [
        { id: "events", label: "Events", color: "bg-[#06D6A0]" },
        { id: "rsvps", label: "Guest List", color: "bg-[#FF5F5F]" },
        { id: "schedule", label: "Call Times", color: "bg-[#FF5F5F]" },
        { id: "conflicts", label: "Conflicts", color: "bg-[#06D6A0]" },
        { id: "backstage", label: "Backstage", color: "bg-[#06D6A0]" },
        { id: "credits", label: "Credits", color: "bg-[#FF5F5F]" },
      ]
    },
    {
      title: "FINANCE & COMMS",
      tabs: [
        { id: "budget", label: "Finances", color: "bg-[#06D6A0]" },
        { id: "inbox", label: "Inbox", color: "bg-[#FF5F5F]", badge: messages.length },
        { id: "notices", label: "Public", color: "bg-[#FFD166]" },
        { id: "letters", label: "Letters", color: "bg-[#FF5F5F]" },
      ]
    }
  ];

  // Flat list for CommandPalette compatibility
  const flatTabs = tabCategories.flatMap(c => c.tabs);
  const currentTabObj = flatTabs.find(t => t.id === activeTab);

  // Filtered categories based on search input
  const filteredCategories = tabCategories.map(cat => ({
    ...cat,
    tabs: cat.tabs.filter(t => 
      t.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
      t.id.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
      cat.title.toLowerCase().includes(sidebarFilter.toLowerCase())
    )
  })).filter(cat => cat.tabs.length > 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center font-mono font-black uppercase tracking-widest text-[#FFF9F0]">
        <div className="text-[#FF5F5F] text-4xl mb-4 animate-pulse">🔒</div>
        // SYS.AUTH.VERIFYING... //
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D2D2D] flex flex-col items-center justify-center font-mono font-black uppercase tracking-widest text-[#FFF9F0]">
        <div className="w-12 h-12 border-8 border-black border-t-[#06D6A0] animate-spin mb-4 shadow-[4px_4px_0px_black]" />
        // SYS.SYNCING.DASHBOARD... //
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row h-screen w-full bg-[#2D2D2D] overflow-hidden font-sans text-white">
      
      <CommandPalette 
        onJump={handleJump} 
        tabs={flatTabs || []} 
        team={team || []} 
        events={schedule || []} 
        auditions={auditions || []}
      />

      {/* 📱 MINIMAL MOBILE TOP BAR */}
      <header className="xl:hidden w-full bg-[#FFD166] border-b-4 border-black px-4 py-2.5 flex justify-between items-center z-30 shadow-[0px_4px_0px_black] shrink-0 text-black">
        <div className="flex items-center gap-2.5">
          <h2 className="font-cinzel text-xl font-black uppercase tracking-tight leading-none">SWAANG</h2>
          <span className={`px-2 py-0.5 font-mono text-[9px] font-black uppercase border border-black ${currentTabObj?.color || "bg-white"} shadow-[1px_1px_0px_black]`}>
            {currentTabObj?.label || "SYS"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-[8px] font-bold uppercase text-black/70 bg-white/70 px-1.5 py-0.5 border border-black">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" />
            LIVE
          </span>
          <button 
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'k'}))}
            className="p-1.5 border-2 border-black bg-white shadow-[2px_2px_0px_black] active:translate-y-0.5"
            title="Open command palette (Ctrl+K)"
          >
            <Terminal size={14} strokeWidth={3} />
          </button>
          <button 
            onClick={() => signOut(auth)} 
            className="p-1.5 border-2 border-black bg-[#FF5F5F] text-white shadow-[2px_2px_0px_black] active:translate-y-0.5"
            title="Log Out"
          >
            <LogOut size={14} strokeWidth={3} />
          </button>
        </div>
      </header>

      {/* 📱 FIXED BOTTOM COMMAND DOCK (THE THUMB ZONE) */}
      <nav 
        aria-label="Mobile Navigation Dock"
        className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#FFD166] border-t-4 border-black z-40 flex items-stretch justify-around shadow-[0px_-4px_0px_black] pb-safe"
      >
        {/* 1. Master Hub */}
        <button 
          onClick={() => handleJump("dashboard")} 
          className={`flex-1 flex flex-col items-center justify-center border-r-2 border-black font-mono transition-all ${
            activeTab === "dashboard" ? "bg-black text-[#06D6A0]" : "text-black hover:bg-yellow-300"
          }`}
        >
          <Compass size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase mt-0.5">Hub</span>
        </button>
        
        {/* 2. Auditions (Casting) */}
        <button 
          onClick={() => handleJump("auditions")} 
          className={`flex-1 flex flex-col items-center justify-center border-r-2 border-black font-mono relative transition-all ${
            activeTab === "auditions" ? "bg-black text-[#FFD166]" : "text-black hover:bg-yellow-300"
          }`}
        >
          <UserCheck size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase mt-0.5">Casting</span>
          {pendingAuditionsCount > 0 && (
            <span className="absolute top-1 right-2 bg-[#FF5F5F] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black animate-pulse">
              {pendingAuditionsCount}
            </span>
          )}
        </button>

        {/* 3. Schedule / Call Times */}
        <button 
          onClick={() => handleJump("schedule")} 
          className={`flex-1 flex flex-col items-center justify-center border-r-2 border-black font-mono transition-all ${
            activeTab === "schedule" ? "bg-black text-[#FF5F5F]" : "text-black hover:bg-yellow-300"
          }`}
        >
          <Clock size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase mt-0.5">Calls</span>
        </button>

        {/* 4. Inbox */}
        <button 
          onClick={() => handleJump("inbox")} 
          className={`flex-1 flex flex-col items-center justify-center border-r-2 border-black font-mono relative transition-all ${
            activeTab === "inbox" ? "bg-black text-[#06D6A0]" : "text-black hover:bg-yellow-300"
          }`}
        >
          <Mail size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase mt-0.5">Inbox</span>
          {messages.length > 0 && (
            <span className="absolute top-1 right-2 bg-[#FF5F5F] text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black">
              {messages.length}
            </span>
          )}
        </button>

        {/* 5. Modules Grid (Triggers Full Quick-Sheet) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className={`flex-1 flex flex-col items-center justify-center font-mono transition-all ${
            mobileMenuOpen ? "bg-[#FF5F5F] text-white" : "bg-[#06D6A0] text-black hover:bg-emerald-300"
          }`}
        >
          <LayoutGrid size={18} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase mt-0.5">22 Apps</span>
        </button>
      </nav>

      {/* 📱 MOBILE QUICK-SHEET MODAL (SLIDE-UP DRAWER) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#FFF9F0] border-t-8 border-x-4 border-black rounded-t-[2.5rem] z-50 p-6 overflow-y-auto custom-scrollbar shadow-[0px_-8px_0px_black] text-black flex flex-col justify-between"
            >
              <div>
                {/* Pull Handle & Header */}
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-16 h-1.5 bg-black/40 rounded-full mx-auto mb-4 cursor-pointer hover:bg-black"
                />

                <div className="flex justify-between items-center border-b-4 border-black pb-3 mb-4">
                  <div>
                    <h3 className="font-cinzel text-2xl font-black uppercase leading-none">
                      All Modules (22)
                    </h3>
                    <p className="font-mono text-[9px] font-bold uppercase text-black/60 mt-0.5">
                      Swaang Full Operations Suite
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 border-2 border-black bg-white"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>

                {/* Quick Search */}
                <div className="relative mb-6">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
                  <input
                    type="text"
                    placeholder="Search any tool or category..."
                    value={sidebarFilter}
                    onChange={(e) => setSidebarFilter(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border-2 border-black font-mono text-xs font-bold uppercase outline-none focus:border-black"
                  />
                </div>

                {/* Categorized Tools Grid */}
                <div className="space-y-6">
                  {filteredCategories.map((cat) => (
                    <div key={cat.title}>
                      <p className="font-mono text-[10px] font-black uppercase tracking-wider text-black/60 mb-2">
                        // {cat.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.tabs.map((tab) => {
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleJump(tab.id)}
                              className={`p-3 border-2 border-black font-mono font-black text-left text-xs uppercase flex items-center justify-between transition-all ${
                                isActive
                                  ? `${tab.color} text-black border-4 shadow-none translate-x-1`
                                  : "bg-white text-black shadow-[3px_3px_0px_black] hover:bg-gray-100"
                              }`}
                            >
                              <span className="truncate">{tab.label}</span>
                              {tab.badge && tab.badge > 0 ? (
                                <span className="bg-[#FF5F5F] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full ml-1 shrink-0">
                                  {tab.badge}
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Identity Footer */}
              <div className="pt-6 border-t-4 border-black mt-8">
                <div className="flex items-center justify-between mb-3 font-mono text-xs">
                  <span className="text-black/60 font-bold uppercase">ADMIN: {currentUser?.email}</span>
                  <span className="bg-[#06D6A0] text-black px-1.5 py-0.5 font-black text-[9px] border border-black">AUTH OK</span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="w-full py-3 border-4 border-black font-mono font-black uppercase text-xs bg-[#FF5F5F] text-white shadow-[4px_4px_0px_black]"
                >
                  SECURE SIGN OUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 💻 DESKTOP NEO-BRUTALIST SIDEBAR */}
      <aside className="hidden xl:flex w-72 bg-[#FFD166] border-r-8 border-black flex-col shrink-0 h-full relative z-40 text-black shadow-[16px_0px_0px_black] justify-between">
        
        {/* BRAND HEADER & LIVE STATUS */}
        <div className="p-6 pb-4 border-b-4 border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-cinzel text-4xl font-black tracking-tighter uppercase leading-none">
                SWAANG
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.2em] bg-black text-[#06D6A0] inline-block px-2 py-0.5 border border-black">
                  SYS.ADMIN
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-black/70">
                  <span className="w-2 h-2 rounded-full bg-[#06D6A0] border border-black animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'k'}))}
              className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all"
              title="Open Omnibar (Ctrl+K)"
            >
              <Terminal size={14} strokeWidth={3} />
            </button>
          </div>

          {/* SIDEBAR INSTANT FILTER */}
          <div className="relative mt-4">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black/50" />
            <input
              type="text"
              placeholder="Filter tabs..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-white border-2 border-black font-mono text-[11px] font-bold uppercase placeholder:normal-case outline-none focus:border-black"
            />
          </div>
        </div>

        {/* 📜 SCROLLABLE CATEGORIZED NAVIGATION */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-6">
          {filteredCategories.map((cat) => (
            <div key={cat.title} className="space-y-2">
              <p className="font-mono text-[9px] font-black uppercase tracking-wider text-black/60 px-1">
                // {cat.title}
              </p>
              <div className="space-y-1.5">
                {cat.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleJump(tab.id)}
                      className={`w-full text-left px-3 py-2 border-2 border-black font-mono font-black text-xs uppercase flex items-center justify-between transition-all duration-150 ${
                        isActive 
                          ? `${tab.color} text-black shadow-none translate-x-1 border-4` 
                          : "bg-white text-black shadow-[3px_3px_0px_black] hover:bg-white/80 hover:translate-x-0.5 hover:shadow-[1px_1px_0px_black]"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      {tab.badge && tab.badge > 0 ? (
                        <span className="bg-[#FF5F5F] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-black ml-1 shrink-0">
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* FOOTER USER CARD */}
        <div className="p-4 border-t-4 border-black bg-[#FFF9F0]">
          <div className="flex items-center justify-between mb-2">
            <div className="truncate pr-2">
              <span className="block font-mono text-[8px] font-black text-black/50 uppercase">AUTHENTICATED</span>
              <p className="font-mono text-[10px] font-black text-black truncate leading-tight">
                {currentUser?.email || "admin@swaang.club"}
              </p>
            </div>
            <span className="bg-[#06D6A0] text-black font-mono text-[8px] font-black uppercase px-1.5 py-0.5 border border-black shrink-0">
              CLEARANCE_1
            </span>
          </div>

          <button 
            onClick={() => signOut(auth)} 
            className="w-full py-2 border-2 border-black font-mono font-black uppercase text-[10px] bg-white text-black hover:bg-[#FF5F5F] hover:text-white transition-all shadow-[2px_2px_0px_black] flex items-center justify-center gap-1.5"
          >
            <LogOut size={12} strokeWidth={3} />
            SECURE SIGN OUT
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT AREA (with pb-24 for mobile thumb dock padding) */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 xl:p-10 pb-28 xl:pb-10 custom-scrollbar bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] text-black">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full"
          >
            {activeTab === "dashboard" && <CommandCenter stats={aggregatedStats} onJump={handleJump} />}
            {activeTab === "analytics" && <AnalyticsDashboard />}
            {activeTab === "branding" && <BrandingEditor />}
            {activeTab === "spotlight" && <AOTMManager />}
            {activeTab === "timeline" && <TimelineManager />}
            {activeTab === "archive" && <ArchiveManager />}
            {activeTab === "inbox" && <InboxManager messages={messages} />}
            {activeTab === "auditions" && <AuditionsManager auditions={auditions} />} 
            {activeTab === "resources" && <ResourcesManager />}
            {activeTab === "events" && <EventsManager />}
            {activeTab === "rsvps" && <RsvpsManager /> }
            {activeTab === "team" && <TeamManager initialSearch={searchQuery} /> }
            {activeTab === "alumni" && <AlumniManager /> }
            {activeTab === "blog" && <BlogManager /> }
            {activeTab === "gallery" && <GalleryManager /> }
            {activeTab === "budget" && <BudgetManager />}
            {activeTab === "schedule" && <ProductionCalendar /> }
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