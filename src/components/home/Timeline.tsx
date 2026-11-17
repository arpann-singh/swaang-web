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
  Calendar,
  Sparkles,
  Layers
} from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  // Category Icon & Badge Mapping
  const categoryMap: Record<string, { icon: any; color: string; badge: string; shadow: string; label: string }> = {
    milestone: { 
      icon: Star, 
      color: "bg-[#FFD166] text-black", 
      badge: "bg-[#FFD166] text-black", 
      shadow: "shadow-[8px_8px_0px_#FFD166]",
      label: "MILESTONE" 
    },
    play: { 
      icon: Film, 
      color: "bg-[#FF5F5F] text-white", 
      badge: "bg-[#FF5F5F] text-white", 
      shadow: "shadow-[8px_8px_0px_#FF5F5F]",
      label: "PRODUCTION" 
    },
    workshop: { 
      icon: GraduationCap, 
      color: "bg-[#06D6A0] text-black", 
      badge: "bg-[#06D6A0] text-black", 
      shadow: "shadow-[8px_8px_0px_#06D6A0]",
      label: "WORKSHOP" 
    },
    achievement: { 
      icon: Award, 
      color: "bg-black text-[#06D6A0]", 
      badge: "bg-black text-[#06D6A0]", 
      shadow: "shadow-[8px_8px_0px_black]",
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

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-24 md:py-40 bg-[#FFF9F0] text-black relative border-b-8 border-black overflow-hidden selection:bg-[#FF5F5F] selection:text-white">
      
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
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-8 border-black pb-10">
          <div className="max-w-3xl">
            <span className="bg-[#FFD166] text-black px-6 py-2 border-4 border-black font-mono font-black uppercase text-xs tracking-[0.3em] shadow-[4px_4px_0px_black] inline-block mb-6">
              ACT // 02 • THE CHRONICLES
            </span>
            <h2 className="text-[11vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.85]">
              THE <br />
              <span className="text-white" style={{ WebkitTextStroke: "2.5px black" }}>JOURNEY</span>
            </h2>
          </div>

          <div className="md:max-w-xs space-y-4">
            <p className="font-mono font-bold text-xs md:text-sm leading-relaxed uppercase bg-white border-4 border-black p-4 shadow-[6px_6px_0px_black] text-black">
              10 YEARS OF RAW STREET THEATRE, PROSCENIUM TRIUMPHS & NATIONAL CHAMPIONSHIPS.
            </p>
          </div>
        </div>

        {/* 🏷️ TACTILE ERA FILTER BUTTONS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-6 mb-16 no-scrollbar">
          <span className="font-mono font-black text-xs uppercase tracking-widest text-black/70 mr-2 shrink-0">
            FILTER BY ERA:
          </span>

          <button
            onClick={() => setSelectedYear("ALL")}
            className={`px-5 py-2.5 font-mono font-black text-xs uppercase tracking-widest border-4 border-black transition-all shrink-0 ${
              selectedYear === "ALL"
                ? "bg-black text-[#06D6A0] shadow-[4px_4px_0px_#06D6A0] -translate-y-1"
                : "bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_black]"
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
                className={`px-4 py-2.5 font-mono font-black text-xs uppercase tracking-widest border-4 border-black transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#FF5F5F] text-white shadow-[4px_4px_0px_black] -translate-y-1"
                    : "bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_black]"
                }`}
              >
                {yr} <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 🛣️ VERTICAL NEO-BRUTALIST ROADMAP SPIDER                        */}
        {/* ============================================================== */}
        <div className="relative">
          
          {/* CENTER TIMELINE SPINE (Desktop: center, Mobile: left aligned) */}
          <div className="absolute top-0 bottom-0 left-6 md:left-1/2 -translate-x-1/2 w-3 bg-black z-0 shadow-[2px_0px_0px_rgba(0,0,0,0.1)]" />

          {/* ROADMAP NODES */}
          <div className="space-y-16 md:space-y-24 relative z-10">
            {filteredEvents.map((item, index) => {
              const cat = categoryMap[item.category] || categoryMap.milestone;
              const CatIcon = cat.icon;
              const isEven = index % 2 === 0;
              const photo = item.photo1 || item.photo2 || item.image || item.photo;

              return (
                <div 
                  key={item.id || index}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } gap-8 md:gap-16 pl-14 md:pl-0`}
                >
                  {/* 📍 CENTER ROADMAP STAMP NODE */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 z-20">
                    <motion.div 
                      whileHover={{ scale: 1.15, rotate: isEven ? 12 : -12 }}
                      transition={{ type: "spring", stiffness: 350, damping: 12 }}
                      className={`w-12 h-12 md:w-14 md:h-14 ${cat.badge} border-4 border-black flex items-center justify-center font-black shadow-[4px_4px_0px_black] cursor-pointer`}
                      onClick={() => setActiveStory(item)}
                    >
                      <CatIcon size={22} strokeWidth={2.5} />
                    </motion.div>
                  </div>

                  {/* 📋 PLAYBILL CARD CONTENT (Alternating 50% width on Desktop) */}
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full md:w-[calc(50%-4rem)] group cursor-pointer"
                    onClick={() => setActiveStory(item)}
                  >
                    <div className={`bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] group-hover:shadow-[14px_14px_0px_#FF5F5F] group-hover:-translate-y-1.5 transition-all duration-300 relative flex flex-col justify-between`}>
                      
                      {/* Top Bar / Metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black pb-4 mb-6">
                        <div className="flex items-center gap-2">
                          <span className={`${cat.badge} px-3 py-1 font-mono font-black text-[10px] md:text-xs uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_black]`}>
                            {cat.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.date && (
                            <span className="font-mono font-bold text-[10px] md:text-xs uppercase tracking-wider text-black bg-gray-100 px-2 py-0.5 border border-black">
                              {item.date}
                            </span>
                          )}
                          <span className="bg-black text-[#FFD166] px-3 py-1 font-mono font-black text-[11px] md:text-xs uppercase tracking-widest">
                            ACT // {item.year || "HISTORIC"}
                          </span>
                        </div>
                      </div>

                      {/* 📸 OPTIONAL ARCHIVAL PHOTO */}
                      {photo && (
                        <div className="relative aspect-[16/10] w-full bg-black border-4 border-black overflow-hidden mb-6 shadow-[4px_4px_0px_black] group-hover:shadow-[6px_6px_0px_black] transition-all">
                          <img
                            src={photo}
                            alt={item.event || item.title}
                            className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border border-white/40">
                            ARCHIVE NEGATIVE
                          </div>
                        </div>
                      )}

                      {/* Milestone Title */}
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-black leading-tight mb-4 group-hover:text-[#FF5F5F] transition-colors">
                        {item.event || item.title || "Untitled Milestone"}
                      </h3>

                      {/* Description Excerpt */}
                      <div className="relative pl-4 border-l-4 border-black mb-6">
                        <p className="font-mono font-bold text-xs md:text-sm text-black/80 leading-relaxed uppercase line-clamp-3">
                          {item.description || item.content || "Archival milestone preserved in the official Swaang historical registry."}
                        </p>
                      </div>

                      {/* Card Footer Action */}
                      <div className="pt-4 border-t-2 border-dashed border-black flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-black/50">
                          RECORD ID: #{String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="inline-flex items-center gap-1.5 font-black uppercase text-xs text-black group-hover:text-[#FF5F5F] group-hover:translate-x-1 transition-all">
                          <span>INSPECT MEMORY</span>
                          <ChevronRight size={16} strokeWidth={3} />
                        </span>
                      </div>

                    </div>
                  </motion.div>

                  {/* EMPTY HALF ON DESKTOP FOR PROPER ZIGZAG SPACING */}
                  <div className="hidden md:block md:w-[calc(50%-4rem)]" />
                </div>
              );
            })}
          </div>

        </div>

        {/* ============================================================== */}
        {/* 🚀 BOTTOM SECTION CALL TO ACTION                               */}
        {/* ============================================================== */}
        <div className="mt-24 pt-12 border-t-8 border-black flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center sm:text-left">
            <span className="bg-[#06D6A0] text-black px-4 py-1.5 font-mono font-black text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_black] inline-block mb-3">
              10-YEAR PRODUCTION ARCHIVE
            </span>
            <p className="font-mono font-bold text-xs md:text-sm uppercase tracking-wider text-black">
              EXPLORE EVERY SCRIPT, NATIONAL ACCOLADE, AND STREET CAMPAIGN DOCUMENTED SINCE 2014.
            </p>
          </div>

          <Link
            href="/journey"
            className="group inline-flex items-center gap-4 bg-black text-[#FFD166] border-4 border-black px-8 py-5 font-mono font-black uppercase text-xs md:text-sm tracking-widest shadow-[8px_8px_0px_#FF5F5F] hover:bg-[#FF5F5F] hover:text-white hover:shadow-[10px_10px_0px_black] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all shrink-0"
          >
            <span>VIEW COMPLETE CHRONICLES DIRECTORY</span>
            <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1.5 transition-transform" />
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
                      {activeStory.category.toUpperCase()}
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