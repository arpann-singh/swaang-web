"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [homeData, setHomeData] = useState<any>({ styles: {} });
  const [aotm, setAotm] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onSnapshot(doc(db, "settings", "homepage"), (d) => setHomeData(d.data() || {}));
    onSnapshot(doc(db, "settings", "aotm"), (d) => setAotm(d.data()));
    onSnapshot(query(collection(db, "notices"), orderBy("createdAt", "desc")), (s) => 
      setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(n => n.isActive))
    );
    onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), (s) => 
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(e => e.showOnHome))
    );
    onSnapshot(collection(db, "team"), (s) => 
      setTeam(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(m => m.showOnHome))
    );
    onSnapshot(query(collection(db, "timeline"), orderBy("year", "asc")), (s) => {
      setTimeline(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-tighter">Syncing Stage...</div>;

  return (
    <PageTransition>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-infinite { display: flex; width: max-content; animation: marquee 25s linear infinite; white-space: nowrap; }
      `}</style>

      <main className="min-h-screen bg-[#FFF9F0] overflow-x-hidden pt-12">
        {/* TICKER */}
        {notices.length > 0 && (
          <div className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-4 border-[#2D2D2D] z-[2000] h-10 flex items-center overflow-hidden">
            <div className="animate-marquee-infinite">
              {[...notices, ...notices, ...notices].map((n, i) => (
                <div key={i} className="flex items-center px-10">
                   <span className="bg-white text-[#FF5F5F] px-2 py-0.5 rounded font-black text-[10px] mr-4">LATEST</span>
                   <span className="text-white font-black uppercase text-[12px]">{n.title}: {n.content}</span>
                   <span className="text-white/40 ml-10 font-black">!!!!!</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="relative h-[90vh] flex items-center justify-center border-b-[12px] border-[#2D2D2D]">
          <div className="absolute inset-0 bg-[#2D2D2D]">
             {homeData.headerVideoUrl && <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60" src={homeData.headerVideoUrl} />}
          </div>
          <div className="relative z-10 text-center">
            <h1 className="font-cinzel text-6xl md:text-9xl font-black text-white uppercase drop-shadow-[6px_6px_0px_#2D2D2D]">
              {homeData.headerTitle || "SWAANG"}
            </h1>
            <div className="mt-8 inline-block bg-[#06D6A0] border-4 border-[#2D2D2D] px-8 py-3 rounded-2xl shadow-[8px_8px_0px_#2D2D2D]">
               <p className="font-black uppercase tracking-widest text-lg md:text-2xl">A Drama Club of SSTC</p>
            </div>
          </div>
        </section>

        {/* FOUNDER'S NOTE */}
        <section className="py-32 px-6 bg-[#FFF9F0] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="w-full md:w-1/2 relative">
               <div className="absolute inset-0 bg-[#FF5F5F] border-4 border-[#2D2D2D] translate-x-4 translate-y-4 rounded-[3rem]" />
               <img src={homeData.founderImage} className="relative z-10 w-full aspect-[4/5] object-cover border-4 border-[#2D2D2D] rounded-[3rem]" />
            </div>
            <div className="w-full md:w-1/2">
               <div className="w-20 h-1 bg-[#FF5F5F] mb-6" />
               <p className="text-[#FF5F5F] font-black uppercase mb-4">The Stage Message</p>
               <h2 className="text-5xl md:text-8xl italic font-black mb-10 leading-none">"{homeData.founderNote}"</h2>
               <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter opacity-80">{homeData.founderName}</h3>
            </div>
          </div>
        </section>

        {/* THE SPOTLIGHT (AOTM) */}
        {aotm && (
          <section className="py-32 px-6 bg-[#FFD166] border-b-[12px] border-[#2D2D2D]">
            <h2 className="font-cinzel text-7xl md:text-9xl font-black uppercase mb-20">The Spotlight</h2>
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
               <div className="w-full md:w-1/2 relative">
                  <div className="absolute inset-0 bg-[#2D2D2D] translate-x-6 translate-y-6 rounded-[4rem]" />
                  <img src={aotm.photo} className="relative z-10 w-full aspect-square object-cover border-4 border-[#2D2D2D] rounded-[4rem]" />
               </div>
               <div className="w-full md:w-1/2 space-y-8">
                  <span className="bg-[#FF5F5F] text-white px-6 py-2 rounded-full font-black uppercase shadow-[4px_4px_0px_#2D2D2D]">Winner: March 2026</span>
                  <h3 className="text-6xl md:text-8xl font-black uppercase leading-none">{aotm.name}</h3>
                  <div className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#2D2D2D]">
                     <p className="text-2xl italic font-bold">"{aotm.achievement}"</p>
                  </div>
               </div>
            </div>
          </section>
        )}

        {/* THE JOURNEY */}
        <section className="py-32 px-6 bg-[#06D6A0] border-b-[12px] border-[#2D2D2D]">
          <h2 className="font-cinzel text-7xl md:text-9xl font-black uppercase text-center mb-32">The Journey</h2>
          <div className="max-w-5xl mx-auto relative before:absolute before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-full before:bg-[#2D2D2D]">
            {timeline.map((m, i) => (
              <div key={m.id} onClick={() => setSelectedMilestone(m)} className={`relative flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-24 cursor-pointer group`}>
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#2D2D2D] rounded-full z-10 group-hover:bg-[#FF5F5F] transition-colors" />
                <div className="w-[45%] bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[12px_12px_0px_#2D2D2D] group-hover:-translate-y-2 transition-transform">
                  <span className="bg-[#FF5F5F] text-white px-3 py-1 rounded font-black text-xs">{m.year}</span>
                  <h4 className="text-3xl font-black uppercase mt-4">{m.event}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THE PLAYBILL */}
        <section className="py-32 px-6 bg-white border-b-[12px] border-[#2D2D2D]">
           <h2 className="text-center font-cinzel text-7xl md:text-9xl font-black uppercase mb-32">The Playbill</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto">
             {events.map(e => (
               <div key={e.id} className="relative group">
                 <div className="absolute inset-0 bg-[#2D2D2D] translate-x-4 translate-y-4 rounded-[3rem]" />
                 <div className="relative z-10 bg-white border-4 border-[#2D2D2D] p-6 rounded-[3rem]">
                    <img src={e.image} className="w-full aspect-[4/5] object-cover rounded-[2rem] border-2 border-[#2D2D2D] mb-6" />
                    <h4 className="text-2xl font-black uppercase">{e.title}</h4>
                    <p className="text-xs font-bold text-[#FF5F5F] mt-1 uppercase">{e.date} • {e.status}</p>
                 </div>
               </div>
             ))}
           </div>
        </section>

        {/* THE ENSEMBLE */}
        <section className="py-32 px-6 bg-[#FFF9F0]">
           <h2 className="font-cinzel text-7xl md:text-9xl font-black uppercase mb-24">The Ensemble</h2>
           <div className="flex flex-wrap gap-16 max-w-7xl">
             {team.map(m => (
               <div key={m.id} className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-[#2D2D2D] translate-x-3 translate-y-3 rounded-full" />
                    <img src={m.photo} className="relative z-10 w-48 h-48 rounded-full border-4 border-[#2D2D2D] object-cover grayscale hover:grayscale-0 transition-all" />
                  </div>
                  <h4 className="font-black uppercase text-xl">{m.name}</h4>
                  <p className="text-xs font-bold uppercase text-[#FF5F5F]">{m.role}</p>
               </div>
             ))}
           </div>
        </section>
      </main>
    </PageTransition>
  );
}
