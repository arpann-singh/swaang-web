"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Star, Film, GraduationCap, Award, Camera, Clapperboard, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Category Icon & Color Mapping
  const categoryMap: Record<string, { icon: any; color: string; label: string }> = {
    milestone: { icon: Star, color: "bg-[#FFD166] text-black", label: "MILESTONE" },
    play: { icon: Film, color: "bg-[#FF5F5F] text-white", label: "PRODUCTION" },
    workshop: { icon: GraduationCap, color: "bg-[#06D6A0] text-black", label: "WORKSHOP" },
    achievement: { icon: Award, color: "bg-black text-[#06D6A0]", label: "ACCOLADE" },
  };

  // Lock scrolling when modal is open
  useEffect(() => {
    if (activeStory) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [activeStory]);

  // Extract all years in descending order
  const years = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      if (item.year) set.add(String(item.year));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [timeline]);

  // Filter and sort items
  const filteredEvents = useMemo(() => {
    let list = [...timeline];
    if (selectedYear !== "ALL") {
      list = list.filter((item) => String(item.year) === selectedYear);
    }
    return list.sort((a, b) => {
      const yearDiff = String(b.year || "").localeCompare(String(a.year || ""));
      if (yearDiff !== 0) return yearDiff;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [timeline, selectedYear]);

  // Horizontal Reel Scroll Handlers
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -460 : 460;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-24 md:py-32 bg-transparent text-black relative border-b-8 border-black overflow-hidden">
      
      {/* Background Watermark */}
      <div className="absolute inset-0 flex flex-col justify-center gap-16 opacity-[0.03] select-none pointer-events-none overflow-hidden -rotate-2">
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter">
          PRODUCTION REEL // 35MM NEGATIVES // ARCHIVES // PRODUCTION REEL
        </h1>
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter -ml-32">
          10 YEARS ON STAGE // 2014 - 2024 // 10 YEARS ON STAGE
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 🎬 THEATRICAL HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-black text-[#FFD166] px-4 py-1.5 border-2 border-black font-mono font-black uppercase text-[11px] tracking-[0.3em] shadow-[4px_4px_0px_#FF5F5F] flex items-center gap-2">
                <Clapperboard size={14} className="text-[#FF5F5F]" />
                ACT // 02 • THE PRODUCTION REEL
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black/60 hidden sm:inline-block">
                35MM CELLULOID CHRONOLOGY
              </span>
            </div>

            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-black">
              THE <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          {/* Reel Nav Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center font-black shadow-[4px_4px_0px_black] hover:bg-[#FFD166] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-y-1 active:shadow-none transition-all"
            >
              <ChevronLeft size={28} strokeWidth={3} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-14 h-14 bg-black text-white border-4 border-black flex items-center justify-center font-black shadow-[4px_4px_0px_#06D6A0] hover:bg-[#06D6A0] hover:text-black hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_black] active:translate-y-1 active:shadow-none transition-all"
            >
              <ChevronRight size={28} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* 🏷️ YEAR FILTER STRIP */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <span className="font-mono font-black text-xs uppercase tracking-widest text-black/60 mr-2 shrink-0">
            FILTER ERA:
          </span>

          <button
            onClick={() => setSelectedYear("ALL")}
            className={`px-5 py-2 font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-all shrink-0 ${
              selectedYear === "ALL"
                ? "bg-black text-[#06D6A0] shadow-[3px_3px_0px_black] -translate-y-0.5"
                : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
            }`}
          >
            ALL YEARS ({timeline.length})
          </button>

          {years.map((yr) => {
            const count = timeline.filter((i) => String(i.year) === yr).length;
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-2 font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#FF5F5F] text-white shadow-[3px_3px_0px_black] -translate-y-0.5"
                    : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
                }`}
              >
                {yr} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🎞️ THE 35MM CELLULOID FILMSTRIP REEL                           */}
      {/* ============================================================== */}
      <div className="w-full bg-[#161616] border-y-8 border-black py-4 relative shadow-[inset_0_8px_16px_rgba(0,0,0,0.6)]">
        
        {/* TOP SPROCKET HOLE STRIP */}
        <div className="w-full border-b-2 border-white/20 pb-3 mb-6 px-4 flex items-center justify-between overflow-hidden select-none">
          <div className="flex gap-4 md:gap-6 items-center whitespace-nowrap overflow-hidden">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-6 bg-[#FFF9F0] border border-black/40 rounded-sm shadow-inner shrink-0" />
                {i % 4 === 0 && (
                  <span className="font-mono font-bold text-[9px] uppercase tracking-[0.3em] text-[#FFF9F0]/60 shrink-0">
                    KODAK 400TX // 35MM SAFETY FILM
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 📼 HORIZONTAL FILM REEL (Scrollable / Draggable) */}
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto px-6 md:px-12 py-4 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {filteredEvents.map((item, index) => {
            const cat = categoryMap[item.category] || categoryMap.milestone;
            const CatIcon = cat.icon;
            const photo = item.photo1 || item.photo2 || item.image || item.photo;

            return (
              <motion.div
                key={item.id || index}
                whileHover={{ scale: 1.02, y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                style={{ scrollSnapAlign: "start" }}
                className="w-[320px] sm:w-[380px] md:w-[420px] shrink-0 bg-[#FFF9F0] border-4 md:border-8 border-black p-5 md:p-6 shadow-[10px_10px_0px_#FF5F5F] flex flex-col justify-between relative group cursor-pointer"
                onClick={() => setActiveStory(item)}
              >
                {/* Vintage Frame Counter Tag */}
                <div className="flex items-center justify-between pb-4 border-b-4 border-black mb-4 font-mono font-black text-xs uppercase tracking-wider">
                  <span className="bg-black text-white px-2.5 py-1 text-[10px]">
                    FRAME #{String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[#FF5F5F] flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#FF5F5F] animate-pulse" />
                    ACT // {item.year || "ARCHIVE"}
                  </span>
                </div>

                {/* 📸 35MM NEGATIVE / STILL PHOTO BOX */}
                <div className="relative aspect-[16/10] w-full bg-black border-4 border-black overflow-hidden mb-5 shadow-[4px_4px_0px_black] group-hover:shadow-[6px_6px_0px_black] transition-all">
                  {photo ? (
                    <img
                      src={photo}
                      alt={item.event || item.title}
                      className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#202020] flex flex-col items-center justify-center p-6 text-center text-white relative">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,rgba(255,255,255,0.04)_8px,rgba(255,255,255,0.04)_16px)]" />
                      <CatIcon size={36} className="text-[#FFD166] mb-2 relative z-10" />
                      <span className="font-mono font-black text-xs uppercase tracking-widest text-[#FFF9F0] relative z-10">
                        {cat.label} ARCHIVE
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mt-1 relative z-10">
                        NO NEGATIVE STILL ATTACHED
                      </span>
                    </div>
                  )}

                  {/* Category Pill Over Image */}
                  <div className={`absolute top-3 left-3 ${cat.color} border-2 border-black px-3 py-1 font-mono font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_black] flex items-center gap-1.5 z-10`}>
                    <CatIcon size={12} strokeWidth={3} />
                    {cat.label}
                  </div>

                  {/* Date badge */}
                  {item.date && (
                    <div className="absolute bottom-3 right-3 bg-black text-white px-2.5 py-1 font-mono font-bold text-[9px] uppercase tracking-wider border border-white/40 z-10">
                      {item.date}
                    </div>
                  )}
                </div>

                {/* 📝 METADATA & TITLE */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tight text-black leading-tight line-clamp-2 mb-3 group-hover:text-[#FF5F5F] transition-colors">
                      {item.event || item.title || "Untitled Milestone"}
                    </h3>

                    <p className="font-mono font-bold text-xs text-black/75 leading-relaxed line-clamp-3 mb-6 bg-white border-2 border-black p-3 shadow-[2px_2px_0px_black]">
                      {item.description || item.content || "Archival milestone preserved in the Swaang dramatic repository."}
                    </p>
                  </div>

                  {/* Frame Action Bar */}
                  <div className="pt-2 flex items-center justify-between border-t-2 border-black border-dashed">
                    <span className="font-mono font-black text-[10px] uppercase tracking-widest text-black/60">
                      ▶ 35MM NEGATIVE
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStory(item);
                      }}
                      className="bg-black text-[#FFD166] border-2 border-black px-3.5 py-1.5 font-mono font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_black] group-hover:bg-[#FFD166] group-hover:text-black group-hover:shadow-[3px_3px_0px_black] transition-all flex items-center gap-1.5"
                    >
                      <Camera size={12} />
                      INSPECT 🔍
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* BOTTOM SPROCKET HOLE STRIP */}
        <div className="w-full border-t-2 border-white/20 pt-3 mt-6 px-4 flex items-center justify-between overflow-hidden select-none">
          <div className="flex gap-4 md:gap-6 items-center whitespace-nowrap overflow-hidden">
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-4 h-6 bg-[#FFF9F0] border border-black/40 rounded-sm shadow-inner shrink-0" />
                <span className="font-mono font-black text-[10px] uppercase tracking-widest text-[#FFF9F0]/60 shrink-0">
                  ▶ {i + 1}A
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 🚀 BOTTOM CALL TO ACTION */}
      <div className="max-w-7xl mx-auto px-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="font-mono font-bold text-xs md:text-sm uppercase tracking-wider text-black text-center sm:text-left">
          EXPLORE OVER 10 YEARS OF STREET REVOLUTION, INTER-COLLEGIATE TROPHIES & STAGE PRODUCTIONS.
        </p>

        <Link
          href="/journey"
          className="group inline-flex items-center gap-3 bg-black text-[#06D6A0] border-4 border-black px-8 py-4 font-mono font-black uppercase text-xs md:text-sm tracking-widest shadow-[6px_6px_0px_#FF5F5F] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[8px_8px_0px_black] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all shrink-0"
        >
          <span>OPEN FULL ARCHIVES (50+ EVENTS)</span>
          <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 🖼️ ARCHIVAL DETAIL MODAL (Lightbox Inspection)                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveStory(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#FFF9F0] w-full max-w-4xl max-h-[88vh] overflow-y-auto border-8 border-black shadow-[16px_16px_0px_#FF5F5F] relative z-10 text-black p-6 md:p-10"
            >
              <button
                onClick={() => setActiveStory(null)}
                className="absolute top-6 right-6 w-12 h-12 bg-white border-4 border-black flex items-center justify-center font-black text-xl hover:bg-[#FF5F5F] hover:text-white transition-colors shadow-[4px_4px_0px_black] z-30"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="text-left">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="bg-black text-[#06D6A0] border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest">
                    ACT // {activeStory.year || "ARCHIVE"}
                  </span>
                  {activeStory.date && (
                    <span className="bg-[#FFD166] text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest">
                      {activeStory.date}
                    </span>
                  )}
                  {activeStory.category && (
                    <span className="bg-white text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest">
                      CATEGORY: {activeStory.category.toUpperCase()}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8 leading-tight">
                  {activeStory.event || activeStory.title}
                </h2>

                {/* Photos Grid */}
                {(activeStory.photo1 || activeStory.photo2 || activeStory.image || activeStory.photo) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {(activeStory.photo1 || activeStory.photo || activeStory.image) && (
                      <div className="border-4 border-black p-2 bg-white shadow-[6px_6px_0px_black]">
                        <img
                          src={activeStory.photo1 || activeStory.photo || activeStory.image}
                          className="w-full aspect-video object-cover"
                          alt="Archive Negative 1"
                        />
                      </div>
                    )}
                    {activeStory.photo2 && (
                      <div className="border-4 border-black p-2 bg-white shadow-[6px_6px_0px_black]">
                        <img
                          src={activeStory.photo2}
                          className="w-full aspect-video object-cover"
                          alt="Archive Negative 2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0px_black] mb-8">
                  <p className="font-mono font-bold text-sm md:text-base leading-relaxed whitespace-pre-wrap text-black">
                    {activeStory.description || activeStory.content || "Archival milestone preserved in the official Swaang historical registry."}
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t-4 border-black border-dashed">
                  <Link
                    href="/journey"
                    className="font-mono font-black text-xs uppercase tracking-widest text-black hover:text-[#FF5F5F] underline underline-offset-4"
                  >
                    View in Full Archive Directory ➔
                  </Link>

                  <button
                    onClick={() => setActiveStory(null)}
                    className="bg-black text-white border-2 border-black px-6 py-2.5 font-mono font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_black] hover:bg-[#FF5F5F] transition-colors"
                  >
                    [ CLOSE INSPECTION ]
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