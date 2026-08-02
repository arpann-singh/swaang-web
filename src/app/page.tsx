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

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-black uppercase tracking-tighter">Cleaning the Stage...</div>;

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#FFF9F0] relative overflow-hidden">
        
        {/* 🎭 SCATTERED THEATRE MASKS BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
          {/* Mask 1 */}
          <svg className="absolute top-[5%] left-[2%] w-16 h-16 -rotate-12" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
          {/* Mask 2 */}
          <svg className="absolute top-[25%] right-[5%] w-24 h-24 rotate-12" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
          {/* Mask 3 */}
          <svg className="absolute top-[45%] left-[8%] w-12 h-12 -rotate-45" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
          {/* Mask 4 */}
          <svg className="absolute top-[65%] right-[10%] w-20 h-20 rotate-45" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
          {/* Mask 5 */}
          <svg className="absolute top-[85%] left-[15%] w-16 h-16 -rotate-6" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
        </div>

        <div className="relative z-10">
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
        </div>
      </main>
    </PageTransition>
  );
}