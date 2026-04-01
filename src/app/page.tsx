"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [homeData, setHomeData] = useState<any>({ styles: {} });
  const [footerData, setFooterData] = useState<any>({});
  const [aotm, setAotm] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubHome = onSnapshot(doc(db, "settings", "homepage"), (d) => setHomeData(d.data() || {}));
    const unsubFooter = onSnapshot(doc(db, "settings", "footer"), (d) => setFooterData(d.data() || {}));
    const unsubAotm = onSnapshot(doc(db, "settings", "aotm"), (d) => setAotm(d.data()));
    onSnapshot(query(collection(db, "notices"), orderBy("createdAt", "desc")), (s) => setNotices(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(n => n.isActive)));
    onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), (s) => setEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(e => e.showOnHome)));
    onSnapshot(collection(db, "team"), (s) => setTeam(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(m => m.showOnHome)));
    onSnapshot(query(collection(db, "timeline"), orderBy("year", "asc")), (s) => {
      setTimeline(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const getStyle = (field: string, defaultSize: string) => ({
    fontSize: homeData.styles?.[field + 'Size'] || defaultSize,
    fontFamily: homeData.styles?.[field + 'Font'] === 'font-cinzel' ? '"Cinzel", serif' : 'inherit'
  });

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase">Loading Stage...</div>;

  return (
    <PageTransition>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-infinite { display: flex; width: max-content; animation: marquee 25s linear infinite; }
      `}</style>

      <main className="min-h-screen bg-[#FFF9F0] overflow-x-hidden">
        {/* TICKER */}
        {notices.length > 0 && (
          <div className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-4 border-[#2D2D2D] z-[1001] h-12 flex items-center overflow-hidden">
            <div className="animate-marquee-infinite">
              {[...notices, ...notices].map((n, i) => (
                <span key={i} className="text-white font-black uppercase text-[12px] px-12 border-r-2 border-white/20">{n.title}: {n.content}</span>
              ))}
            </div>
          </div>
        )}

        {/* HERO STAGE */}
        <section className="relative h-screen flex items-center justify-center border-b-[12px] border-[#2D2D2D]">
          <div className="absolute inset-0 bg-[#2D2D2D]">
             {homeData.headerVideoUrl && <video autoPlay muted loop className="w-full h-full object-cover opacity-50" src={homeData.headerVideoUrl} />}
          </div>
          <h1 style={getStyle('heroTitle', '8rem')} className="relative z-10 font-black text-white uppercase text-center leading-[0.8]">{homeData.headerTitle}</h1>
        </section>

        {/* FOUNDER'S NOTE */}
        <section className="py-32 px-6 bg-[#FFF9F0] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-[#FFD166] border-4 border-[#2D2D2D] translate-x-4 translate-y-4 rounded-[3rem] group-hover:translate-x-6 group-hover:translate-y-6 transition-transform" />
              <img src={homeData.founderImage} className="relative z-10 w-full aspect-[4/5] object-cover border-4 border-[#2D2D2D] rounded-[3rem] grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="w-full md:w-1/2">
              <span className="bg-[#FF5F5F] text-white px-4 py-2 rounded-full font-black uppercase text-sm mb-6 inline-block">The Director's Desk</span>
              <h2 className="font-cinzel text-7xl font-black uppercase mb-10 leading-tight">{homeData.founderName}</h2>
              <p className="text-2xl leading-relaxed italic font-medium opacity-80 select-none">"{homeData.founderNote}"</p>
            </div>
          </div>
        </section>

        {/* ARTIST OF THE MONTH */}
        {aotm && (
          <section className="py-32 px-6 bg-[#FFD166] border-b-[12px] border-[#2D2D2D]">
             <h2 className="text-center font-cinzel text-8xl font-black uppercase mb-20 tracking-tighter">Artist of the Month</h2>
             <div className="max-w-4xl mx-auto bg-white border-8 border-[#2D2D2D] p-10 rounded-[4rem] shadow-[20px_20px_0px_#2D2D2D] flex flex-col items-center">
                <img src={aotm.photo} className="w-full h-96 object-cover border-4 border-[#2D2D2D] rounded-[2rem] mb-8" />
                <h3 className="text-4xl font-black uppercase">{aotm.name}</h3>
                <p className="mt-4 text-center font-bold text-gray-600 italic">"{aotm.achievement}"</p>
             </div>
          </section>
        )}

        {/* THE JOURNEY */}
        <section id="journey" className="py-32 px-6 bg-[#06D6A0] border-b-[12px] border-[#2D2D2D]">
          <h2 className="font-cinzel text-7xl font-black uppercase text-center mb-24">The Journey</h2>
          <div className="max-w-4xl mx-auto space-y-12 relative before:absolute before:left-1/2 before:w-2 before:h-full before:bg-[#2D2D2D]">
            {timeline.map((m, i) => (
              <div key={m.id} onClick={() => setSelectedMilestone(m)} className={`relative cursor-pointer flex ${i % 2 === 0 ? 'flex-row-reverse' : ''} items-center gap-10`}>
                <div className="w-1/2 bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[10px_10px_0px_#2D2D2D] hover:-rotate-1 transition-transform">
                  <span className="bg-[#FF5F5F] text-white px-3 py-1 rounded font-black">{m.year}</span>
                  <h4 className="font-black text-2xl mt-2 uppercase">{m.event}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* THE ENSEMBLE */}
        <section className="py-32 px-6 bg-[#FF5F5F] border-b-[12px] border-[#2D2D2D]">
          <h2 className="text-center font-cinzel text-8xl font-black uppercase text-white mb-24 tracking-tighter">The Ensemble</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {team.map(m => (
              <div key={m.id} className="bg-white border-4 border-[#2D2D2D] p-4 rounded-3xl shadow-[8px_8px_0px_#2D2D2D] flex flex-col items-center">
                <img src={m.photo} className="w-full aspect-square object-cover rounded-2xl border-2 border-[#2D2D2D] mb-4" />
                <h4 className="font-black uppercase text-center text-sm">{m.name}</h4>
                <p className="text-[10px] font-bold opacity-50 uppercase">{m.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MODAL */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-[#2D2D2D]/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedMilestone(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#FFF9F0] border-8 border-[#2D2D2D] w-full max-w-4xl rounded-[3rem] p-10 relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedMilestone(null)} className="absolute top-5 right-10 text-4xl font-black">✕</button>
                <h2 className="text-4xl font-black uppercase mb-6">{selectedMilestone.event}</h2>
                <p className="text-xl italic mb-10">"{selectedMilestone.description}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <img src={selectedMilestone.photo1} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-2xl" />
                  <img src={selectedMilestone.photo2} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-2xl" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
