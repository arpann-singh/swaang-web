"use client";
import { useState, useEffect, useRef } from "react";
import { verifyAdminAccess } from "@/lib/authConfig";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Palette,
  Star,
  History,
  Film,
  Newspaper,
  Images,
  UserCheck,
  BookOpen,
  Users,
  GraduationCap,
  Ticket,
  ClipboardList,
  CalendarClock,
  CalendarX,
  KeyRound,
  Clapperboard,
  Wallet,
  Inbox,
  Megaphone,
  FileSignature,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  Sun,
  Moon,
  Command,
  ChevronRight,
  Loader2,
  Rocket,
  Sliders,
  Layers,
  FileSpreadsheet,
} from "lucide-react";

// --- ADMIN MODULE COMPONENTS ---
import BrandingEditor from "@/components/admin/BrandingEditor";
import InboxManager from "@/components/admin/InboxManager";
import AuditionsManager from "@/components/admin/AuditionsManager";
import JoinFormsManager from "@/components/admin/JoinFormsManager";
import EventsManager from "@/components/admin/EventsManager";
import TeamManager from "@/components/admin/TeamManager";
import GalleryManager from "@/components/admin/GalleryManager";
import RsvpsManager from "@/components/admin/RsvpsManager";
import AOTMManager from "@/components/admin/AOTMManager";
import TimelineManager from "@/components/admin/TimelineManager";
import CreditsEditor from "@/components/admin/CreditsEditor";
import NoticesManager from "@/components/admin/NoticesManager";
import BackstageManager from "@/components/admin/BackstageManager";
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
  const [mobileCatFilter, setMobileCatFilter] = useState("ALL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [siteConfig, setSiteConfig] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [auditions, setAuditions] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  // Load persisted theme
  useEffect(() => {
    const saved = localStorage.getItem("swaang_admin_theme") as "dark" | "light" | null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("swaang_admin_theme", next);
  };

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

        const unsubConfig = onSnapshot(
          doc(db, "settings", "site_config"),
          (d) => setSiteConfig(d.data() || {}),
          (err) => console.warn("Site config listener warning:", err)
        );

        const unsubInbox = onSnapshot(
          query(collection(db, "messages"), orderBy("createdAt", "desc")),
          (s) => setMessages(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.warn("Inbox listener warning:", err)
        );

        const unsubAuditions = onSnapshot(
          query(collection(db, "auditions"), orderBy("submittedAt", "desc")),
          (s) => setAuditions(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.warn("Auditions listener warning:", err)
        );

        const unsubTeam = onSnapshot(
          collection(db, "team"),
          (s) => setTeam(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
          (err) => console.warn("Team listener warning:", err)
        );

        const unsubSched = onSnapshot(
          query(collection(db, "production_schedule"), orderBy("date", "asc")),
          (s) => {
            setSchedule(s.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
          },
          (err) => {
            console.warn("Schedule listener warning:", err);
            setLoading(false);
          }
        );

        unsubs = [unsubConfig, unsubInbox, unsubAuditions, unsubTeam, unsubSched];
      }
    });

    return () => {
      unsubAuth();
      unsubs.forEach((unsub) => unsub());
    };
  }, [router]);

  const handleJump = (tabId: string, queryText?: string) => {
    setActiveTab(tabId);
    setSearchQuery(queryText || "");
    setMobileMenuOpen(false);
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent("open-terminal"));
  };

  const aggregatedStats = {
    crewCount: team.filter((m) => m.category === "active" || m.category === "president").length,
    unreadCount: messages.length,
    activeShow: siteConfig.currentProduction || "No Active Show",
    nextCall: schedule.length > 0 ? `${schedule[0].title} (${schedule[0].date})` : "No Calls Scheduled",
  };

  const pendingAuditionsCount = auditions.filter((a) => !a.status || a.status === "pending").length;

  // 🗂️ COMPLETE 22-MODULE CATEGORIZED ARCHITECTURE
  const tabCategories = [
    {
      id: "EXEC",
      title: "EXECUTIVE HUB",
      shortTitle: "Executive",
      tabs: [
        { id: "dashboard", label: "Master Hub", tag: "MAIN", icon: LayoutDashboard, desc: "Operations overview, broadcast & backup" },
        { id: "analytics", label: "Analytics", tag: "STATS", icon: BarChart3, desc: "Live Firestore telemetry across 7 collections" },
      ],
    },
    {
      id: "MEDIA",
      title: "EDITORIAL & MEDIA",
      shortTitle: "Editorial",
      tabs: [
        { id: "branding", label: "Brand Identity", tag: "VISUAL", icon: Palette, desc: "Hero, Faculty Backbone, Journey & Founders" },
        { id: "spotlight", label: "Spotlight (AOTM)", tag: "HERO", icon: Star, desc: "Artist of the Month editorial & preview" },
        { id: "timeline", label: "Timeline & Journey", tag: "HIST", icon: History, desc: "10-year historical milestones chronicle" },
        { id: "archive", label: "Production Archive", tag: "FILM", icon: Film, desc: "Stage plays, Nukkad Nataks & short films" },
        { id: "blog", label: "Articles & Blog", tag: "TEXT", icon: Newspaper, desc: "Publish & edit articles behind the curtain" },
        { id: "gallery", label: "Visual Gallery", tag: "MEDIA", icon: Images, desc: "Bulk photo upload & homepage curation" },
      ],
    },
    {
      id: "FORMS",
      title: "FORMS & RECRUITMENT",
      shortTitle: "Forms",
      tabs: [
        { id: "join_launchpad", label: "Join Us Launchpad", tag: "LIVE", icon: Rocket, desc: "Make forms live on Join Us button, Hero CTA & schedule" },
        { id: "form_builder", label: "Form & Question Studio", tag: "BUILD", icon: Sliders, desc: "Create custom forms, 19 field types & conditional logic" },
        { id: "form_categories", label: "Wings & Categories", tag: "WINGS", icon: Layers, desc: "Society wings, departments, quotas & card colors" },
        { id: "form_responses", label: "Form Responses", tag: "SHEET", icon: FileSpreadsheet, badge: pendingAuditionsCount, desc: "Dynamic custom question responses & full CSV export" },
      ],
    },
    {
      id: "CAST",
      title: "CASTING & PEOPLE",
      shortTitle: "Casting",
      tabs: [
        { id: "auditions", label: "Casting Desk", tag: "TRYOUT", icon: UserCheck, badge: pendingAuditionsCount, desc: "Applicant roster & 40-pt judging matrix" },
        { id: "resources", label: "Audition Prep", tag: "DOCS", icon: BookOpen, desc: "Monologues, character breakdowns & passkey" },
        { id: "team", label: "Crew Roster", tag: "PEOPLE", icon: Users, desc: "Active ensemble, leaders & graduation" },
        { id: "alumni", label: "Alumni Hall", tag: "LEGACY", icon: GraduationCap, desc: "Hall of Fame legends & past presidents" },
      ],
    },
    {
      id: "STAGE",
      title: "STAGE & BACKSTAGE",
      shortTitle: "Stage",
      tabs: [
        { id: "events", label: "Showtimes & Events", tag: "STAGE", icon: Ticket, desc: "Playbill desk, posters, trailers & ticketing" },
        { id: "rsvps", label: "Guest List (RSVPs)", tag: "GUESTS", icon: ClipboardList, desc: "Audience reservations & door check-in" },
        { id: "schedule", label: "Rehearsal Calls", tag: "CALLS", icon: CalendarClock, desc: "Drag-and-drop multi-track calendar" },
        { id: "conflicts", label: "Conflict Matrix", tag: "AUDIT", icon: CalendarX, desc: "Cast availability heatmap by day & hour" },
        { id: "backstage", label: "Backstage Pass", tag: "ACCESS", icon: KeyRound, desc: "Live cue system, call sheet, reports & vault" },
        { id: "credits", label: "Playbill Credits", tag: "CAST", icon: Clapperboard, desc: "Technical architects & developer credits" },
      ],
    },
    {
      id: "COMMS",
      title: "FINANCE & COMMS",
      shortTitle: "Finance",
      tabs: [
        { id: "budget", label: "Finances & Budget", tag: "FUNDS", icon: Wallet, desc: "Show budget cap, expenses ledger & CSV" },
        { id: "inbox", label: "Inquiries & Inbox", tag: "MAIL", icon: Inbox, badge: messages.length, desc: "Direct contact messages & invitations" },
        { id: "notices", label: "Public Notices", tag: "ALERT", icon: Megaphone, desc: "Global news strip alerts & priorities" },
        { id: "letters", label: "Official Letters", tag: "PRINT", icon: FileSignature, desc: "SSTC permission PDF letter generator" },
      ],
    },
  ];

  const flatTabs = tabCategories.flatMap((c) =>
    c.tabs.map((t) => ({ ...t, category: c.title, categoryShort: c.shortTitle, categoryId: c.id }))
  );
  const currentTabObj = flatTabs.find((t) => t.id === activeTab) || flatTabs[0];
  const currentCategory = tabCategories.find((c) => c.tabs.some((t) => t.id === activeTab)) || tabCategories[0];

  const filteredCategories = tabCategories
    .filter((cat) => mobileCatFilter === "ALL" || cat.id === mobileCatFilter)
    .map((cat) => ({
      ...cat,
      tabs: cat.tabs.filter(
        (t) =>
          t.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          t.id.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          t.desc.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
          cat.title.toLowerCase().includes(sidebarFilter.toLowerCase())
      ),
    }))
    .filter((cat) => cat.tabs.length > 0);

  const themeClass = `adm ${theme === "dark" ? "adm-dark" : "adm-light"}`;

  if (authLoading || loading) {
    return (
      <div className={`${themeClass} min-h-screen flex flex-col items-center justify-center p-6 text-center`}>
        <div className="adm-card p-8 max-w-sm w-full flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-adm-accent-text" />
          <p className="adm-h3">{authLoading ? "Verifying Clearance..." : "Initializing Studio Console..."}</p>
          <p className="adm-muted">Connecting real-time Firestore telemetry</p>
        </div>
      </div>
    );
  }

  const ActiveIcon = currentTabObj.icon || LayoutDashboard;

  return (
    <div className={`${themeClass} flex flex-col xl:flex-row h-[100dvh] w-full overflow-hidden transition-colors duration-200`}>
      <CommandPalette
        onJump={handleJump}
        tabs={flatTabs}
        team={team || []}
        events={schedule || []}
        auditions={auditions || []}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* =====================================================================
          💻 DESKTOP SIDEBAR (Collapsible Icon-Rail or Full Categorized List)
         ===================================================================== */}
      <aside
        className={`hidden xl:flex flex-col shrink-0 h-full bg-adm-surface border-r border-adm-line z-40 transition-all duration-200 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-adm-line flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleJump("dashboard")}
            className="flex items-center gap-2.5 text-left min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-adm-accent text-adm-accent-fg font-display font-bold text-lg flex items-center justify-center shrink-0 shadow-sm">
              S
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-xl font-bold tracking-tight text-adm-fg">SWAANG</span>
                  <span className="adm-badge adm-badge-accent text-[10px] py-0 px-1.5">CMS</span>
                </div>
                <p className="text-[11px] text-adm-fg-3 truncate">Directorate Studio Console</p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm shrink-0"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Filter Input (Expanded Mode) */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-adm-line">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter 22 modules..."
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                className="adm-input py-1.5 pl-8 pr-8 text-xs"
              />
              {sidebarFilter && (
                <button
                  type="button"
                  onClick={() => setSidebarFilter("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-adm-fg-3 hover:text-adm-fg"
                  aria-label="Clear filter"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categorized Navigation List */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-2.5 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-adm-fg-3">
                    {cat.title}
                  </span>
                  <span className="text-[10px] font-mono text-adm-fg-3">{cat.tabs.length}</span>
                </div>
              )}
              <div className="space-y-0.5">
                {cat.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleJump(tab.id)}
                      title={sidebarCollapsed ? `${tab.label} — ${tab.desc}` : tab.desc}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium transition-all relative ${
                        sidebarCollapsed ? "justify-center" : "justify-between"
                      } ${
                        isActive
                          ? "bg-adm-accent/15 text-adm-fg font-semibold border border-adm-accent/40 shadow-xs"
                          : "text-adm-fg-2 hover:text-adm-fg hover:bg-adm-surface-2 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={`shrink-0 ${isActive ? "text-adm-accent-text" : "text-adm-fg-3"}`}
                        />
                        {!sidebarCollapsed && <span className="truncate">{tab.label}</span>}
                      </div>

                      {!sidebarCollapsed && tab.badge && tab.badge > 0 ? (
                        <span className="adm-badge adm-badge-danger text-[10px] py-0 px-1.5">
                          {tab.badge}
                        </span>
                      ) : null}

                      {sidebarCollapsed && tab.badge && tab.badge > 0 ? (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-adm-danger" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Identity, Theme Toggle & Sign Out */}
        <div className="p-3 border-t border-adm-line bg-adm-surface-2 space-y-2.5">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-adm-fg-3">
                  Authenticated Admin
                </p>
                <p className="text-xs font-medium text-adm-fg truncate">
                  {currentUser?.email || "admin@swaang.club"}
                </p>
              </div>
              <span className="adm-badge adm-badge-success text-[10px] py-0 px-2">LIVE</span>
            </div>
          )}

          <div className={`flex items-center gap-1.5 ${sidebarCollapsed ? "flex-col" : ""}`}>
            <button
              type="button"
              onClick={toggleTheme}
              className={`adm-btn adm-btn-secondary adm-btn-sm ${sidebarCollapsed ? "w-10 px-0" : "flex-1"}`}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} className="text-adm-accent-text shrink-0" />
                  {!sidebarCollapsed && <span>Light Theme</span>}
                </>
              ) : (
                <>
                  <Moon size={14} className="shrink-0" />
                  {!sidebarCollapsed && <span>Dark Theme</span>}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="adm-btn adm-btn-danger adm-btn-sm adm-btn-icon shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================================
          🚀 RIGHT COLUMN: STICKY HEADER + QUICK RAIL + WORKSPACE + MOBILE DOCK
         ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP APPLICATION HEADER (Mobile & Desktop) */}
        <header className="w-full bg-adm-surface/95 backdrop-blur-md border-b border-adm-line px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 z-30 shrink-0">
          {/* Left: Brand (on mobile) + Active Module Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden w-9 h-9 rounded-xl bg-adm-accent text-adm-accent-fg font-display font-bold text-base flex items-center justify-center shrink-0 shadow-xs"
              title="Open all 22 modules"
            >
              S
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-adm-fg-3">
                <span className="font-semibold uppercase tracking-wider text-adm-accent-text truncate">
                  {currentCategory.shortTitle}
                </span>
                <ChevronRight size={12} className="shrink-0" />
                <span className="truncate hidden sm:inline">{currentTabObj.desc}</span>
              </div>
              <div className="flex items-center gap-2">
                <ActiveIcon size={16} className="text-adm-accent-text shrink-0 hidden sm:inline" />
                <h1 className="text-sm sm:text-base font-bold text-adm-fg truncate">
                  {currentTabObj.label}
                </h1>
              </div>
            </div>
          </div>

          {/* Right: Search Omnibar, Public Site Link, Theme Switcher & Sign Out */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search / Command Palette Trigger */}
            <button
              type="button"
              onClick={openCommandPalette}
              className="adm-btn adm-btn-secondary adm-btn-sm gap-2 px-2.5 sm:px-3"
              title="Open Command Palette (Ctrl+K)"
            >
              <Search size={14} className="text-adm-fg-3" />
              <span className="hidden md:inline text-xs text-adm-fg-2">Quick Jump...</span>
              <kbd className="adm-kbd hidden sm:inline-flex">⌘K</kbd>
            </button>

            {/* Theme Toggle Pill (Always visible on mobile & desktop) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="adm-btn adm-btn-secondary adm-btn-sm px-2.5 sm:px-3"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={14} className="text-adm-accent-text" />
                  <span className="text-xs">Light</span>
                </>
              ) : (
                <>
                  <Moon size={14} />
                  <span className="text-xs">Dark</span>
                </>
              )}
            </button>

            {/* View Live Public Website */}
            <Link
              href="/"
              target="_blank"
              className="adm-btn adm-btn-ghost adm-btn-sm hidden sm:inline-flex"
              title="Open public website in new tab"
            >
              <ExternalLink size={14} />
              <span className="hidden lg:inline text-xs">Live Site</span>
            </Link>

            {/* Mobile Sign Out Button */}
            <button
              type="button"
              onClick={() => signOut(auth)}
              className="xl:hidden adm-btn adm-btn-danger adm-btn-sm adm-btn-icon"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* SECONDARY QUICK-SWITCH PILL RAIL
            - On Desktop: shows sibling modules within the current category for 1-click tab switching
            - On Mobile/Tablet: shows horizontally scrollable pills across all 22 modules so any page is 1 tap away! */}
        <div className="w-full bg-adm-surface-2/80 border-b border-adm-line px-3 sm:px-6 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 adm-scroll-x">
          {/* Desktop sibling tabs */}
          <div className="hidden xl:flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-adm-fg-3 mr-1">
              {currentCategory.title}:
            </span>
            {currentCategory.tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleJump(t.id)}
                  data-active={active ? "true" : "false"}
                  className="adm-chip min-h-7 py-1 px-2.5 text-xs"
                >
                  <Icon size={13} />
                  <span>{t.label}</span>
                  {t.badge && t.badge > 0 ? (
                    <span className="adm-badge adm-badge-danger text-[10px] py-0 px-1.5">
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Mobile & Tablet full 22-module horizontal quick rail */}
          <div className="flex xl:hidden items-center gap-1.5">
            {flatTabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleJump(t.id)}
                  data-active={active ? "true" : "false"}
                  className="adm-chip min-h-7 py-1 px-2.5 text-xs"
                >
                  <Icon size={13} />
                  <span>{t.label}</span>
                  {t.badge && t.badge > 0 ? (
                    <span className="adm-badge adm-badge-danger text-[10px] py-0 px-1.5">
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🚀 MAIN SCROLLABLE WORKSPACE */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 xl:p-8 pb-28 xl:pb-12"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="max-w-7xl mx-auto w-full"
            >
              {activeTab === "dashboard" && <CommandCenter stats={aggregatedStats} onJump={handleJump} />}
              {activeTab === "analytics" && <AnalyticsDashboard />}
              {activeTab === "branding" && <BrandingEditor />}
              {activeTab === "spotlight" && <AOTMManager />}
              {activeTab === "timeline" && <TimelineManager />}
              {activeTab === "archive" && <ArchiveManager />}
              {activeTab === "inbox" && <InboxManager messages={messages} />}
              {activeTab === "join_launchpad" && (
                <JoinFormsManager initialSubTab="launchpad" auditions={auditions} onNavigateTab={handleJump} />
              )}
              {activeTab === "form_builder" && (
                <JoinFormsManager initialSubTab="builder" auditions={auditions} onNavigateTab={handleJump} />
              )}
              {activeTab === "form_categories" && (
                <JoinFormsManager initialSubTab="wings" auditions={auditions} onNavigateTab={handleJump} />
              )}
              {activeTab === "form_responses" && (
                <JoinFormsManager initialSubTab="responses" auditions={auditions} onNavigateTab={handleJump} />
              )}
              {activeTab === "auditions" && <AuditionsManager auditions={auditions} />}
              {activeTab === "resources" && <ResourcesManager />}
              {activeTab === "events" && <EventsManager />}
              {activeTab === "rsvps" && <RsvpsManager />}
              {activeTab === "team" && <TeamManager initialSearch={searchQuery} />}
              {activeTab === "alumni" && <AlumniManager />}
              {activeTab === "blog" && <BlogManager />}
              {activeTab === "gallery" && <GalleryManager />}
              {activeTab === "budget" && <BudgetManager />}
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

      {/* =====================================================================
          📱 FIXED BOTTOM COMMAND DOCK (Mobile & Tablet Thumb Zone)
         ===================================================================== */}
      <nav
        aria-label="Mobile Navigation Dock"
        className="xl:hidden fixed bottom-0 left-0 right-0 bg-adm-surface/95 backdrop-blur-lg border-t border-adm-line z-40 px-1.5 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {[
            { id: "dashboard", label: "Hub", icon: LayoutDashboard },
            { id: "auditions", label: "Casting", icon: UserCheck, badge: pendingAuditionsCount },
            { id: "schedule", label: "Calls", icon: CalendarClock },
            { id: "inbox", label: "Inbox", icon: Inbox, badge: messages.length },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id && !mobileMenuOpen;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleJump(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
                  active
                    ? "bg-adm-accent/15 text-adm-accent-text font-semibold"
                    : "text-adm-fg-3 hover:text-adm-fg"
                }`}
              >
                <Icon size={18} />
                <span className="text-[11px] mt-0.5 truncate">{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className="absolute top-1 right-2.5 min-w-4 h-4 px-1 rounded-full bg-adm-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}

          {/* 5th Button: All 22 Modules Sheet Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors ${
              mobileMenuOpen
                ? "bg-adm-accent text-adm-accent-fg font-bold"
                : "text-adm-fg-2 hover:text-adm-fg"
            }`}
          >
            <LayoutGrid size={18} />
            <span className="text-[11px] mt-0.5 truncate">Modules</span>
          </button>
        </div>
      </nav>

      {/* =====================================================================
          📱 MOBILE SLIDE-UP ALL-MODULES DRAWER SHEET
         ===================================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="xl:hidden fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="xl:hidden fixed bottom-0 left-0 right-0 max-h-[88dvh] bg-adm-surface border-t border-adm-line rounded-t-3xl z-50 flex flex-col overflow-hidden"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
            >
              {/* Sheet Header */}
              <div className="px-5 pt-3 pb-3.5 border-b border-adm-line shrink-0">
                <div
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-1 bg-adm-line-strong rounded-full mx-auto mb-3 cursor-pointer"
                />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-adm-fg">
                      All {flatTabs.length} Admin Modules
                    </h3>
                    <p className="text-xs text-adm-fg-3">
                      Tap any module to switch workspace immediately
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="adm-btn adm-btn-secondary adm-btn-sm"
                    >
                      {theme === "dark" ? <Sun size={14} className="text-adm-accent-text" /> : <Moon size={14} />}
                      <span>{theme === "dark" ? "Light" : "Dark"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                      aria-label="Close modules drawer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative mt-3">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search any module, feature or category..."
                    value={sidebarFilter}
                    onChange={(e) => setSidebarFilter(e.target.value)}
                    className="adm-input pl-9 pr-9 py-2 text-sm"
                  />
                  {sidebarFilter && (
                    <button
                      type="button"
                      onClick={() => setSidebarFilter("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-fg-3 hover:text-adm-fg"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto mt-3 adm-scroll-x">
                  {[
                    { id: "ALL", label: `All (${flatTabs.length})` },
                    ...tabCategories.map((c) => ({ id: c.id, label: `${c.shortTitle} (${c.tabs.length})` })),
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setMobileCatFilter(c.id)}
                      data-active={mobileCatFilter === c.id ? "true" : "false"}
                      className="adm-chip min-h-7 py-1 px-3 text-xs"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Categorized Grid */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="adm-eyebrow">{cat.title}</span>
                      <span className="text-xs text-adm-fg-3">{cat.tabs.length} modules</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleJump(tab.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                              isActive
                                ? "bg-adm-accent/15 border-adm-accent/45 text-adm-fg shadow-xs"
                                : "bg-adm-surface-2 border-adm-line text-adm-fg-2 hover:text-adm-fg hover:border-adm-line-strong"
                            }`}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                                isActive
                                  ? "bg-adm-accent text-adm-accent-fg border-adm-accent"
                                  : "bg-adm-surface text-adm-fg-2 border-adm-line"
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-sm text-adm-fg truncate">{tab.label}</span>
                                {tab.badge && tab.badge > 0 ? (
                                  <span className="adm-badge adm-badge-danger text-[10px] py-0 px-1.5">
                                    {tab.badge}
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-adm-fg-3 truncate mt-0.5">{tab.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sheet Footer */}
              <div className="p-4 border-t border-adm-line bg-adm-surface-2 flex items-center justify-between gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="min-w-0">
                  <p className="text-[11px] text-adm-fg-3">Signed in as</p>
                  <p className="text-xs font-semibold text-adm-fg truncate">
                    {currentUser?.email || "admin@swaang.club"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href="/" target="_blank" className="adm-btn adm-btn-secondary adm-btn-sm">
                    <ExternalLink size={14} />
                    <span>Live Site</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut(auth)}
                    className="adm-btn adm-btn-danger adm-btn-sm"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}