"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("branding");
  const [siteConfig, setSiteConfig] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [auditions, setAuditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (u) => { if (!u) router.push("/admin/login"); });

    onSnapshot(doc(db, "settings", "site_config"), (d) => setSiteConfig(d.data() || {}));

    onSnapshot(query(collection(db, "messages"), orderBy("timestamp", "desc")), (s) => 
      setMessages(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    onSnapshot(query(collection(db, "auditions"), orderBy("submittedAt", "desc")), (s) => {
      setAuditions(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, [router]);

  const tabs = [
    { id: "branding", label: "Branding", color: "bg-[#FF5F5F]" },
    { id: "spotlight", label: "Spotlight", color: "bg-[#FFD166]" },
    { id: "timeline", label: "Timeline", color: "bg-[#06D6A0]" },
    { id: "inbox", label: "Inbox", color: "bg-[#FF5F5F]" },
    { id: "auditions", label: "Auditions", color: "bg-[#FFD166]" },
    { id: "events", label: "Events", color: "bg-[#06D6A0]" },
    { id: "team", label: "Team", color: "bg-[#FF5F5F]" },
    { id: "gallery", label: "Gallery", color: "bg-[#FFD166]" },
    { id: "notices", label: "Public", color: "bg-[#FF5F5F]" },
    { id: "backstage", label: "Backstage", color: "bg-[#06D6A0]" },
    { id: "credits", label: "Credits", color: "bg-[#FF5F5F]" },
  ];

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">Syncing Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col xl:flex-row font-sans text-[#2D2D2D] w-full overflow-hidden">
      
      <aside className="w-full xl:w-72 bg-white border-b-4 xl:border-b-0 xl:border-r-4 border-[#2D2D2D] flex flex-col shrink-0 h-auto xl:h-screen sticky top-0 z-50">
        
        <div className="p-4 xl:p-8 pb-3 xl:pb-0 flex justify-between items-center xl:items-start xl:flex-col">
          <h2 className="font-cinzel text-2xl xl:text-3xl font-black xl:mb-8 tracking-tighter uppercase">SWAANG</h2>
          <button onClick={() => signOut(auth)} className="xl:hidden px-4 py-2 border-2 border-[#2D2D2D] rounded-lg font-black uppercase text-[9px] bg-red-100 text-red-600 shadow-[2px_2px_0px_#2D2D2D] active:translate-y-0.5 active:shadow-none">
            Sign Out
          </button>
        </div>

        <nav className="flex flex-row xl:flex-col gap-2 xl:gap-3 px-4 xl:px-8 pb-4 xl:pb-0 overflow-x-auto no-scrollbar items-center xl:items-stretch whitespace-nowrap w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 xl:p-4 rounded-xl xl:rounded-2xl border-2 xl:border-4 border-[#2D2D2D] font-black uppercase text-[10px] xl:text-[11px] transition-all ${activeTab === tab.id ? `${tab.color} text-white shadow-[3px_3px_0px_#2D2D2D] xl:shadow-[6px_6px_0px_#2D2D2D] -translate-y-0.5 xl:-translate-y-1` : "bg-white shadow-[2px_2px_0px_#2D2D2D] xl:shadow-[4px_4px_0px_#2D2D2D]"}`}
            >
              {tab.label}
              {tab.id === "inbox" && messages.length > 0 && ` (${messages.length})`}
              {tab.id === "auditions" && auditions.length > 0 && ` (${auditions.length})`}
            </button>
          ))}
        </nav>
        
        <button onClick={() => signOut(auth)} className="hidden xl:block mt-auto mx-8 mb-8 p-4 border-4 border-[#2D2D2D] rounded-xl font-black uppercase text-[9px] bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-colors">
          Sign Out
        </button>
      </aside>

      <main className="flex-1 w-full max-w-full overflow-x-hidden overflow-y-auto p-2 sm:p-6 xl:p-12">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {activeTab === "branding" && <BrandingEditor />}
            {activeTab === "spotlight" && <AOTMManager />}
            {activeTab === "timeline" && <TimelineManager />}
            {activeTab === "inbox" && <InboxManager messages={messages} />}
            {activeTab === "auditions" && <AuditionsManager auditions={auditions} />} 
            {activeTab === "events" && <EventsManager />}
            {activeTab === "team" && <TeamManager />}
            {activeTab === "gallery" && <GalleryManager />}
            {activeTab === "notices" && <NoticesManager />}
            {activeTab === "backstage" && <BackstageManager />}
            {activeTab === "credits" && <CreditsEditor />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
