"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [homeData, setHomeData] = useState<any>({ styles: {} });
  const [notices, setNotices] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, "settings", "homepage"), (d) => setHomeData(d.data() || {}));
    onSnapshot(query(collection(db, "notices"), orderBy("createdAt", "desc")), (s) => 
      setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(n => n.isActive))
    );
    onSnapshot(query(collection(db, "timeline"), orderBy("year", "asc")), (s) => {
      setTimeline(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase">Syncing Stage...</div>;

  return (
    <PageTransition>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-infinite { 
          display: flex; 
          width: max-content; 
          animation: marquee 30s linear infinite; 
          white-space: nowrap; /* 👈 Fix for the irregular text wrapping */
        }
      `}</style>

      <main className="min-h-screen bg-[#FFF9F0] overflow-x-hidden pt-12 md:pt-16">
        {/* IMPROVED TICKER */}
        {notices.length > 0 && (
          <div className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-4 border-[#2D2D2D] z-[2000] h-10 md:h-12 flex items-center overflow-hidden">
            <div className="animate-marquee-infinite">
              {[...notices, ...notices, ...notices].map((n, i) => (
                <div key={i} className="flex items-center">
                  <span className="text-white font-black uppercase text-[10px] md:text-[12px] px-6 md:px-12 flex items-center">
                    <span className="bg-white text-[#FF5F5F] px-2 py-0.5 rounded mr-3 text-[8px] md:text-[10px]">LATEST</span>
                    {n.title}: {n.content}
                  </span>
                  <span className="text-white/30 text-xl font-black">!!!!!</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative h-[90vh] md:h-screen flex items-center justify-center border-b-[8px] md:border-b-[12px] border-[#2D2D2D] mt-8">
          <div className="absolute inset-0 bg-[#2D2D2D]">
             {homeData.headerVideoUrl && (
               <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60" src={homeData.headerVideoUrl} />
             )}
          </div>
          <div className="relative z-10 px-4 text-center">
            <h1 className="font-cinzel font-black text-white uppercase text-4xl md:text-8xl drop-shadow-[4px_4px_0px_#2D2D2D]">
              {homeData.headerTitle || "SWAANG"}
            </h1>
            <div className="mt-6 inline-block bg-[#06D6A0] border-4 border-[#2D2D2D] px-6 py-2 rounded-xl shadow-[6px_6px_0px_#2D2D2D]">
               <p className="font-black uppercase tracking-widest text-sm md:text-xl">A Drama Club of SSTC</p>
            </div>
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section id="journey" className="py-24 px-6 bg-[#06D6A0] border-b-[12px] border-[#2D2D2D]">
          <h2 className="font-cinzel text-5xl md:text-7xl font-black uppercase text-center mb-16">The Journey</h2>
          <div className="max-w-4xl mx-auto space-y-8 relative before:absolute before:left-1/2 before:-translate-x-1/2 before:w-1.5 before:h-full before:bg-[#2D2D2D]">
            {timeline.map((m, i) => (
              <div key={m.id} onClick={() => setSelectedMilestone(m)} className={`relative cursor-pointer flex ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center gap-6 md:gap-10`}>
                <div className="w-full md:w-1/2 bg-white border-4 border-[#2D2D2D] p-5 rounded-[1.5rem] shadow-[6px_6px_0px_#2D2D2D] transition-transform hover:scale-105 active:scale-95">
                  <span className="bg-[#FF5F5F] text-white px-2 py-1 rounded text-xs font-black">{m.year}</span>
                  <h4 className="font-black text-lg mt-2 uppercase">{m.event}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL REMAINS THE SAME... */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-[#2D2D2D]/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedMilestone(null)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#FFF9F0] border-4 md:border-8 border-[#2D2D2D] w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedMilestone(null)} className="absolute top-4 right-6 text-3xl font-black">✕</button>
                <h2 className="text-3xl md:text-5xl font-black uppercase mb-4 leading-none">{selectedMilestone.event}</h2>
                <p className="text-lg md:text-xl italic mb-8 border-l-4 border-[#FF5F5F] pl-4">"{selectedMilestone.description}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <img src={selectedMilestone.photo1 || "https://placehold.co/600x400?text=No+Photo+1"} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-xl shadow-[6px_6px_0px_#06D6A0]" />
                  <img src={selectedMilestone.photo2 || "https://placehold.co/600x400?text=No+Photo+2"} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-xl shadow-[6px_6px_0px_#FF5F5F]" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
