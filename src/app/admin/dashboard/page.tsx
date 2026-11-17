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
  ArrowRight,
  ShieldCheck
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
        { id: "dashboard", label: "Master Hub", tag: "MAIN" },
        { id: "analytics", label: "Analytics", tag: "STATS" },
      ]
    },
    {
      title: "EDITORIAL & MEDIA",
      tabs: [
        { id: "branding", label: "Brand Identity", tag: "VISUAL" },
        { id: "spotlight", label: "Spotlight (AOTM)", tag: "HERO" },
        { id: "timeline", label: "Timeline & Journey", tag: "HIST" },
        { id: "archive", label: "Production Archive", tag: "FILM" },
        { id: "blog", label: "Articles & Blog", tag: "TEXT" },
        { id: "gallery", label: "Visual Gallery", tag: "MEDIA" },
      ]
    },
    {
      title: "CASTING & PEOPLE",
      tabs: [
        { id: "auditions", label: "Casting Desk", tag: "TRYOUT", badge: pendingAuditionsCount },
        { id: "resources", label: "Audition Prep", tag: "DOCS" },
        { id: "team", label: "Crew Roster", tag: "PEOPLE" },
        { id: "alumni", label: "Alumni Hall", tag: "LEGACY" },
      ]
    },
    {
      title: "STAGE & BACKSTAGE",
      tabs: [
        { id: "events", label: "Showtimes & Events", tag: "STAGE" },
        { id: "rsvps", label: "Guest List (RSVPs)", tag: "GUESTS" },
        { id: "schedule", label: "Rehearsal Calls", tag: "CALLS" },
        { id: "conflicts", label: "Conflict Matrix", tag: "AUDIT" },
        { id: "backstage", label: "Backstage Pass", tag: "ACCESS" },
        { id: "credits", label: "Playbill Credits", tag: "CAST" },
      ]
    },
    {
      title: "FINANCE & COMMS",
      tabs: [
        { id: "budget", label: "Finances & Budget", tag: "FUNDS" },
        { id: "inbox", label: "Inquiries & Inbox", tag: "MAIL", badge: messages.length },
        { id: "notices", label: "Public Notices", tag: "ALERT" },
        { id: "letters", label: "Official Letters", tag: "PRINT" },
      ]
    }
  ];

  const flatTabs = tabCategories.flatMap(c => c.tabs);
  const currentTabObj = flatTabs.find(t => t.id === activeTab);

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
      <div className="min-h-screen bg-[#0E0E11] flex flex-col items-center justify-center font-mono font-bold tracking-widest text-zinc-300">
        <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">VERIFYING CLEARANCE...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E11] flex flex-col items-center justify-center font-mono font-bold tracking-widest text-zinc-300">
        <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase tracking-[0.3em] text-zinc-400">INITIALIZING DASHBOARD...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row h-screen w-full bg-[#0E0E11] overflow-hidden font-sans text-zinc-100">
      
      <CommandPalette 
        onJump={handleJump} 
        tabs={flatTabs || []} 
        team={team || []} 
        events={schedule || []} 
        auditions={auditions || []}
      />

      {/* 📱 MINIMAL MOBILE TOP BAR */}
      <header className="xl:hidden w-full bg-[#141418]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-cinzel text-xl font-bold tracking-wider text-[#FFF9F0]">SWAANG</span>
          <span className="px-2 py-0.5 font-mono text-[9px] font-bold uppercase rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {currentTabObj?.label || "STUDIO"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
          <button 
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'k'}))}
            className="p-2 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white transition-colors"
            title="Open command palette (Ctrl+K)"
          >
            <Terminal size={14} />
          </button>
          <button 
            onClick={() => signOut(auth)} 
            className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* 📱 FIXED BOTTOM COMMAND DOCK (THE THUMB ZONE) */}
      <nav 
        aria-label="Mobile Navigation Dock"
        className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#141418]/95 backdrop-blur-lg border-t border-white/10 z-40 flex items-stretch justify-around px-2"
      >
        {/* 1. Master Hub */}
        <button 
          onClick={() => handleJump("dashboard")} 
          className={`flex-1 flex flex-col items-center justify-center font-mono transition-all rounded-xl my-1.5 ${
            activeTab === "dashboard" ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Compass size={18} />
          <span className="text-[10px] font-medium uppercase mt-0.5">Hub</span>
        </button>
        
        {/* 2. Auditions (Casting) */}
        <button 
          onClick={() => handleJump("auditions")} 
          className={`flex-1 flex flex-col items-center justify-center font-mono relative transition-all rounded-xl my-1.5 ${
            activeTab === "auditions" ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <UserCheck size={18} />
          <span className="text-[10px] font-medium uppercase mt-0.5">Casting</span>
          {pendingAuditionsCount > 0 && (
            <span className="absolute top-1.5 right-3 bg-rose-500 text-white text-[8px] font-bold px-1.5 rounded-full">
              {pendingAuditionsCount}
            </span>
          )}
        </button>

        {/* 3. Schedule / Call Times */}
        <button 
          onClick={() => handleJump("schedule")} 
          className={`flex-1 flex flex-col items-center justify-center font-mono transition-all rounded-xl my-1.5 ${
            activeTab === "schedule" ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Clock size={18} />
          <span className="text-[10px] font-medium uppercase mt-0.5">Calls</span>
        </button>

        {/* 4. Inbox */}
        <button 
          onClick={() => handleJump("inbox")} 
          className={`flex-1 flex flex-col items-center justify-center font-mono relative transition-all rounded-xl my-1.5 ${
            activeTab === "inbox" ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mail size={18} />
          <span className="text-[10px] font-medium uppercase mt-0.5">Inbox</span>
          {messages.length > 0 && (
            <span className="absolute top-1.5 right-3 bg-rose-500 text-white text-[8px] font-bold px-1.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>

        {/* 5. Modules Grid (Triggers Full Quick-Sheet) */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className={`flex-1 flex flex-col items-center justify-center font-mono transition-all rounded-xl my-1.5 ${
            mobileMenuOpen ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <LayoutGrid size={18} />
          <span className="text-[10px] font-medium uppercase mt-0.5">Modules</span>
        </button>
      </nav>

      {/* 📱 MOBILE QUICK-SHEET MODAL (SLIDE-UP DRAWER) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-[#16161A] border-t border-white/15 rounded-t-3xl z-50 p-6 overflow-y-auto custom-scrollbar shadow-2xl text-zinc-100 flex flex-col justify-between"
            >
              <div>
                <div 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 cursor-pointer hover:bg-white/40"
                />

                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                  <div>
                    <h3 className="font-cinzel text-2xl font-bold uppercase text-[#FFF9F0]">
                      All Modules
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">
                      Full Swaang Production & Editorial Suite
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search any module or tool..."
                    value={sidebarFilter}
                    onChange={(e) => setSidebarFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl font-mono text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/50"
                  />
                </div>

                <div className="space-y-6">
                  {filteredCategories.map((cat) => (
                    <div key={cat.title}>
                      <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400/70 mb-2.5">
                        // {cat.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {cat.tabs.map((tab) => {
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleJump(tab.id)}
                              className={`p-3 rounded-xl border font-mono text-xs text-left transition-all flex items-center justify-between ${
                                isActive
                                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                                  : "bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] border-white/5"
                              }`}
                            >
                              <span className="truncate">{tab.label}</span>
                              {tab.badge && tab.badge > 0 ? (
                                <span className="bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-1">
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

              <div className="pt-6 border-t border-white/10 mt-8">
                <div className="flex items-center justify-between mb-3 font-mono text-xs text-zinc-400">
                  <span className="truncate pr-2">{currentUser?.email}</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ADMIN</span>
                </div>
                <button
                  onClick={() => signOut(auth)}
                  className="w-full py-3 rounded-xl font-mono font-bold text-xs uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                >
                  SECURE SIGN OUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 💻 DESKTOP SLEEK ATELIER SIDEBAR */}
      <aside className="hidden xl:flex w-72 bg-[#121215] border-r border-white/10 flex-col shrink-0 h-full relative z-40 text-zinc-300 justify-between">
        
        {/* BRAND HEADER & LIVE STATUS */}
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-cinzel text-3xl font-bold tracking-wider text-[#FFF9F0]">
                SWAANG
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  STUDIO CMS
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
            </div>

            <button 
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'k'}))}
              className="p-2 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
              title="Open Omnibar (Ctrl+K)"
            >
              <Terminal size={14} />
            </button>
          </div>

          {/* SIDEBAR INSTANT FILTER */}
          <div className="relative mt-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tools..."
              value={sidebarFilter}
              onChange={(e) => setSidebarFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl font-mono text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
        </div>

        {/* 📜 SCROLLABLE CATEGORIZED NAVIGATION */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-6">
          {filteredCategories.map((cat) => (
            <div key={cat.title} className="space-y-1.5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-500 px-2">
                {cat.title}
              </p>
              <div className="space-y-1">
                {cat.tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleJump(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-mono text-xs transition-all flex items-center justify-between ${
                        isActive 
                          ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/40 shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      {tab.badge && tab.badge > 0 ? (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ml-1 shrink-0">
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
        <div className="p-4 border-t border-white/10 bg-[#16161A]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="truncate pr-2">
              <span className="block font-mono text-[8px] font-bold text-zinc-500 uppercase">AUTHENTICATED</span>
              <p className="font-mono text-xs font-medium text-zinc-200 truncate leading-tight">
                {currentUser?.email || "admin@swaang.club"}
              </p>
            </div>
            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
              LEVEL 1
            </span>
          </div>

          <button 
            onClick={() => signOut(auth)} 
            className="w-full py-2 rounded-lg font-mono text-[10px] font-bold uppercase text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <LogOut size={12} />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT AREA */}
      <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 xl:p-10 pb-28 xl:pb-10 custom-scrollbar bg-[#0E0E11] text-zinc-100">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }} 
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