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
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Maximize2
} from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const INITIAL_LIMIT = 4;

  // Category Icon & Badge Mapping
  const categoryMap: Record<string, { icon: any; color: string; badge: string; shadow: string; label: string }> = {
    milestone: { 
      icon: Star, 
      color: "bg-[#FFD166] text-black", 
      badge: "bg-[#FFD166] text-black", 
      shadow: "shadow-[6px_6px_0px_#FFD166]",
      label: "MILESTONE" 
    },
    play: { 
      icon: Film, 
      color: "bg-[#FF5F5F] text-white", 
      badge: "bg-[#FF5F5F] text-white", 
      shadow: "shadow-[6px_6px_0px_#FF5F5F]",
      label: "PRODUCTION" 
    },
    workshop: { 
      icon: GraduationCap, 
      color: "bg-[#06D6A0] text-black", 
      badge: "bg-[#06D6A0] text-black", 
      shadow: "shadow-[6px_6px_0px_#06D6A0]",
      label: "WORKSHOP" 
    },
    achievement: { 
      icon: Award, 
      color: "bg-black text-[#06D6A0]", 
      badge: "bg-black text-[#06D6A0]", 
      shadow: "shadow-[6px_6px_0px_black]",
      label: "ACCOLADE" 
    },
  };

  // Lock scrolling when modal is open
  useEffect(() => {
    if (activeStory) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [activeStory]);

  // Extract all distinct years descending
  const years = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      if (item.year) set.add(String(item.year));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [timeline]);

  // Filter and sort items chronologically (descending)
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

  // Curated slice: If "ALL", default to INITIAL_LIMIT unless expanded
  const displayedEvents = useMemo(() => {
    if (selectedYear !== "ALL" || isExpanded) {
      return filteredEvents;
    }
    return filteredEvents.slice(0, INITIAL_LIMIT);
  }, [filteredEvents, selectedYear, isExpanded]);

  const hasMore = selectedYear === "ALL" && filteredEvents.length > INITIAL_LIMIT;

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-16 md:py-24 bg-[#FFF9F0] text-black relative border-b-8 border-black overflow-hidden selection:bg-[#FF5F5F] selection:text-white">
      
      {/* 🎭 THEATRICAL WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-28 opacity-[0.03] select-none pointer-events-none overflow-hidden -rotate-3 z-0">
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black">
          THE ROADMAP // 10 YEARS OF RESISTANCE // CHRONOLOGY //
        </h1>
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-40">
          NUKKAD TO NATIONAL THEATRE // 2014 - 2024 // SWAANG
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ============================================================== */}
        {/* 🎬 THEATRICAL HEADER & ERA FILTER STRIP                         */}
        {/* ============================================================== */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
          <div className="max-w-3xl">
            <span className="bg-[#FFD166] text-black px-4 py-1.5 border-2 border-black font-mono font-black uppercase text-xs tracking-[0.3em] shadow-[3px_3px_0px_black] inline-block mb-4">
              ACT // 02 • THE CHRONICLES
            </span>
            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-black leading-none">
              THE <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          <div className="md:max-w-xs space-y-3">
            <p className="font-mono font-bold text-xs md:text-sm leading-relaxed uppercase bg-white border-4 border-black p-3.5 shadow-[4px_4px_0px_black] text-black">
              10 YEARS OF STREET THEATRE, PROSCENIUM PLAYS & NATIONAL ACCOLADES.
            </p>
          </div>
        </div>

        {/* 🏷️ TACTILE ERA FILTER BUTTONS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 no-scrollbar">
          <span className="font-mono font-black text-xs uppercase tracking-widest text-black/70 mr-2 shrink-0">
            ERA:
          </span>

          <button
            onClick={() => {
              setSelectedYear("ALL");
              setIsExpanded(false);
            }}
            className={`px-4 py-2 font-mono font-black text-xs uppercase tracking-widest border-2 md:border-4 border-black transition-all shrink-0 ${
              selectedYear === "ALL"
                ? "bg-black text-[#06D6A0] shadow-[3px_3px_0px_black] -translate-y-0.5"
                : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
            }`}
          >
            HIGHLIGHTS ({timeline.length})
          </button>

          {years.map((yr) => {
            const count = timeline.filter((i) => String(i.year) === yr).length;
            const isSelected = selectedYear === yr;
            return (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-2 font-mono font-black text-xs uppercase tracking-widest border-2 md:border-4 border-black transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#FF5F5F] text-white shadow-[3px_3px_0px_black] -translate-y-0.5"
                    : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
                }`}
              >
                {yr} <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 🛣️ COMPACT VERTICAL ROADMAP SPIDER                             */}
        {/* ============================================================== */}
        <div className="relative">
          
          {/* CENTER TIMELINE SPINE (Desktop: center, Mobile: left aligned) */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-2.5 bg-black z-0 shadow-[2px_0px_0px_rgba(0,0,0,0.1)]" />

          {/* ROADMAP NODES */}
          <div className="space-y-10 md:space-y-14 relative z-10">
            {displayedEvents.map((item, index) => {
              const cat = categoryMap[item.category] || categoryMap.milestone;
              const CatIcon = cat.icon;
              const isEven = index % 2 === 0;
              const photo = item.photo1 || item.photo2 || item.image || item.photo;

              return (
                <div 
                  key={item.id || index}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-6 md:gap-12 pl-14 md:pl-0`}
                >
                  {/* 📍 CENTER ROADMAP STAMP NODE */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-3 z-20">
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: isEven ? 10 : -10 }}
                      transition={{ type: "spring", stiffness: 350, damping: 12 }}
                      className={`w-11 h-11 md:w-12 md:h-12 ${cat.badge} border-4 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_black] cursor-pointer`}
                      onClick={() => setActiveStory(item)}
                    >
                      <CatIcon size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  {/* 📋 COMPACT PLAYBILL CARD CONTENT */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -30 : 30, y: 15 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full md:w-[calc(50%-3rem)] group cursor-pointer"
                    onClick={() => setActiveStory(item)}
                  >
                    <div className="bg-white border-4 md:border-6 border-black p-5 md:p-6 shadow-[6px_6px_0px_black] group-hover:shadow-[12px_12px_0px_#FF5F5F] group-hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between">
                      
                      {/* Top Bar / Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
                        <span className={`${cat.badge} px-2.5 py-0.5 font-mono font-black text-[10px] uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_black]`}>
                          {cat.label}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.date && (
                            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-black bg-gray-100 px-2 py-0.5 border border-black">
                              {item.date}
                            </span>
                          )}
                          <span className="bg-black text-[#FFD166] px-2.5 py-0.5 font-mono font-black text-[10px] uppercase tracking-wider">
                            ACT // {item.year || "HISTORIC"}
                          </span>
                        </div>
                      </div>

                      {/* 📸 COMPACT ARCHIVAL PHOTO (max-h-48) */}
                      {photo && (
                        <div className="relative aspect-[16/9] max-h-48 w-full bg-black border-2 border-black overflow-hidden mb-4 shadow-[3px_3px_0px_black]">
                          <img
                            src={photo}
                            alt={item.event || item.title}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          />
                        </div>
                      )}

                      {/* Milestone Title */}
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-tight mb-3 group-hover:text-[#FF5F5F] transition-colors">
                        {item.event || item.title || "Untitled Milestone"}
                      </h3>

                      {/* Description Excerpt */}
                      <div className="relative pl-3 border-l-3 border-black mb-4">
                        <p className="font-mono font-bold text-xs text-black/75 leading-relaxed uppercase line-clamp-2">
                          {item.description || item.content || "Archival milestone preserved in the official Swaang historical registry."}
                        </p>
                      </div>

                      {/* Card Footer Action */}
                      <div className="pt-3 border-t-2 border-dashed border-black flex items-center justify-between font-mono">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/50">
                          #{String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="inline-flex items-center gap-1 font-black uppercase text-[11px] text-black group-hover:text-[#FF5F5F] group-hover:translate-x-1 transition-all">
                          <span>VIEW DETAILS</span>
                          <ChevronRight size={14} strokeWidth={3} />
                        </span>
                      </div>

                    </div>
                  </motion.div>

                  {/* EMPTY HALF ON DESKTOP */}
                  <div className="hidden md:block md:w-[calc(50%-3rem)]" />
                </div>
              );
            })}
          </div>

        </div>

        {/* ============================================================== */}
        {/* 🎛️ EXPAND / COLLAPSE BUTTON                                   */}
        {/* ============================================================== */}
        {hasMore && (
          <div className="mt-12 flex justify-center relative z-20">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-black text-[#FFD166] hover:bg-[#FF5F5F] hover:text-white border-4 border-black px-8 py-3.5 font-mono font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_black] hover:shadow-[8px_8px_0px_black] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} strokeWidth={3} />
                  <span>COLLAPSE TO TOP 4 HIGHLIGHTS</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} strokeWidth={3} />
                  <span>EXPAND ALL {filteredEvents.length} MILESTONES ({filteredEvents.length - INITIAL_LIMIT} MORE)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 🚀 BOTTOM SECTION CALL TO ACTION                               */}
        {/* ============================================================== */}
        <div className="mt-14 pt-8 border-t-8 border-black flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="font-mono font-bold text-xs uppercase tracking-wider text-black text-center sm:text-left">
            WANT TO EXPLORE EVERY SINGLE SCRIPT, CAST SHEET & TROPHY ARCHIVED SINCE 2014?
          </p>

          <Link
            href="/journey"
            className="group inline-flex items-center gap-3 bg-black text-[#FFD166] border-4 border-black px-6 py-3.5 font-mono font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_#FF5F5F] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[8px_8px_0px_black] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <span>FULL ARCHIVES REPOSITORY</span>
            <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

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
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
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
                  <span className="bg-black text-[#06D6A0] border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
                    ACT // {activeStory.year || "ARCHIVE"}
                  </span>
                  {activeStory.date && (
                    <span className="bg-[#FFD166] text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
                      {activeStory.date}
                    </span>
                  )}
                  {activeStory.category && (
                    <span className="bg-white text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
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