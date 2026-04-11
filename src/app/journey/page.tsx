"use client";
import { useState, useMemo, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calendar, Info, X, Camera } from "lucide-react";
import Link from "next/link";

export default function FullJourneyArchive() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null); // 🔥 NEW: Modal State

  useEffect(() => {
    const q = query(collection(db, "timeline"), orderBy("year", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Lock scroll when viewing memory
  useEffect(() => {
    if (selectedMemory) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [selectedMemory]);

  const groupedByYear = useMemo(() => {
    return events.reduce((acc: any, ev) => {
      const yr = ev.year || "Archive";
      if (!acc[yr]) acc[yr] = [];
      acc[yr].push(ev);
      return acc;
    }, {});
  }, [events]);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest italic">
      Unlocking Swaang Archives...
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FFF9F0] pt-32 pb-20 px-6 text-[#2D2D2D]">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center gap-2 font-black uppercase text-xs hover:text-[#FF5F5F] transition-all">
            <ArrowLeft size={16} /> Back to Stage
          </Link>
          <div className="flex items-center gap-2 opacity-30 font-black uppercase text-[10px] tracking-widest">
            <Calendar size={14} /> BHILAI, CG
          </div>
        </div>

        <div className="mb-20 text-left">
          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic leading-none">
            FULL <span className="text-[#FF5F5F]">ARCHIVE</span>
          </h1>
          <p className="mt-6 font-bold uppercase tracking-[0.3em] opacity-40 max-w-xl">
            A complete record of every performance, milestone, and creative breakthrough.
          </p>
        </div>

        {/* 🏛️ The Archive Grid */}
        {Object.keys(groupedByYear).sort((a,b) => b.localeCompare(a)).map((year) => (
          <section key={year} className="mb-24 relative text-left">
            <div className="absolute -top-10 -left-10 text-[180px] font-black opacity-[0.03] select-none pointer-events-none italic">
              {year}
            </div>

            <div className="flex items-center gap-6 mb-10 relative z-10">
              <h2 className="text-5xl font-black uppercase tracking-tighter bg-[#FFD166] px-6 py-2 rounded-2xl border-4 border-[#2D2D2D] shadow-[6px_6px_0px_#2D2D2D]">
                {year}
              </h2>
              <div className="flex-1 h-1 bg-black/5" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {groupedByYear[year].map((ev: any) => (
                <motion.div 
                  key={ev.id}
                  whileHover={{ y: -10 }}
                  className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[8px_8px_0px_#2D2D2D] flex flex-col justify-between group"
                >
                  <div className="text-left">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-lg border-2 border-black/5">
                         {ev.date || ev.year}
                       </span>
                       <Info size={16} className="opacity-10 group-hover:opacity-100" />
                    </div>
                    <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-[#FF5F5F] transition-colors">
                      {ev.event || ev.title}
                    </h3>
                    <p className="text-xs font-bold opacity-60 leading-relaxed mb-8">
                      {ev.description || ev.content || "Legacy event preserved in archives."}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* 🔥 FIXED: Button now triggers the modal */}
                    <button 
                      onClick={() => setSelectedMemory(ev)}
                      className="flex-1 bg-[#2D2D2D] text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_#FFD166] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <Camera size={14} /> View Memory
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 🖼️ MEMORY LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#FFF9F0] w-full max-w-4xl max-h-[90vh] overflow-y-auto border-8 border-[#2D2D2D] rounded-[3rem] shadow-[20px_20px_0px_#FF5F5F] relative z-10 p-8 md:p-12 text-left"
            >
              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white border-4 border-[#2D2D2D] rounded-full flex items-center justify-center font-black hover:bg-[#FF5F5F] hover:text-white transition-all shadow-[4px_4px_0px_#2D2D2D] active:translate-y-1 active:shadow-none"
              > <X size={24} /> </button>

              <span className="inline-block bg-[#06D6A0] text-black border-4 border-[#2D2D2D] px-6 py-2 font-black text-xs uppercase tracking-widest rounded-full mb-8 shadow-[4px_4px_0px_#2D2D2D]">
                Memory: {selectedMemory.year}
              </span>

              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-none">
                {selectedMemory.event || selectedMemory.title}
              </h2>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {selectedMemory.photo1 ? (
                  <img src={selectedMemory.photo1} className="w-full aspect-video object-cover rounded-[2rem] border-4 border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D]" alt="Memory 1" />
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-[2rem] border-4 border-dashed border-black/10 flex items-center justify-center font-black uppercase opacity-20">No Primary Visual</div>
                )}
                {selectedMemory.photo2 ? (
                  <img src={selectedMemory.photo2} className="w-full aspect-video object-cover rounded-[2rem] border-4 border-[#2D2D2D] shadow-[8px_8px_0px_#2D2D2D]" alt="Memory 2" />
                ) : (
                   <div className="aspect-video bg-gray-200 rounded-[2rem] border-4 border-dashed border-black/10 flex items-center justify-center font-black uppercase opacity-20">No Secondary Visual</div>
                )}
              </div>

              <div className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2rem] shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                <p className="font-bold text-base md:text-lg leading-relaxed whitespace-pre-wrap opacity-80">
                  {selectedMemory.description || selectedMemory.content || "Archival data for this milestone is currently being curated."}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-20 pt-10 border-t-4 border-[#2D2D2D]/5 text-center opacity-20">
        <p className="font-black uppercase text-[10px] tracking-widest">Swaang Digital Archives • Bhilai</p>
      </footer>
    </main>
  );
}