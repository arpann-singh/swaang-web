"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Users,
  Ticket,
  Film,
  Mail,
  Calendar,
  Award,
  TrendingUp,
  Layers,
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
      badgeClass: "adm-badge-danger",
      iconWrap: "bg-adm-danger/12 text-adm-danger border-adm-danger/30",
      desc: "Total registered auditionees in the talent pool",
      badge: "TALENT",
    },
    {
      title: "Active Team & Crew",
      val: stats.crew,
      icon: Award,
      badgeClass: "adm-badge-success",
      iconWrap: "bg-adm-success/12 text-adm-success border-adm-success/30",
      desc: "Directory of actors, directors, writers & tech crew",
      badge: "ROSTER",
    },
    {
      title: "Stage Productions",
      val: stats.events,
      icon: Film,
      badgeClass: "adm-badge-accent",
      iconWrap: "bg-adm-accent/15 text-adm-accent-text border-adm-accent/35",
      desc: "Active repertoire & upcoming performances",
      badge: "MAINSTAGE",
    },
    {
      title: "Archive Titles",
      val: stats.archive,
      icon: Layers,
      badgeClass: "adm-badge-violet",
      iconWrap: "bg-adm-violet/12 text-adm-violet border-adm-violet/30",
      desc: "Past productions preserved in /archive",
      badge: "CATALOG",
    },
    {
      title: "Guest RSVPs",
      val: stats.rsvps,
      icon: Ticket,
      badgeClass: "adm-badge-success",
      iconWrap: "bg-adm-success/12 text-adm-success border-adm-success/30",
      desc: "Audience reservations & show guest list",
      badge: "AUDIENCE",
    },
    {
      title: "Inbox Inquiries",
      val: stats.messages,
      icon: Mail,
      badgeClass: "adm-badge-info",
      iconWrap: "bg-adm-info/12 text-adm-info border-adm-info/30",
      desc: "Contact messages & stage invitations",
      badge: "COMMS",
    },
    {
      title: "Timeline Milestones",
      val: stats.timeline,
      icon: Calendar,
      badgeClass: "adm-badge-accent",
      iconWrap: "bg-adm-accent/15 text-adm-accent-text border-adm-accent/35",
      desc: "10-year historical events in /journey",
      badge: "LEGACY",
    },
  ];

  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 text-left w-full">
      {/* Header */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">Live Firestore Telemetry</span>
          </div>
          <h1 className="adm-title">Club Analytics</h1>
          <p className="adm-muted mt-1">
            Real-time aggregate data and metrics across all Swaang public pages and backstage portals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="adm-badge adm-badge-neutral">
            Total Records: {loading ? "—" : totalRecords}
          </span>
          <span className="adm-badge adm-badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-adm-success animate-pulse" />
            <span>Real-time Synced</span>
          </span>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="adm-card p-5 flex flex-col justify-between gap-4 hover:border-adm-line-strong transition-all"
            >
              <div className="flex items-center justify-between">
                <span className={`adm-badge ${c.badgeClass}`}>{c.badge}</span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.iconWrap}`}>
                  <Icon size={18} />
                </div>
              </div>

              <div>
                <p className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-adm-fg leading-none mb-2">
                  {loading ? "—" : c.val}
                </p>
                <h3 className="adm-h3 mb-1">{c.title}</h3>
                <p className="adm-muted leading-snug">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
