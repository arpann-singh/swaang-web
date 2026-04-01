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
    
    const unsubNotices = onSnapshot(query(collection(db, "notices"), orderBy("createdAt", "desc")), (s) => {
      const all = s.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setNotices(all.filter(n => n.isActive === true));
    });

    const unsubEvents = onSnapshot(query(collection(db, "events"), orderBy("date", "desc")), (s) => {
      setEvents(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(e => e.showOnHome));
    });

    const unsubTeam = onSnapshot(collection(db, "team"), (s) => {
      setTeam(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).filter(m => m.showOnHome));
    });

    const unsubTimeline = onSnapshot(query(collection(db, "timeline"), orderBy("year", "asc")), (s) => {
      setTimeline(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubHome(); unsubFooter(); unsubAotm(); unsubNotices(); unsubEvents(); unsubTeam(); unsubTimeline(); };
  }, []);

  const getStyle = (field: string, defaultSize: string) => ({
    fontSize: homeData.styles?.[field + 'Size'] || defaultSize,
    fontFamily: homeData.styles?.[field + 'Font'] === 'font-cinzel' ? '"Cinzel", serif' : 'inherit'
  });

  if (loading) return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase text-[#2D2D2D]">Opening the Stage...</div>;

  return (
    <PageTransition>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee-infinite { display: flex; width: max-content; animation: marquee 25s linear infinite; }
        ${notices.length > 0 ? 'header, .fixed-nav, nav { transform: translateY(48px) !important; }' : ''}
      `}</style>

      <main className="min-h-screen bg-[#FFF9F0] overflow-x-hidden">
        
        {/* --- 📢 1. NOTICE TICKER --- */}
        {notices.length > 0 && (
          <div className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-4 border-[#2D2D2D] z-[1001] h-12 flex items-center overflow-hidden">
            <div className="animate-marquee-infinite">
              {[...notices, ...notices, ...notices].map((n, i) => (
                <span key={i} className="text-white font-black uppercase text-[12px] tracking-[0.2em] px-12 flex items-center gap-4">
                  <span className="bg-white text-[#FF5F5F] px-3 py-1 rounded font-black text-[10px]">LATEST</span> {n.title}: {n.content}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- 🎭 2. HERO STAGE --- */}
        <section className={`relative h-screen flex items-center justify-center overflow-hidden border-b-[12px] border-[#2D2D2D] ${notices.length > 0 ? 'mt-12' : ''}`}>
          <div className="absolute inset-0 z-0 bg-[#2D2D2D]">
            {homeData.headerVideoUrl ? (
              <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-50" src={homeData.headerVideoUrl} />
            ) : (
              <div className="w-full h-full bg-cover bg-center opacity-50" style={{ backgroundImage: `url(${homeData.headerImageUrl})` }} />
            )}
          </div>
          <div className="relative z-10 text-center px-6 max-w-6xl">
            <h1 style={getStyle('heroTitle', '10rem')} className="font-black text-white uppercase tracking-tighter leading-none drop-shadow-[12px_12px_0px_#2D2D2D]">
              {homeData.headerTitle || "SWAANG"}
            </h1>
            <div className="mt-8 inline-block bg-[#06D6A0] border-4 border-[#2D2D2D] px-8 py-3 rounded-2xl shadow-[8px_8px_0px_#2D2D2D]">
              <p style={getStyle('heroSub', '1.25rem')} className="text-[#2D2D2D] font-black uppercase tracking-[0.4em]">
                {homeData.headerSub || "The Dramatic Society"}
              </p>
            </div>
          </div>
        </section>

        {/* --- 🎙️ 3. FOUNDER'S NOTE --- */}
        <section className="relative py-32 px-6 bg-[#FFF9F0] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
            <div className="w-full md:w-1/3">
              <img src={homeData.founderPhoto || "https://placehold.co/600x800"} className="w-full aspect-[3/4] object-cover border-8 border-[#2D2D2D] rounded-[4rem] shadow-[25px_25px_0px_#FF5F5F]" />
            </div>
            <div className="w-full md:w-2/3 space-y-10">
              <h2 className="font-cinzel text-xl font-black uppercase text-[#FF5F5F] flex items-center gap-4"><span className="h-1 w-12 bg-[#FF5F5F]"></span> The Stage Message</h2>
              <h3 style={getStyle('founderNote', '4.5rem')} className="font-black italic text-[#2D2D2D] leading-tight">"{homeData.founderNote}"</h3>
              <p style={getStyle('founderName', '3rem')} className="font-black uppercase text-[#2D2D2D] tracking-tighter">{homeData.founderName}</p>
            </div>
          </div>
        </section>

        {/* --- 🏆 4. ARTIST OF THE MONTH --- */}
        <section className="relative py-32 px-6 bg-[#FFD166] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-cinzel text-5xl md:text-8xl font-black uppercase text-[#2D2D2D] mb-20 tracking-tighter">The Spotlight</h2>
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="w-full lg:w-1/2">
                <img src={aotm?.photo || "https://placehold.co/600x600"} className="w-full aspect-square object-cover border-8 border-[#2D2D2D] rounded-[4rem] shadow-[25px_25px_0px_#2D2D2D]" />
              </div>
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="inline-block bg-[#FF5F5F] text-white font-black uppercase px-8 py-3 rounded-full border-4 border-[#2D2D2D]">Winner: {aotm?.month}</div>
                <h3 className="font-cinzel text-7xl font-black uppercase text-[#2D2D2D] leading-none">{aotm?.name}</h3>
                <div className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3rem] shadow-[15px_15px_0px_#2D2D2D]">
                  <p className="font-bold italic text-2xl leading-relaxed text-[#2D2D2D]">"{aotm?.citation}"</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 📜 5. THE JOURNEY --- */}
        <section className="relative py-32 px-6 bg-[#06D6A0] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="font-cinzel text-5xl md:text-8xl font-black uppercase text-[#2D2D2D] mb-24 tracking-tighter">The Journey</h2>
            <div className="space-y-12 relative before:absolute before:left-[20px] md:before:left-1/2 before:w-2 before:h-full before:bg-[#2D2D2D] before:rounded-full">
              {timeline.map((m, i) => (
                <motion.div key={m.id} whileHover={{ scale: 1.05 }} onClick={() => setSelectedMilestone(m)} className={`relative cursor-pointer flex flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row-reverse' : ''} items-center gap-8 text-left`}>
                  <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 w-10 h-10 bg-white border-4 border-[#2D2D2D] rounded-full z-10 shadow-[4px_4px_0px_#2D2D2D]" />
                  <div className="w-full md:w-[45%] bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[12px_12px_0px_#2D2D2D] group hover:bg-[#FFD166] transition-all">
                    <span className="bg-[#FF5F5F] text-white px-4 py-1 rounded-lg border-2 border-[#2D2D2D] font-black text-sm">{m.year}</span>
                    <h4 className="font-black uppercase text-2xl mt-4 text-[#2D2D2D] tracking-tighter">{m.event}</h4>
                    <p className="text-[10px] font-black uppercase text-[#FF5F5F] mt-4 opacity-0 group-hover:opacity-100 transition-opacity">View Memories 🎞️</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 🎬 6. THE PLAYBILL --- */}
        <section className="relative py-32 px-6 bg-white border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="font-cinzel text-5xl md:text-8xl font-black uppercase text-[#2D2D2D] mb-20 tracking-tighter">The Playbill</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
              {events.map(ev => (
                <div key={ev.id} className="bg-[#FFF9F0] border-4 border-[#2D2D2D] p-8 rounded-[3rem] shadow-[15px_15px_0px_#2D2D2D]">
                  <img src={ev.image} className="w-full aspect-[4/5] object-cover rounded-[2rem] border-4 border-[#2D2D2D] mb-8 shadow-[8px_8px_0px_#2D2D2D]" />
                  <h3 className="font-black uppercase text-2xl mb-2 text-[#2D2D2D] tracking-tight">{ev.title}</h3>
                  <p className="text-[10px] font-black text-[#FF5F5F] uppercase tracking-widest">{ev.date} • {ev.status}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 👥 7. THE ENSEMBLE --- */}
        <section className="relative py-32 px-6 bg-[#FFF9F0] border-b-[12px] border-[#2D2D2D]">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-cinzel text-5xl md:text-7xl font-black uppercase text-[#2D2D2D] mb-20 tracking-tighter">The Ensemble</h2>
            <div className="flex flex-wrap justify-center lg:justify-start gap-12">
              {team.map(m => (
                <div key={m.id} className="text-center group w-40 md:w-56">
                  <img src={m.image} className="w-full aspect-square rounded-full border-4 border-[#2D2D2D] shadow-[10px_10px_0px_#06D6A0] object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <h4 className="font-black uppercase text-lg text-[#2D2D2D] tracking-tighter mt-4">{m.name}</h4>
                  <p className="text-[10px] font-black text-[#FF5F5F] uppercase tracking-[0.2em]">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- ✉️ 8. FOOTER --- */}
        <footer className="bg-[#2D2D2D] text-white py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-24">
            <div className="space-y-8">
              <h2 className="font-cinzel text-7xl font-black text-[#FF5F5F]">SWAANG</h2>
              <p className="font-bold text-gray-400 italic text-xl">"{homeData.headerDesc}"</p>
              <div className="flex gap-4">
                {['instagram', 'youtube', 'twitter', 'linkedin'].map(social => (
                  footerData?.[social] && (
                    <a key={social} href={footerData[social]} target="_blank" className="bg-white text-[#2D2D2D] w-12 h-12 flex items-center justify-center rounded-2xl border-4 border-white font-black uppercase text-[10px] hover:bg-[#FF5F5F] hover:text-white transition-all">{social.substring(0,2)}</a>
                  )
                ))}
              </div>
            </div>
            <div className="space-y-10">
              <h4 className="font-black uppercase tracking-widest text-[#FFD166] text-sm underline decoration-4 underline-offset-8">Headquarters</h4>
              <p className="font-bold text-xl">{footerData?.address}</p>
              <p className="font-black text-2xl text-[#06D6A0]">{footerData?.phone}</p>
            </div>
            <div className="bg-[#3D3D3D] p-10 rounded-[3rem] border-4 border-[#4D4D4D] flex flex-col justify-center text-center">
              <h4 className="font-black uppercase tracking-widest text-white text-sm mb-4">Join the Registry</h4>
              <button className="w-full bg-[#FF5F5F] py-4 rounded-2xl font-black uppercase shadow-[6px_6px_0px_#2D2D2D]">Subscribe</button>
            </div>
          </div>
        </footer>

        {/* --- THEATRICAL MODAL (POPUP) --- */}
        <AnimatePresence>
          {selectedMilestone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-[#2D2D2D]/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedMilestone(null)}>
              <motion.div initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 100 }} className="bg-[#FFF9F0] border-[8px] border-[#2D2D2D] w-full max-w-5xl rounded-[3rem] md:rounded-[5rem] shadow-[30px_30px_0px_#FF5F5F] relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setSelectedMilestone(null)} className="absolute top-8 right-8 text-4xl font-black z-50 hover:scale-125 transition-transform">✕</button>
                <div className="p-10 md:p-20 space-y-12">
                  <div className="text-center md:text-left">
                    <span className="bg-[#FF5F5F] text-white px-8 py-3 rounded-2xl border-4 border-[#2D2D2D] font-black uppercase text-2xl shadow-[6px_6px_0px_#2D2D2D]">{selectedMilestone.year}</span>
                    <h2 className="font-cinzel text-5xl md:text-7xl font-black uppercase mt-8 text-[#2D2D2D] tracking-tighter leading-none">{selectedMilestone.event}</h2>
                  </div>
                  <div className="bg-white border-4 border-[#2D2D2D] p-8 md:p-12 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D]">
                    <p className="text-xl md:text-3xl font-bold italic text-[#2D2D2D] leading-relaxed">"{selectedMilestone.description}"</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {selectedMilestone.photo1 && (
                      <div className="group relative">
                        <div className="absolute inset-0 bg-[#06D6A0] rounded-[2rem] translate-x-4 translate-y-4 -z-10 border-4 border-[#2D2D2D]" />
                        <img src={selectedMilestone.photo1} className="w-full aspect-[4/3] object-cover border-4 border-[#2D2D2D] rounded-[2rem] bg-gray-100 block" alt="Memory 1" />
                      </div>
                    )}
                    {selectedMilestone.photo2 && (
                      <div className="group relative">
                        <div className="absolute inset-0 bg-[#FFD166] rounded-[2rem] translate-x-4 translate-y-4 -z-10 border-4 border-[#2D2D2D]" />
                        <img src={selectedMilestone.photo2} className="w-full aspect-[4/3] object-cover border-4 border-[#2D2D2D] rounded-[2rem] bg-gray-100 block" alt="Memory 2" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </PageTransition>
  );
}
