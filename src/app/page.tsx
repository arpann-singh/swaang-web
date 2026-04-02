"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";

import Hero from "@/components/home/Hero";
import FounderNote from "@/components/home/FounderNote";
import Spotlight from "@/components/home/Spotlight";
import Timeline from "@/components/home/Timeline";
import Productions from "@/components/home/Productions";
import Ensemble from "@/components/home/Ensemble";
// ❌ REMOVED ConnectHub import

export default function Home() {
  const [data, setData] = useState<any>({});
  const [aotm, setAotm] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onSnapshot(doc(db, "settings", "homepage"), (d) => setData(d.data() || {}));
    onSnapshot(doc(db, "settings", "aotm"), (d) => setAotm(d.data()));
    onSnapshot(collection(db, "team"), (s) => 
      setTeam(s.docs.map(d => ({id: d.id, ...d.data()})).filter((m:any) => m.showOnHome))
    );
    onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), (s) => 
      setEvents(s.docs.map(d => ({id: d.id, ...d.data()})).filter((e:any) => e.showOnHome))
    );
    onSnapshot(query(collection(db, "timeline"), orderBy("year", "asc")), (s) => {
      setTimeline(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-tighter">Cleaning the Stage...</div>;

  return (
    <PageTransition>
      <main className="min-h-screen">
        <Hero data={data} />
        <FounderNote data={data} />
        <Spotlight aotm={aotm} />
        <Timeline timeline={timeline} />
        <Productions events={events} />
        <Ensemble team={team} />
        {/* ❌ REMOVED <ConnectHub data={data} /> */}
      </main>
    </PageTransition>
  );
}
