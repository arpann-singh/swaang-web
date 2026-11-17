"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Star, 
  Film, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  Clapperboard, 
  Calendar,
  Sparkles,
  ArrowRight,
  Maximize2
} from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [activeStory, setActiveStory] = useState<any | null>(null);

  // Category Icon & Badge Mapping
  const categoryMap: Record<string, { icon: any; badge: string; label: string }> = {
    milestone: { icon: Star, badge: "bg-[#FFD166] text-black", label: "MILESTONE" },
    play: { icon: Film, badge: "bg-[#FF5F5F] text-white", label: "PRODUCTION" },
    workshop: { icon: GraduationCap, badge: "bg-[#06D6A0] text-black", label: "WORKSHOP" },
    achievement: { icon: Award, badge: "bg-black text-[#06D6A0]", label: "ACCOLADE" },
  };

  // Lock scrolling when modal is open
  useEffect(() => {
    if (activeStory) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [activeStory]);

  // Sort chronologically descending
  const sortedEvents = useMemo(() => {
    return [...timeline].sort((a, b) => {
      const yearDiff = String(b.year || "").localeCompare(String(a.year || ""));
      if (yearDiff !== 0) return yearDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [timeline]);

  // Glimpse: Select 3 distinct key milestones (Latest, Mid, and Earliest/Founding)
  const glimpseEvents = useMemo(() => {
    if (sortedEvents.length <= 3) return sortedEvents;
    const first = sortedEvents[0]; // Latest (e.g. 2024)
    const mid = sortedEvents[Math.floor(sortedEvents.length / 2)]; // Mid-era milestone
    const last = sortedEvents[sortedEvents.length - 1]; // Founding / Earliest milestone
    return [first, mid, last];
  }, [sortedEvents]);

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-20 md:py-28 bg-[#FFF9F0] text-black relative border-b-8 border-black overflow-hidden selection:bg-[#FF5F5F] selection:text-white">
      
      {/* 🎭 THEATRICAL WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-[0.03] select-none pointer-events-none overflow-hidden -rotate-2 z-0">
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black">
          THE GLIMPSE // 10 YEARS OF SWAANG // CHRONOLOGY //
        </h1>
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-36">
          FROM THE STREETS OF BHILAI TO THE NATIONAL STAGE //
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ============================================================== */}
        {/* 🎬 SECTION HEADER                                              */}
        {/* ============================================================== */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#FFD166] text-black px-4 py-1.5 border-2 border-black font-mono font-black uppercase text-[11px] tracking-[0.3em] shadow-[3px_3px_0px_black] flex items-center gap-2">
                <Clapperboard size={14} className="text-[#FF5F5F]" />
                ACT // 02 • THE CHRONICLES
              </span>
              <span className="bg-black text-[#06D6A0] px-3 py-1 font-mono font-black text-[10px] uppercase tracking-wider hidden sm:inline-block">
                EST. 2014 // 10-YEAR ARCHIVE
              </span>
            </div>

            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">
              THE <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          <p className="md:max-w-xs font-mono font-bold text-xs md:text-sm leading-relaxed uppercase bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black] text-black">
            A GLIMPSE INTO A DECADE OF REVOLUTIONARY STREET THEATRE & PROSCENIUM TRIUMPHS.
          </p>
        </div>

        {/* ============================================================== */}
        {/* 📸 3-CARD GLIMPSE GRID (Compact Snapshot)                       */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {glimpseEvents.map((item, index) => {
            const cat = categoryMap[item.category] || categoryMap.milestone;
            const CatIcon = cat.icon;
            const photo = item.photo1 || item.photo2 || item.image || item.photo;

            return (
              <motion.div
                key={item.id || index}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                onClick={() => setActiveStory(item)}
                className="bg-white border-4 md:border-8 border-black p-5 md:p-6 shadow-[8px_8px_0px_black] hover:shadow-[14px_14px_0px_#FF5F5F] transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black font-mono">
                    <span className={`${cat.badge} px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_black] flex items-center gap-1`}>
                      <CatIcon size={11} strokeWidth={3} />
                      {cat.label}
                    </span>

                    <span className="bg-black text-[#FFD166] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      ACT // {item.year || "HISTORIC"}
                    </span>
                  </div>

                  {/* Archival Photo Window */}
                  <div className="relative aspect-[16/10] w-full bg-black border-2 border-black overflow-hidden mb-4 shadow-[3px_3px_0px_black]">
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.event || item.title}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1F1F1F] flex flex-col items-center justify-center p-4 text-center text-white relative">
                        <CatIcon size={32} className="text-[#FFD166] mb-2" />
                        <span className="font-mono font-black text-xs uppercase tracking-widest text-[#FFF9F0]">
                          {cat.label} ARCHIVE
                        </span>
                      </div>
                    )}

                    {item.date && (
                      <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider border border-white/40">
                        {item.date}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight line-clamp-2 mb-3 group-hover:text-[#FF5F5F] transition-colors">
                    {item.event || item.title || "Untitled Milestone"}
                  </h3>

                  {/* Description Excerpt */}
                  <p className="font-mono font-bold text-xs text-black/75 leading-relaxed uppercase line-clamp-2 mb-4 bg-[#FFF9F0] border border-black p-2.5">
                    {item.description || item.content || "Archival milestone preserved in the official Swaang historical registry."}
                  </p>
                </div>

                {/* Inspect Link */}
                <div className="pt-3 border-t-2 border-dashed border-black flex items-center justify-between font-mono text-xs">
                  <span className="text-[10px] font-black text-black/50 uppercase">
                    GLIMPSE #{index + 1}
                  </span>
                  <span className="font-black uppercase text-[11px] text-black group-hover:text-[#FF5F5F] flex items-center gap-1 group-hover:translate-x-1 transition-all">
                    <span>QUICK PEEK</span>
                    <ChevronRight size={14} strokeWidth={3} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 🏛️ PROMINENT GATEWAY BANNER TO THE FULL JOURNEY PAGE           */}
        {/* ============================================================== */}
        <div className="bg-black text-[#FFF9F0] border-4 md:border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_#06D6A0] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-2">
              <span className="bg-[#06D6A0] text-black px-3 py-0.5 font-mono font-black text-[10px] uppercase tracking-widest border border-black">
                MASTER CHRONICLES
              </span>
              <span className="font-mono text-xs text-white/60 uppercase tracking-widest">
                50+ PLAYS • 10 YEARS • 100+ STREET SQUARES
              </span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
              UNCOVER THE COMPLETE 10-YEAR ARCHIVE
            </h4>
            <p className="font-mono font-bold text-xs uppercase tracking-wider text-gray-300 mt-1 max-w-2xl">
              Every national championship trophy, rehearsal diary, playbill script, and street performance is cataloged in full depth on our dedicated journey page.
            </p>
          </div>

          <Link
            href="/journey"
            className="group w-full lg:w-auto inline-flex items-center justify-center gap-3 bg-[#FFD166] text-black border-4 border-black px-8 py-4 font-mono font-black uppercase text-xs md:text-sm tracking-widest shadow-[6px_6px_0px_white] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[8px_8px_0px_#06D6A0] active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <span>ENTER FULL JOURNEY ARCHIVE</span>
            <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 🖼️ ARCHIVAL DETAIL MODAL (Quick Peek Lightbox)                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStory(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFF9F0] w-full max-w-3xl max-h-[85vh] overflow-y-auto border-8 border-black shadow-[16px_16px_0px_#FF5F5F] relative z-10 text-black p-6 md:p-10"
            >
              <button
                onClick={() => setActiveStory(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white border-4 border-black flex items-center justify-center font-black text-xl hover:bg-[#FF5F5F] hover:text-white transition-colors shadow-[4px_4px_0px_black] z-30"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="text-left">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="bg-black text-[#06D6A0] border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
                    ACT // {activeStory.year || "ARCHIVE"}
                  </span>
                  {activeStory.date && (
                    <span className="bg-[#FFD166] text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
                      {activeStory.date}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 leading-tight">
                  {activeStory.event || activeStory.title}
                </h2>

                {/* Photo Preview */}
                {(activeStory.photo1 || activeStory.photo2 || activeStory.image || activeStory.photo) && (
                  <div className="border-4 border-black p-2 bg-white shadow-[6px_6px_0px_black] mb-6">
                    <img
                      src={activeStory.photo1 || activeStory.photo || activeStory.image || activeStory.photo2}
                      className="w-full aspect-video object-cover"
                      alt="Archive Negative"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="bg-white border-4 border-black p-5 md:p-6 shadow-[6px_6px_0px_black] mb-6">
                  <p className="font-mono font-bold text-sm leading-relaxed whitespace-pre-wrap text-black">
                    {activeStory.description || activeStory.content || "Archival milestone preserved in the official Swaang historical registry."}
                  </p>
                </div>

                {/* Modal Footer Call to Action */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t-4 border-black border-dashed">
                  <Link
                    href="/journey"
                    className="font-mono font-black text-xs uppercase tracking-widest text-[#FF5F5F] hover:text-black underline underline-offset-4 flex items-center gap-1.5"
                  >
                    <span>Explore Full 50+ Story Archive</span>
                    <ArrowRight size={14} />
                  </Link>

                  <button
                    onClick={() => setActiveStory(null)}
                    className="bg-black text-white border-2 border-black px-6 py-2.5 font-mono font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_black] hover:bg-[#FFD166] hover:text-black transition-colors"
                  >
                    [ CLOSE ]
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}