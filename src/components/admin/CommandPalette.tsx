"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, User, Calendar, Layout, Zap,
  Download, Moon, Sun, LogOut, Plus, Package, Megaphone, X, CornerDownLeft, Sparkles
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

// 🔥 Defined precise types to satisfy the TypeScript compiler
interface ResultItem {
  id: string;
  label: string;
  type: 'action' | 'create' | 'member' | 'tab' | 'event' | 'broadcast' | 'logistic';
  icon: any;
  sub?: string;
  value?: string;
  cmd?: string;
  category?: string;
  badge?: number;
}

interface PaletteProps {
  onJump: (tabId: string, query?: string) => void;
  tabs: any[];
  team: any[];
  events: any[];
  auditions?: any[];
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export default function CommandPalette({
  onJump,
  tabs = [],
  team = [],
  events = [],
  auditions = [],
  theme = "dark",
  onToggleTheme,
}: PaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔥 Listener for manual triggers (from header buttons)
  useEffect(() => {
    const handleManualOpen = () => setOpen(true);
    window.addEventListener("open-terminal", handleManualOpen);
    return () => window.removeEventListener("open-terminal", handleManualOpen);
  }, []);

  // 🔍 POWER SEARCH & ACTION LOGIC
  const results = useMemo((): ResultItem[] => {
    const actions: ResultItem[] = [
      {
        id: 'act_dark',
        label: theme === "dark" ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        sub: 'Toggle Admin Studio Theme',
        type: 'action',
        icon: theme === "dark" ? Sun : Moon,
        cmd: '>dark >theme >light',
      },
      {
        id: 'act_live',
        label: 'Toggle Audition Form Live',
        sub: 'Open public audition registrations',
        type: 'action',
        icon: Zap,
        cmd: '>live',
      },
      {
        id: 'act_export',
        label: 'Export Auditions CSV',
        sub: 'Download applicant spreadsheet',
        type: 'action',
        icon: Download,
        cmd: '>export',
      },
      {
        id: 'act_logout',
        label: 'Secure Logout',
        sub: 'End current administrator session',
        type: 'action',
        icon: LogOut,
        cmd: '>logout',
      },
    ];

    if (!query.trim()) {
      const allTabs: ResultItem[] = (tabs || []).map((t) => ({
        id: t.id,
        label: t.label,
        sub: t.category || t.desc || "Admin Module",
        type: 'tab' as const,
        icon: t.icon || Layout,
        badge: t.badge,
      }));
      return [...allTabs, ...actions];
    }

    const char = query[0];
    const q = query.slice(1).toLowerCase();
    const rawQ = query.toLowerCase();

    // 1. [!] BROADCAST PREFIX
    if (char === '!') {
      return [{
        id: 'broadcast_msg',
        label: `Broadcast: ${query.slice(1) || 'Type notice message...'}`,
        sub: 'Dispatch instant high-priority notice to feed',
        type: 'broadcast' as const,
        icon: Megaphone,
        value: query.slice(1)
      }];
    }

    // 2. [@] PEOPLE DEEP SEARCH
    if (char === '@') {
      return (team || [])
        .filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q) || m.role?.toLowerCase().includes(q))
        .map(m => ({
          id: 'team',
          label: m.name,
          sub: `${m.role || 'Member'} • ${m.phone || m.email || m.branch || ''}`,
          type: 'member' as const,
          icon: User
        }))
        .slice(0, 10);
    }

    // 3. [#] LOGISTICS SEARCH
    if (char === '#') {
      return [
        { id: 'gallery', label: `Search Media: ${q}`, sub: 'Jump to Visual Gallery', type: 'logistic' as const, icon: Package },
        { id: 'backstage', label: `Search Inventory: ${q}`, sub: 'Jump to Backstage Vault', type: 'logistic' as const, icon: Package }
      ];
    }

    // 4. [+] CREATION SHORTCUTS
    if (char === '+') {
      return [
        { id: 'create_member', label: `Add Member: ${query.slice(1)}`, sub: 'Create active team member record', type: 'create' as const, icon: Plus, value: query.slice(1) },
        { id: 'create_play', label: `New Event: ${query.slice(1)}`, sub: 'Jump to Showtimes & Events', type: 'create' as const, icon: Calendar, value: query.slice(1) }
      ];
    }

    // 5. [>] ACTIONS & GENERAL SEARCH
    const filteredActions = actions.filter(a => a.cmd?.includes(rawQ) || a.label.toLowerCase().includes(rawQ));

    const filteredTabs: ResultItem[] = (tabs || [])
      .filter(t =>
        t.label.toLowerCase().includes(rawQ) ||
        t.id.toLowerCase().includes(rawQ) ||
        (t.category || "").toLowerCase().includes(rawQ) ||
        (t.desc || "").toLowerCase().includes(rawQ)
      )
      .map(t => ({
        id: t.id,
        label: t.label,
        sub: t.category || t.desc || 'Module',
        type: 'tab' as const,
        icon: t.icon || Layout,
        badge: t.badge,
      }));

    const filteredMembers: ResultItem[] = (team || [])
      .filter(m => m.name?.toLowerCase().includes(rawQ) || m.role?.toLowerCase().includes(rawQ))
      .slice(0, 4)
      .map(m => ({
        id: 'team',
        label: m.name,
        sub: `Team • ${m.role || 'Member'}`,
        type: 'member' as const,
        icon: User,
      }));

    return [...filteredTabs, ...filteredActions, ...filteredMembers].slice(0, 14);
  }, [query, tabs, team, events, theme]);

  // ⚡ ACTION EXECUTOR
  const handleAction = async (item: ResultItem) => {
    switch (item.id) {
      case 'broadcast_msg':
        if (item.value && confirm(`Post this to Notices Feed?\n"${item.value}"`)) {
          await addDoc(collection(db, "notices"), {
            title: "BROADCAST",
            content: item.value,
            text: item.value,
            isActive: true,
            createdAt: serverTimestamp(),
            author: "Presidential Broadcast",
            priority: "urgent"
          });
          alert("Broadcast Dispatched! 📢");
        }
        break;
      case 'act_logout':
        if (confirm("Logout of Admin Console?")) signOut(auth);
        break;
      case 'act_live':
        await setDoc(doc(db, "settings", "auditions"), { isLive: true }, { merge: true });
        alert("Audition Form is now LIVE! 🎭");
        break;
      case 'act_export':
        onJump('auditions');
        break;
      case 'create_member':
        if (item.value) {
          await addDoc(collection(db, "team"), { name: item.value, category: 'active', createdAt: serverTimestamp() });
        }
        onJump('team', item.value);
        break;
      case 'create_play':
        onJump('events', item.value);
        break;
      case 'team':
        onJump('team', item.label);
        break;
      case 'act_dark':
        if (onToggleTheme) {
          onToggleTheme();
        } else {
          document.documentElement.classList.toggle('dark-mode');
        }
        break;
      default:
        onJump(item.id);
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-3 sm:pt-[10vh] px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative z-10 w-full max-w-2xl max-h-[82vh] adm-card overflow-hidden flex flex-col"
            style={{ boxShadow: "var(--adm-shadow-lg)" }}
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 border-b border-adm-line px-4 py-3 bg-adm-surface-2 shrink-0">
              <Search className="text-adm-accent-text shrink-0" size={18} />
              <input
                autoFocus
                placeholder="Jump to any module, or use ! Notice | @ People | # Vault | + Create | > Action"
                className="w-full py-1.5 text-sm sm:text-base font-medium text-adm-fg bg-transparent outline-none placeholder:text-adm-fg-3"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results[selectedIndex]) handleAction(results[selectedIndex]);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((p) => (p + 1) % (results.length || 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((p) => (p - 1 + (results.length || 1)) % (results.length || 1));
                  }
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSelectedIndex(0); }}
                  className="adm-btn adm-btn-ghost adm-btn-sm px-2 text-xs"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                aria-label="Close command palette"
              >
                <X size={15} />
              </button>
            </div>

            {/* Prefix Quick Filters */}
            <div className="px-4 py-2 border-b border-adm-line bg-adm-surface flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-adm-fg-3 text-[11px] font-medium mr-1 shrink-0">Quick prefixes:</span>
              {[
                { prefix: "", label: "All Modules" },
                { prefix: ">", label: "> Actions" },
                { prefix: "@", label: "@ Crew" },
                { prefix: "!", label: "! Broadcast" },
                { prefix: "+", label: "+ Create" },
                { prefix: "#", label: "# Logistics" },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setQuery(p.prefix); setSelectedIndex(0); }}
                  className="adm-chip min-h-6 px-2.5 py-0.5 text-[11px]"
                  data-active={query === p.prefix ? "true" : "false"}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="flex-1 p-2.5 overflow-y-auto space-y-1">
              {results.length > 0 ? (
                results.map((item, i) => {
                  const IconComp = item.icon || Sparkles;
                  const active = i === selectedIndex;
                  return (
                    <button
                      key={`${item.id}-${i}`}
                      onClick={() => handleAction(item)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? "bg-adm-accent/15 border border-adm-accent/40 text-adm-fg"
                          : "border border-transparent hover:bg-adm-surface-2 text-adm-fg-2"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          active
                            ? "bg-adm-accent text-adm-accent-fg border-adm-accent"
                            : "bg-adm-surface-2 text-adm-fg-2 border-adm-line"
                        }`}>
                          <IconComp size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-adm-fg truncate">{item.label}</span>
                            {item.badge && item.badge > 0 ? (
                              <span className="adm-badge adm-badge-danger text-[10px] py-0 px-1.5">
                                {item.badge}
                              </span>
                            ) : null}
                          </div>
                          {item.sub && (
                            <p className="text-xs text-adm-fg-3 truncate">{item.sub}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`adm-badge text-[10px] uppercase ${
                          item.type === 'broadcast'
                            ? 'adm-badge-danger'
                            : item.type === 'create'
                            ? 'adm-badge-success'
                            : item.type === 'action'
                            ? 'adm-badge-accent'
                            : 'adm-badge-neutral'
                        }`}>
                          {item.type}
                        </span>
                        {active && <CornerDownLeft size={14} className="text-adm-accent-text hidden sm:block" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-adm-fg-2">No matching modules or commands</p>
                  <p className="text-xs text-adm-fg-3 mt-1">Try searching by module name or use !, @, #, +, &gt;</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-adm-line bg-adm-surface-2 flex items-center justify-between text-[11px] text-adm-fg-3">
              <div className="flex items-center gap-3">
                <span><kbd className="adm-kbd">↑</kbd> <kbd className="adm-kbd">↓</kbd> Navigate</span>
                <span><kbd className="adm-kbd">↵</kbd> Open</span>
                <span className="hidden sm:inline"><kbd className="adm-kbd">Esc</kbd> Close</span>
              </div>
              <span className="font-medium text-adm-accent-text">22 Modules Indexed</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}