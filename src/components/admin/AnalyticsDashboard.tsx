"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { Activity, Users, Ticket, Eye } from "lucide-react";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({ views: 12450, rsvps: 342, applicants: 0, crew: 0 });

  useEffect(() => {
    // We mock views/RSVPs here as firestore counters, pulling actual crew/audition counts.
    const unsubA = onSnapshot(collection(db, "auditions"), (s) => setStats(prev => ({...prev, applicants: s.size})));
    const unsubT = onSnapshot(collection(db, "team"), (s) => setStats(prev => ({...prev, crew: s.size})));
    return () => { unsubA(); unsubT(); };
  }, []);

  const cards = [
    { title: "Total Views", val: stats.views, icon: Eye, color: "bg-[#FFD166]" },
    { title: "Event RSVPs", val: stats.rsvps, icon: Ticket, color: "bg-[#06D6A0]" },
    { title: "Auditionees", val: stats.applicants, icon: Activity, color: "bg-[#FF5F5F]" },
    { title: "Active Crew", val: stats.crew, icon: Users, color: "bg-[#94A3B8]" },
  ];

  return (
    <div className="bg-white border-4 border-[var(--border-primary)] rounded-[2rem] p-8 shadow-[8px_8px_0px_var(--border-primary)]">
      <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-8 flex items-center gap-3">
        <Activity className="w-10 h-10 text-[#FFD166]" /> Website Analytics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`${c.color} p-6 border-4 border-[var(--border-primary)] rounded-2xl shadow-[4px_4px_0px_var(--border-primary)] relative overflow-hidden group`}>
              <Icon className="absolute -right-4 -bottom-4 w-24 h-24 text-[var(--text-primary)] opacity-10 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-[10px] tracking-widest text-[var(--text-primary)] opacity-80">{c.title}</h3>
              <p className="text-5xl font-black text-[var(--text-primary)] mt-2">{c.val}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 border-4 border-[var(--border-primary)] rounded-2xl bg-gray-50 flex items-center justify-center h-64 border-dashed">
        <p className="font-black uppercase tracking-widest text-gray-400">Traffic Graph Rendering (Coming Soon)</p>
      </div>
    </div>
  );
}
