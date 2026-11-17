"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Activity, Users, Ticket, Film, Mail, 
  Calendar, Award, Sparkles, TrendingUp, Layers 
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState({
    applicants: 0,
    crew: 0,
    events: 0,
    archive: 0,
    rsvps: 0,
    messages: 0,
    timeline: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuditions = onSnapshot(collection(db, "auditions"), (s) =>
      setStats((prev) => ({ ...prev, applicants: s.size }))
    );
    const unsubTeam = onSnapshot(collection(db, "team"), (s) =>
      setStats((prev) => ({ ...prev, crew: s.size }))
    );
    const unsubEvents = onSnapshot(collection(db, "events"), (s) =>
      setStats((prev) => ({ ...prev, events: s.size }))
    );
    const unsubArchive = onSnapshot(collection(db, "production_archive"), (s) =>
      setStats((prev) => ({ ...prev, archive: s.size }))
    );
    const unsubRsvps = onSnapshot(collection(db, "rsvps"), (s) =>
      setStats((prev) => ({ ...prev, rsvps: s.size }))
    );
    const unsubMessages = onSnapshot(collection(db, "messages"), (s) =>
      setStats((prev) => ({ ...prev, messages: s.size }))
    );
    const unsubTimeline = onSnapshot(collection(db, "timeline"), (s) => {
      setStats((prev) => ({ ...prev, timeline: s.size }));
      setLoading(false);
    });

    return () => {
      unsubAuditions();
      unsubTeam();
      unsubEvents();
      unsubArchive();
      unsubRsvps();
      unsubMessages();
      unsubTimeline();
    };
  }, []);

  const cards = [
    {
      title: "Audition Applicants",
      val: stats.applicants,
      icon: Users,
      color: "bg-[#FF5F5F] text-white",
      desc: "Total registered auditionees in the talent pool",
      badge: "TALENT",
    },
    {
      title: "Active Team & Crew",
      val: stats.crew,
      icon: Award,
      color: "bg-[#06D6A0] text-black",
      desc: "Directory of actors, directors, writers & tech crew",
      badge: "ROSTER",
    },
    {
      title: "Stage Productions",
      val: stats.events,
      icon: Film,
      color: "bg-[#FFD166] text-black",
      desc: "Active repertoire & upcoming performances",
      badge: "MAINSTAGE",
    },
    {
      title: "Archive Titles",
      val: stats.archive,
      icon: Layers,
      color: "bg-white text-black",
      desc: "Past productions preserved in /archive",
      badge: "CATALOG",
    },
    {
      title: "Guest RSVPs",
      val: stats.rsvps,
      icon: Ticket,
      color: "bg-[#06D6A0] text-black",
      desc: "Audience reservations & show guest list",
      badge: "AUDIENCE",
    },
    {
      title: "Inbox Inquiries",
      val: stats.messages,
      icon: Mail,
      color: "bg-[#FF5F5F] text-white",
      desc: "Contact messages & stage invitations",
      badge: "COMMS",
    },
    {
      title: "Timeline Milestones",
      val: stats.timeline,
      icon: Calendar,
      color: "bg-[#FFD166] text-black",
      desc: "10-year historical events in /journey",
      badge: "LEGACY",
    },
  ];

  return (
    <div className="space-y-8 text-left pb-20 w-full font-mono">
      {/* Header */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#FFD166] text-black border-2 border-black shadow-[2px_2px_0px_black]">
              <TrendingUp size={20} />
            </span>
            <span className="font-black text-xs uppercase tracking-widest bg-black text-[#06D6A0] px-3 py-1 border-2 border-black">
              LIVE FIRESTORE TELEMETRY
            </span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Club Analytics
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-black/70 mt-2">
            Real-time aggregate data and metrics across all Swaang public pages and backstage portals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black text-[#06D6A0] px-4 py-2 border-2 border-black font-black text-xs uppercase">
          <span className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-pulse" />
          <span>Real-time Synced</span>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`${c.color} p-6 border-4 border-black shadow-[8px_8px_0px_black] flex flex-col justify-between group hover:-translate-y-1 transition-all relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase border border-white/20">
                  {c.badge}
                </span>
                <div className="p-2 bg-black text-white border-2 border-black">
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <p className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-2">
                  {loading ? "—" : c.val}
                </p>
                <h3 className="font-black uppercase text-xs tracking-wider mb-1">
                  {c.title}
                </h3>
                <p className="text-[10px] opacity-75 font-medium leading-tight">
                  {c.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
