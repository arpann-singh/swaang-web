"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";

import Hero from "@/components/home/Hero";
import StageNotices from "@/components/home/StageNotices";
import FounderNote from "@/components/home/FounderNote";
import Spotlight from "@/components/home/Spotlight";
import FacultyBlueprint from "@/components/home/FacultyBlueprint";
import Timeline from "@/components/home/Timeline";
import Productions from "@/components/home/Productions";
import Ensemble from "@/components/home/Ensemble";

// 🔥 FIXED: Added the missing imports for your new interactive components
import TwisterMarquee from "@/components/home/TwisterMarquee";

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
      setTeam(s.docs.map(d => ({id: d.id, ...d.data()})).filter((m:any) => m.isSpotlight))
    );
    
    onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), (s) => {
      const fetchedEvents = s.docs.map(d => ({id: d.id, ...d.data()})).filter((e:any) => e.showOnHome);
      
      fetchedEvents.sort((a: any, b: any) => {
        if (a.isSpotlight && !b.isSpotlight) return -1;
        if (!a.isSpotlight && b.isSpotlight) return 1;
        return 0; 
      });
      
      setEvents(fetchedEvents);
    });
    
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

  const activeNoticesCount = notices.filter(n => n.isActive).length;

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-tighter">Cleaning the Stage...</div>;

  return (
    <PageTransition>
      <main className="min-h-screen">
        <Hero data={data} activeNoticesCount={activeNoticesCount} />
        
        <div id="call-board">
          <StageNotices notices={notices} />
        </div>
        
        <FacultyBlueprint />
        <FounderNote data={data} />
        <Spotlight aotm={aotm} />
        
        <Timeline timeline={timeline} />
        <Productions events={events} />
        <Ensemble team={team} />

        {/* 🔥 NEW INTERACTIVE ELEMENTS */}
        <TwisterMarquee />
      </main>
    </PageTransition>
  );
}