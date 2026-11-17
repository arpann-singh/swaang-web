"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Star, 
  Film, 
  GraduationCap, 
  Award, 
  Camera, 
  Clapperboard, 
  Play, 
  Pause, 
  Sparkles,
  Sliders,
  Maximize2
} from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Category Icon & Color Mapping
  const categoryMap: Record<string, { icon: any; color: string; bgBadge: string; label: string }> = {
    milestone: { icon: Star, color: "text-[#FFD166]", bgBadge: "bg-[#FFD166] text-black", label: "MILESTONE" },
    play: { icon: Film, color: "text-[#FF5F5F]", bgBadge: "bg-[#FF5F5F] text-white", label: "PRODUCTION" },
    workshop: { icon: GraduationCap, color: "text-[#06D6A0]", bgBadge: "bg-[#06D6A0] text-black", label: "WORKSHOP" },
    achievement: { icon: Award, color: "text-[#06D6A0]", bgBadge: "bg-black text-[#06D6A0]", label: "ACCOLADE" },
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

  // Scroll handler with index update
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 440;
      const offset = direction === "left" ? -cardWidth : cardWidth;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Jump to specific index or year
  const jumpToYear = (year: string) => {
    setSelectedYear(year);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  // Auto-play cinema reel
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 50) {
            scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scrollContainerRef.current.scrollBy({ left: 440, behavior: "smooth" });
          }
        }
      }, 3500);
    } else if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
    }

    return () => {
      if (autoPlayIntervalRef.current) clearInterval(autoPlayIntervalRef.current);
    };
  }, [isAutoPlaying]);

  // Track current frame index on scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const approxIndex = Math.round(scrollLeft / 440) + 1;
      setCurrentFrameIndex(Math.min(Math.max(approxIndex, 1), filteredEvents.length || 1));
    }
  };

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-24 md:py-36 bg-[#FFF9F0] text-black relative border-b-8 border-black overflow-hidden selection:bg-[#FF5F5F] selection:text-white">
      
      {/* 🏛️ BACKGROUND THEATRE WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-20 opacity-[0.03] select-none pointer-events-none overflow-hidden -rotate-3 z-0">
        <h1 className="text-[16vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black">
          CELLULOID REEL // 35MM NEGATIVES // PRODUCTION TIMELINE //
        </h1>
        <h1 className="text-[16vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-48">
          A DECADE OF NUKKAD & THEATRE // 2014 - 2024 // SWAANG
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* ============================================================== */}
        {/* 🎬 THEATRICAL HEADER & CINEMA PROJECTOR HUD                     */}
        {/* ============================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-black text-[#FFD166] px-4 py-1.5 border-2 border-black font-mono font-black uppercase text-[11px] tracking-[0.3em] shadow-[4px_4px_0px_#FF5F5F] flex items-center gap-2">
                <Clapperboard size={14} className="text-[#FF5F5F]" />
                ACT // 02 • THE PRODUCTION REEL
              </span>
              <span className="bg-[#06D6A0] text-black border-2 border-black px-3 py-1 font-mono font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_black]">
                EST. 2014 • 10-YEAR ARCHIVE
              </span>
            </div>

            <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85] text-black">
              THE <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          {/* 🎛️ CINEMA PROJECTOR CONTROL HUD */}
          <div className="bg-black text-[#FFF9F0] border-4 border-black p-4 md:p-5 shadow-[8px_8px_0px_#FF5F5F] flex flex-wrap items-center gap-4 lg:gap-6 font-mono">
            
            {/* Timecode & Frame Indicator */}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#06D6A0] font-black">
                PROJECTOR_FEED // LIVE
              </span>
              <div className="flex items-center gap-2 text-xs md:text-sm font-black tracking-widest text-white">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF5F5F] animate-pulse" />
                FRAME [{String(currentFrameIndex).padStart(2, "0")} / {String(filteredEvents.length).padStart(2, "0")}]
              </div>
            </div>

            <div className="w-[2px] h-10 bg-white/20 hidden sm:block" />

            {/* Auto-Play Toggle */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-4 py-2.5 border-2 border-black font-black uppercase text-xs tracking-wider flex items-center gap-2 transition-all shadow-[2px_2px_0px_white] active:translate-y-0.5 active:shadow-none ${
                isAutoPlaying 
                  ? "bg-[#FF5F5F] text-white" 
                  : "bg-[#FFD166] text-black hover:bg-yellow-400"
              }`}
            >
              {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isAutoPlaying ? "PAUSE REEL" : "PLAY REEL"}</span>
            </button>

            {/* Advance Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                aria-label="Previous Frame"
                className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center font-black hover:bg-[#FFD166] active:translate-y-0.5 transition-all shadow-[2px_2px_0px_white]"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Next Frame"
                className="w-10 h-10 bg-white text-black border-2 border-black flex items-center justify-center font-black hover:bg-[#06D6A0] active:translate-y-0.5 transition-all shadow-[2px_2px_0px_white]"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 🏷️ TACTILE YEAR SCRUBBER STRIP                                 */}
        {/* ============================================================== */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="font-mono font-black text-xs uppercase tracking-widest text-black/70 mr-2 shrink-0">
              ERA DIAL:
            </span>

            <button
              onClick={() => setSelectedYear("ALL")}
              className={`px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-all shrink-0 ${
                selectedYear === "ALL"
                  ? "bg-black text-[#06D6A0] shadow-[3px_3px_0px_black] -translate-y-0.5"
                  : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
              }`}
            >
              ALL ERAS ({timeline.length})
            </button>

            {years.map((yr) => {
              const count = timeline.filter((i) => String(i.year) === yr).length;
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => jumpToYear(yr)}
                  className={`px-3.5 py-1.5 font-mono font-black text-xs uppercase tracking-widest border-2 border-black transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#FF5F5F] text-white shadow-[3px_3px_0px_black] -translate-y-0.5"
                      : "bg-white text-black hover:bg-gray-100 shadow-[2px_2px_0px_black]"
                  }`}
                >
                  {yr} <span className="opacity-60 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="font-mono text-[11px] font-black uppercase tracking-widest text-black/60 hidden md:block">
            DRAG OR ARROW KEYS TO SCRUB REEL ➔
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 🎞️ MASTER 35MM CELLULOID LIGHTBOX EDITING TABLE                */}
      {/* ============================================================== */}
      <div className="w-full bg-[#111111] border-y-8 border-black py-6 relative shadow-[inset_0_12px_24px_rgba(0,0,0,0.8)]">
        
        {/* Subtle Lightbox Acrylic Measuring Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px"
          }}
        />

        {/* 🎬 TOP PERFORATED FILM SPROCKET STRIP */}
        <div className="w-full border-b-2 border-white/20 pb-4 mb-6 px-4 flex items-center justify-between overflow-hidden select-none relative z-10">
          <div className="flex gap-4 md:gap-8 items-center whitespace-nowrap overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="w-4 h-6 bg-[#EBE5D8] border-2 border-black rounded-[3px] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] shrink-0" />
                {i % 3 === 0 && (
                  <span className="font-mono font-bold text-[9px] uppercase tracking-[0.35em] text-[#FFD166]/70 shrink-0">
                    EASTMAN 5222 • 35MM PANCHROMATIC • EMULSION #{2014 + (i % 11)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 📼 HORIZONTAL FILM REEL (Scrollable / Draggable Cards) */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-10 overflow-x-auto px-6 md:px-16 py-6 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing relative z-10"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {filteredEvents.map((item, index) => {
            const cat = categoryMap[item.category] || categoryMap.milestone;
            const CatIcon = cat.icon;
            const photo = item.photo1 || item.photo2 || item.image || item.photo;

            return (
              <motion.div
                key={item.id || index}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                style={{ scrollSnapAlign: "center" }}
                onClick={() => setActiveStory(item)}
                className="w-[330px] sm:w-[400px] md:w-[440px] shrink-0 bg-[#FFF9F0] border-4 md:border-8 border-black p-6 md:p-7 shadow-[12px_12px_0px_#FF5F5F] flex flex-col justify-between relative group cursor-pointer"
              >
                {/* 📌 SLIDE MOUNT HEADER BAR */}
                <div className="flex items-center justify-between pb-4 border-b-4 border-black mb-5 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                    <span className="bg-black text-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">
                      EXPOSURE #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <span className="bg-[#FFD166] text-black border-2 border-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_black]">
                    ACT // {item.year || "LEGACY"}
                  </span>
                </div>

                {/* 📸 35MM NEGATIVE / STILL PHOTO APERTURE */}
                <div className="relative aspect-[16/11] w-full bg-black border-4 border-black overflow-hidden mb-5 shadow-[6px_6px_0px_black] group-hover:shadow-[8px_8px_0px_#06D6A0] transition-all">
                  {photo ? (
                    <>
                      <img
                        src={photo}
                        alt={item.event || item.title}
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
                      />
                      {/* Film Grain & Scanline Overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 group-hover:opacity-10 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-[#1E1E1E] flex flex-col items-center justify-center p-6 text-center text-white relative">
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
                      <CatIcon size={40} className="text-[#FFD166] mb-3 relative z-10" />
                      <span className="font-mono font-black text-xs uppercase tracking-widest text-[#FFF9F0] relative z-10">
                        {cat.label} ARCHIVE
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-gray-400 mt-1 relative z-10">
                        RAW ARCHIVAL NEGATIVE
                      </span>
                    </div>
                  )}

                  {/* Floating Category Badge */}
                  <div className={`absolute top-3 left-3 ${cat.bgBadge} border-2 border-black px-3 py-1 font-mono font-black text-[9px] uppercase tracking-widest shadow-[3px_3px_0px_black] flex items-center gap-1.5 z-20 group-hover:scale-105 transition-transform`}>
                    <CatIcon size={12} strokeWidth={3} />
                    {cat.label}
                  </div>

                  {/* Date Tag */}
                  {item.date && (
                    <div className="absolute bottom-3 right-3 bg-black text-[#06D6A0] px-3 py-1 font-mono font-black text-[9px] uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_white] z-20">
                      {item.date}
                    </div>
                  )}

                  {/* Hover Inspect Loupe Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30 pointer-events-none">
                    <span className="bg-[#FFD166] text-black border-2 border-black px-4 py-2 font-mono font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_black] transform translate-y-2 group-hover:translate-y-0 transition-transform flex items-center gap-2">
                      <Camera size={14} /> INSPECT NEGATIVE
                    </span>
                  </div>
                </div>

                {/* 📝 STORY & DIRECTOR NOTE */}
                <div className="flex-1 flex flex-col justify-between text-left">
                  <div>
                    <h3 className="font-black text-2xl md:text-3xl uppercase tracking-tight text-black leading-tight line-clamp-2 mb-3 group-hover:text-[#FF5F5F] transition-colors">
                      {item.event || item.title || "Untitled Milestone"}
                    </h3>

                    <div className="relative pl-3 border-l-4 border-black mb-5">
                      <p className="font-mono font-bold text-xs text-black/80 leading-relaxed line-clamp-3 uppercase">
                        {item.description || item.content || "Archival milestone preserved in the official Swaang historical registry."}
                      </p>
                    </div>
                  </div>

                  {/* Slide Mount Footer Action Bar */}
                  <div className="pt-3 flex items-center justify-between border-t-2 border-black border-dashed font-mono">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/50">
                      REF: SW-{item.year || "2014"}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStory(item);
                      }}
                      className="bg-black text-white border-2 border-black px-3.5 py-1.5 font-mono font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_black] group-hover:bg-[#06D6A0] group-hover:text-black group-hover:shadow-[3px_3px_0px_black] transition-all flex items-center gap-1.5"
                    >
                      <Maximize2 size={11} />
                      VIEW STORY
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 🎬 BOTTOM PERFORATED FILM SPROCKET STRIP */}
        <div className="w-full border-t-2 border-white/20 pt-4 mt-6 px-4 flex items-center justify-between overflow-hidden select-none relative z-10">
          <div className="flex gap-4 md:gap-8 items-center whitespace-nowrap overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="w-4 h-6 bg-[#EBE5D8] border-2 border-black rounded-[3px] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)] shrink-0" />
                <span className="font-mono font-black text-[10px] uppercase tracking-widest text-white/50 shrink-0">
                  ▲ {i + 1}A • SWAANG NEGATIVES
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 BOTTOM CALL TO ACTION                                       */}
      {/* ============================================================== */}
      <div className="max-w-7xl mx-auto px-6 mt-14 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div>
          <span className="bg-black text-[#FFD166] px-3 py-1 font-mono font-black text-[10px] uppercase tracking-widest border border-black shadow-[2px_2px_0px_black] inline-block mb-2">
            REPOSITORY SUMMARY
          </span>
          <p className="font-mono font-bold text-xs md:text-sm uppercase tracking-wider text-black max-w-xl">
            10 YEARS OF STREET THEATRE, REVOLUTIONARY NUKKADS & NATIONAL CHAMPIONSHIPS ACROSS INDIA.
          </p>
        </div>

        <Link
          href="/journey"
          className="group inline-flex items-center gap-3 bg-black text-[#06D6A0] border-4 border-black px-8 py-5 font-mono font-black uppercase text-xs md:text-sm tracking-widest shadow-[8px_8px_0px_#FF5F5F] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[10px_10px_0px_black] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all shrink-0"
        >
          <span>OPEN FULL ARCHIVE DIRECTORY (50+ PLAYS)</span>
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 🖼️ ARCHIVAL DETAIL MODAL (Lightbox Negative Inspection)        */}
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
                  <span className="bg-black text-[#06D6A0] border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest">
                    ACT // {activeStory.year || "ARCHIVE"}
                  </span>
                  {activeStory.date && (
                    <span className="bg-[#FFD166] text-black border-2 border-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_black]">
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