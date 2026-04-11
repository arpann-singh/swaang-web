"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, User, Calendar, Layout, Zap, 
  Download, Moon, LogOut, MessageSquare, Plus, Package, Megaphone, X 
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
}

interface PaletteProps {
  onJump: (tabId: string, query?: string) => void;
  tabs: any[];
  team: any[];
  events: any[];
  auditions?: any[];
}

export default function CommandPalette({ 
  onJump, 
  tabs = [], 
  team = [], 
  events = [],
  auditions = [] 
}: PaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // 🔥 NEW: Listener for manual triggers (from mobile header buttons)
  useEffect(() => {
    const handleManualOpen = (e: any) => {
      if (e.detail?.action === 'open-terminal' || (e.ctrlKey && e.key === 'k')) {
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handleManualOpen);
    // Custom event listener for non-keyboard triggers
    window.addEventListener('open-terminal', () => setOpen(true));
    return () => {
      window.removeEventListener('keydown', handleManualOpen);
      window.removeEventListener('open-terminal', () => setOpen(true));
    };
  }, []);

  // 🔍 POWER SEARCH & ACTION LOGIC
  const results = useMemo((): ResultItem[] => {
    if (!query) return [];
    const char = query[0];
    const q = query.slice(1).toLowerCase();
    const rawQ = query.toLowerCase();

    // 1. [!] BROADCAST PREFIX
    if (char === '!') {
      return [{
        id: 'broadcast_msg',
        label: `Broadcast: ${query.slice(1)}`,
        type: 'broadcast' as const,
        icon: Megaphone,
        value: query.slice(1)
      }];
    }

    // 2. [@] PEOPLE DEEP SEARCH
    if (char === '@') {
      return (team || [])
        .filter(m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.includes(q))
        .map(m => ({ 
          id: 'team', 
          label: m.name, 
          sub: `${m.role} • ${m.phone || m.email}`, 
          type: 'member' as const, 
          icon: User 
        }))
        .slice(0, 8);
    }

    // 3. [#] LOGISTICS SEARCH
    if (char === '#') {
       return [
         { id: 'gallery', label: `Search Media: ${q}`, type: 'logistic' as const, icon: Package },
         { id: 'backstage', label: `Search Inventory: ${q}`, type: 'logistic' as const, icon: Package }
       ];
    }

    // 4. [+] CREATION SHORTCUTS
    if (char === '+') {
      return [
        { id: 'create_member', label: `Add Member: ${query.slice(1)}`, type: 'create' as const, icon: Plus, value: query.slice(1) },
        { id: 'create_play', label: `New Event: ${query.slice(1)}`, type: 'create' as const, icon: Plus, value: query.slice(1) }
      ];
    }

    // 5. [>] ACTIONS & GENERAL SEARCH
    const actions: ResultItem[] = [
      { id: 'act_live', label: 'Toggle Audition Form', type: 'action' as const, icon: Zap, cmd: '>live' },
      { id: 'act_export', label: 'Export Auditions CSV', type: 'action' as const, icon: Download, cmd: '>export' },
      { id: 'act_logout', label: 'Secure Logout', type: 'action' as const, icon: LogOut, cmd: '>logout' },
      { id: 'act_dark', label: 'Late Night Mode', type: 'action' as const, icon: Moon, cmd: '>dark' },
    ];

    const filteredActions = actions.filter(a => a.cmd?.includes(rawQ) || a.label.toLowerCase().includes(rawQ));
    
    const filteredTabs = (tabs || [])
      .filter(t => t.label.toLowerCase().includes(rawQ))
      .map(t => ({ id: t.id, label: t.label, type: 'tab' as const, icon: Layout }));

    return [...filteredActions, ...filteredTabs].slice(0, 8);
  }, [query, tabs, team, events]);

  // ⚡ ACTION EXECUTOR
  const handleAction = async (item: ResultItem) => {
    switch (item.id) {
      case 'broadcast_msg':
        if (confirm(`Post this to Crew Hub?\n"${item.value}"`)) {
          await addDoc(collection(db, "notices"), { 
            text: item.value, 
            createdAt: serverTimestamp(), 
            author: "Presidential Broadcast",
            priority: "high"
          });
          alert("Broadcast Dispatched! 📢");
        }
        break;
      case 'act_logout':
        if(confirm("Logout?")) signOut(auth);
        break;
      case 'act_live':
        await setDoc(doc(db, "settings", "auditions"), { isLive: true }, { merge: true });
        alert("Audition Form is now LIVE! 🎭");
        break;
      case 'create_member':
        await addDoc(collection(db, "team"), { name: item.value, category: 'active', createdAt: serverTimestamp() });
        onJump('team', item.value);
        break;
      case 'team':
        onJump('team', item.label);
        break;
      case 'act_dark':
        document.documentElement.classList.toggle('dark-mode');
        break;
      default:
        onJump(item.id);
    }
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-0 md:pt-[15vh] px-0 md:px-4 bg-[#2D2D2D]/90 md:bg-[#2D2D2D]/60 backdrop-blur-md">
      <motion.div 
        initial={{ y: "100%", opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        className="w-full max-w-2xl h-full md:h-auto bg-white border-0 md:border-8 border-[#2D2D2D] rounded-none md:rounded-[3rem] shadow-none md:shadow-[30px_30px_0px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col"
      >
        <div className="relative flex items-center border-b-4 border-[#2D2D2D]/10 px-4 md:px-6 bg-gray-50 shrink-0">
          <Search className="text-[#2D2D2D]/30" size={24} />
          <input 
            autoFocus 
            placeholder="! Notice | @ People | # Logistics | + Create | > Action" 
            className="w-full p-6 text-lg md:text-xl font-black uppercase tracking-tighter outline-none bg-transparent placeholder:text-[#2D2D2D]/20"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[selectedIndex]) handleAction(results[selectedIndex]);
              if (e.key === "ArrowDown") setSelectedIndex(p => (p + 1) % (results.length || 1));
              if (e.key === "ArrowUp") setSelectedIndex(p => (p - 1 + (results.length || 1)) % (results.length || 1));
            }}
          />
          {/* 🔥 NEW: Close button for mobile users */}
          <button onClick={() => setOpen(false)} className="md:hidden p-2 text-[#FF5F5F]">
            <X size={28} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto no-scrollbar pb-20 md:pb-4">
          {results.length > 0 ? (
            <div className="space-y-2 text-left">
              {results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleAction(item)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-4 transition-all ${
                    i === selectedIndex ? "bg-[#FFD166] border-[#2D2D2D] -translate-y-1 shadow-[4px_4px_0px_#2D2D2D]" : "bg-white border-transparent hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className={item.type === 'broadcast' ? 'text-[#FF5F5F]' : 'opacity-40'} />
                    <div className="flex flex-col items-start">
                      <span className="font-black uppercase text-xs md:text-sm tracking-tight">{item.label}</span>
                      {item.sub && <span className="text-[8px] font-bold opacity-40">{item.sub}</span>}
                    </div>
                  </div>
                  <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-1 rounded-md border-2 border-[#2D2D2D] ${
                    item.type === 'broadcast' ? 'bg-[#FF5F5F] text-white' : 
                    item.type === 'create' ? 'bg-[#06D6A0]' : 'bg-gray-100'
                  }`}>
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center opacity-20">
              <p className="font-black uppercase italic text-sm">Prefix required or no results found...</p>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex bg-[#2D2D2D] p-4 justify-between items-center text-white/40">
           <div className="flex gap-4 text-[8px] font-black uppercase tracking-widest">
             <span className="text-[#06D6A0]">! Broadcast</span>
             <span className="text-[#FFD166]">@ People</span>
             <span className="text-[#FF5F5F]"> {`>`} Actions</span>
           </div>
           <p className="text-[8px] font-black uppercase">↵ Execute Command</p>
        </div>
      </motion.div>
    </div>
  );
}