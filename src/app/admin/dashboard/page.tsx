"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import BrandingEditor from "@/components/admin/BrandingEditor";
import InboxManager from "@/components/admin/InboxManager";
import AuditionsManager from "@/components/admin/AuditionsManager";
import EventsManager from "@/components/admin/EventsManager";
import TeamManager from "@/components/admin/TeamManager";
import GalleryManager from "@/components/admin/GalleryManager";
import NoticesManager from "@/components/admin/NoticesManager";
import AOTMManager from "@/components/admin/AOTMManager";
import TimelineManager from "@/components/admin/TimelineManager";

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

    onSnapshot(query(collection(db, "audition_submissions"), orderBy("timestamp", "desc")), (s) => {
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
    { id: "notices", label: "Notices", color: "bg-[#06D6A0]" },
  ];

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase">Syncing Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex font-sans text-[#2D2D2D]">
      <aside className="w-72 bg-white border-r-4 border-[#2D2D2D] p-8 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <h2 className="font-cinzel text-3xl font-black mb-8 tracking-tighter uppercase">SWAANG</h2>
        <nav className="flex flex-col gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border-4 border-[#2D2D2D] font-black uppercase text-[11px] transition-all ${activeTab === tab.id ? `${tab.color} text-white shadow-[6px_6px_0px_#2D2D2D] -translate-y-1` : "bg-white shadow-[4px_4px_0px_#2D2D2D]"}`}
            >
              {tab.label}
              {tab.id === "inbox" && messages.length > 0 && ` (${messages.length})`}
              {tab.id === "auditions" && auditions.length > 0 && ` (${auditions.length})`}
            </button>
          ))}
        </nav>
        <button onClick={() => signOut(auth)} className="mt-auto p-4 border-4 border-[#2D2D2D] rounded-xl font-black uppercase text-[9px] bg-gray-50">Sign Out</button>
      </aside>

      <main className="flex-1 p-16 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {activeTab === "branding" && <BrandingEditor />}
            {activeTab === "spotlight" && <AOTMManager />}
            {activeTab === "timeline" && <TimelineManager />}
            {activeTab === "inbox" && <InboxManager messages={messages} />}
            {activeTab === "auditions" && <AuditionsManager auditions={auditions} />} 
            {activeTab === "events" && <EventsManager />}
            {activeTab === "team" && <TeamManager />}
            {activeTab === "gallery" && <GalleryManager />}
            {activeTab === "notices" && <NoticesManager />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
