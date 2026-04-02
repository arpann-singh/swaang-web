"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";

import Hero from "@/components/home/Hero";
import StageNotices from "@/components/home/StageNotices";
import FounderNote from "@/components/home/FounderNote";
import Spotlight from "@/components/home/Spotlight";
import Timeline from "@/components/home/Timeline";
import Productions from "@/components/home/Productions";
import Ensemble from "@/components/home/Ensemble";

export default function Home() {
  const [data, setData] = useState<any>({});
  const [aotm, setAotm] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]); 
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
    });

    onSnapshot(collection(db, "notices"), (s) => {
      const fetchedNotices = s.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedNotices.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)); 
      setNotices(fetchedNotices);
      setLoading(false); 
    });
  }, []);

  // 🔥 NEW: Calculate how many notices are currently "Live"
  const activeNoticesCount = notices.filter(n => n.isActive).length;

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-tighter">Cleaning the Stage...</div>;

  return (
    <PageTransition>
      <main className="min-h-screen">
        {/* 🔥 NEW: Pass the count to the Hero component */}
        <Hero data={data} activeNoticesCount={activeNoticesCount} />
        
        {/* 🔥 NEW: Added an ID so the Hero button can scroll directly to this spot! */}
        <div id="call-board">
          <StageNotices notices={notices} />
        </div>
        
        <FounderNote data={data} />
        <Spotlight aotm={aotm} />
        <Timeline timeline={timeline} />
        <Productions events={events} />
        <Ensemble team={team} />
      </main>
    </PageTransition>
  );
}
