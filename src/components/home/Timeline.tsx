"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Star, 
  Film, 
  GraduationCap, 
  Award, 
  Camera, 
  ChevronRight, 
  Clapperboard, 
  Calendar,
  Maximize2,
  FolderOpen,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [activeStory, setActiveStory] = useState<any | null>(null); // For fullscreen lightbox modal

  // Category Icon & Badge Mapping
  const categoryMap: Record<string, { icon: any; color: string; badge: string; border: string; label: string }> = {
    milestone: { 
      icon: Star, 
      color: "text-[#FFD166]", 
      badge: "bg-[#FFD166] text-black", 
      border: "border-[#FFD166]",
      label: "MILESTONE" 
    },
    play: { 
      icon: Film, 
      color: "text-[#FF5F5F]", 
      badge: "bg-[#FF5F5F] text-white", 
      border: "border-[#FF5F5F]",
      label: "PRODUCTION" 
    },
    workshop: { 
      icon: GraduationCap, 
      color: "text-[#06D6A0]", 
      badge: "bg-[#06D6A0] text-black", 
      border: "border-[#06D6A0]",
      label: "WORKSHOP" 
    },
    achievement: { 
      icon: Award, 
      color: "text-[#06D6A0]", 
      badge: "bg-black text-[#06D6A0]", 
      border: "border-black",
      label: "ACCOLADE" 
    },
  };

  // Lock scrolling when lightbox modal is open
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

  // Filter items based on year
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

  // Selected event for the hero display (defaults to first in list)
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  useEffect(() => {
    if (filteredEvents.length > 0) {
      // If current selectedEventId not in filtered list, reset to first
      const exists = filteredEvents.some(e => (e.id || e.event) === selectedEventId);
      if (!exists) {
        setSelectedEventId(filteredEvents[0].id || filteredEvents[0].event || "0");
      }
    }
  }, [filteredEvents, selectedEventId]);

  const currentEvent = useMemo(() => {
    return filteredEvents.find(e => (e.id || e.event) === selectedEventId) || filteredEvents[0] || null;
  }, [filteredEvents, selectedEventId]);

  if (!timeline || timeline.length === 0) return null;

  const currentCat = currentEvent ? (categoryMap[currentEvent.category] || categoryMap.milestone) : categoryMap.milestone;
  const CurrentCatIcon = currentCat.icon;
  const currentPhoto = currentEvent ? (currentEvent.photo1 || currentEvent.photo2 || currentEvent.image || currentEvent.photo) : null;

  return (
    <section id="journey" className="py-20 md:py-28 bg-[#FFF9F0] text-black relative border-b-8 border-black overflow-hidden selection:bg-[#FF5F5F] selection:text-white">
      
      {/* 🏛️ BACKGROUND WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-[0.03] select-none pointer-events-none overflow-hidden -rotate-2 z-0">
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black">
          THE DOSSIER // 10-YEAR ARCHIVE // PRODUCTION CHRONICLES //
        </h1>
        <h1 className="text-[14vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-40">
          NUKKAD TO STAGE // SWAANG HISTORICAL REGISTRY //
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ============================================================== */}
        {/* 🎬 SECTION HEADER                                              */}
        {/* ============================================================== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b-8 border-black pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#FFD166] text-black px-4 py-1.5 border-2 border-black font-mono font-black uppercase text-[11px] tracking-[0.3em] shadow-[3px_3px_0px_black] flex items-center gap-2">
                <Clapperboard size={14} className="text-[#FF5F5F]" />
                ACT // 02 • THE CHRONICLES
              </span>
              <span className="bg-black text-[#06D6A0] px-3 py-1 font-mono font-black text-[10px] uppercase tracking-wider hidden sm:inline-block">
                10-YEAR HISTORICAL DOSSIER
              </span>
            </div>

            <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black">
              THE <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          <Link
            href="/journey"
            className="group inline-flex items-center gap-2 bg-black text-[#FFD166] border-4 border-black px-6 py-3 font-mono font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#FF5F5F] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[6px_6px_0px_black] active:translate-y-0.5 active:shadow-none transition-all self-start md:self-end"
          >
            <span>FULL ARCHIVES DIRECTORY</span>
            <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* ============================================================== */}
        {/* 🏷️ YEAR FILTER PILLS                                           */}
        {/* ============================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <span className="font-mono font-black text-xs uppercase tracking-widest text-black/60 mr-2 shrink-0">
            ERA:
          </span>

          <button
            onClick={() => setSelectedYear("ALL")}
            className={`px-4 py-2 font-mono font-black text-xs uppercase tracking-widest border-2 md:border-4 border-black transition-all shrink-0 ${
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
        {/* 🗂️ MASTER-DETAIL SPLIT-SCREEN DOSSIER                           */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================= */}
          {/* LEFT COLUMN: INTERACTIVE MILESTONE LIST   */}
          {/* ========================================= */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Header / Counter */}
            <div className="bg-black text-white px-4 py-3 border-4 border-black font-mono font-black text-xs uppercase tracking-widest flex items-center justify-between shadow-[4px_4px_0px_#FFD166] mb-3">
              <span className="flex items-center gap-2">
                <FolderOpen size={14} className="text-[#06D6A0]" />
                TIMELINE INDEX
              </span>
              <span className="text-[#FFD166]">
                {filteredEvents.length} RECORDS
              </span>
            </div>

            {/* Scrollable List Container (Fixed Height) */}
            <div className="max-h-[500px] md:max-h-[560px] overflow-y-auto pr-2 space-y-3 swaang-scrollbar">
              {filteredEvents.map((item, index) => {
                const isSelected = (item.id || item.event) === selectedEventId;
                const cat = categoryMap[item.category] || categoryMap.milestone;
                const CatIcon = cat.icon;

                return (
                  <button
                    key={item.id || index}
                    onClick={() => setSelectedEventId(item.id || item.event)}
                    className={`w-full text-left p-4 border-4 border-black font-mono transition-all flex items-center justify-between gap-3 group ${
                      isSelected
                        ? "bg-black text-white shadow-[6px_6px_0px_#FF5F5F] -translate-y-1"
                        : "bg-white text-black hover:bg-yellow-50 hover:shadow-[4px_4px_0px_black]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Node Icon */}
                      <div className={`w-8 h-8 ${isSelected ? "bg-[#FF5F5F] text-white" : cat.badge} border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_black]`}>
                        <CatIcon size={14} strokeWidth={2.5} />
                      </div>

                      {/* Title & Date */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-[#06D6A0]" : "text-black/60"}`}>
                            {item.year || "2014"}
                          </span>
                          {item.date && (
                            <span className="text-[9px] opacity-60 truncate">
                              • {item.date}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm md:text-base uppercase tracking-tight truncate leading-tight mt-0.5">
                          {item.event || item.title || "Untitled Milestone"}
                        </h4>
                      </div>
                    </div>

                    <ArrowRight 
                      size={18} 
                      className={`shrink-0 transition-transform ${isSelected ? "text-[#FFD166] translate-x-1" : "text-black/30 group-hover:text-black group-hover:translate-x-1"}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================= */}
          {/* RIGHT COLUMN: HERO SHOWCASE CARD          */}
          {/* ========================================= */}
          <div className="lg:col-span-7">
            {currentEvent ? (
              <motion.div
                key={currentEvent.id || currentEvent.event}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_black] flex flex-col justify-between relative"
              >
                {/* Top Badge Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black pb-4 mb-6 font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`${currentCat.badge} px-3.5 py-1 text-xs font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_black] flex items-center gap-1.5`}>
                      <CurrentCatIcon size={13} strokeWidth={3} />
                      {currentCat.label}
                    </span>
                    <span className="bg-black text-[#FFD166] px-3 py-1 text-xs font-black uppercase tracking-widest">
                      ACT // {currentEvent.year || "2014"}
                    </span>
                  </div>

                  {currentEvent.date && (
                    <span className="bg-[#FFF9F0] text-black border-2 border-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_black]">
                      {currentEvent.date}
                    </span>
                  )}
                </div>

                {/* Archival Visual Window */}
                <div className="relative aspect-[16/9] w-full bg-black border-4 border-black overflow-hidden mb-6 shadow-[6px_6px_0px_black] group">
                  {currentPhoto ? (
                    <>
                      <img
                        src={currentPhoto}
                        alt={currentEvent.event || currentEvent.title}
                        className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center text-white relative">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
                      <CurrentCatIcon size={44} className="text-[#FFD166] mb-3 relative z-10" />
                      <span className="font-mono font-black text-sm uppercase tracking-widest text-[#FFF9F0] relative z-10">
                        {currentCat.label} ARCHIVE RECORD
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 mt-1 relative z-10">
                        HISTORICAL DATA ENTRY
                      </span>
                    </div>
                  )}

                  {/* Quick Inspect Button on Photo */}
                  <button
                    onClick={() => setActiveStory(currentEvent)}
                    className="absolute bottom-3 right-3 bg-black/90 text-[#FFD166] hover:bg-[#FF5F5F] hover:text-white border-2 border-white px-3.5 py-1.5 font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_black] transition-all flex items-center gap-1.5"
                  >
                    <Maximize2 size={13} />
                    FULLSCREEN 🔍
                  </button>
                </div>

                {/* Event Heading */}
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-black leading-tight mb-4">
                  {currentEvent.event || currentEvent.title || "Untitled Milestone"}
                </h3>

                {/* Narrative / Excerpt */}
                <div className="relative pl-4 border-l-4 border-[#06D6A0] mb-6">
                  <p className="font-mono font-bold text-xs sm:text-sm leading-relaxed text-black/85 uppercase">
                    {currentEvent.description || currentEvent.content || "Archival milestone preserved in the official Swaang historical registry."}
                  </p>
                </div>

                {/* Action Bar */}
                <div className="pt-4 border-t-4 border-black border-dashed flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono">
                  <span className="text-xs font-black uppercase tracking-widest text-black/60">
                    SWAANG ARCHIVE REF: #{currentEvent.year || "2014"}
                  </span>

                  <button
                    onClick={() => setActiveStory(currentEvent)}
                    className="bg-black text-white hover:bg-[#FFD166] hover:text-black border-2 border-black px-6 py-3 font-mono font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_black] hover:shadow-[6px_6px_0px_black] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Camera size={14} />
                    <span>INSPECT FULL STORY</span>
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white border-8 border-black p-12 text-center font-mono font-black uppercase">
                Select an event from the timeline index.
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 🖼️ ARCHIVAL FULLSCREEN MODAL                                   */}
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