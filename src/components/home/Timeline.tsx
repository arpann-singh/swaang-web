"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Archive, X, Star, Film, GraduationCap, Award } from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  // 🧠 State to track which card is currently "Open"
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 🔥 Map Categories to Icons & Colors (Matches your updated Admin Panel)
  const categoryMap: any = {
    milestone: { icon: Star, color: 'bg-[#FFD166]' },
    play: { icon: Film, color: 'bg-[#FF5F5F]' },
    workshop: { icon: GraduationCap, color: 'bg-[#06D6A0]' },
    achievement: { icon: Award, color: 'bg-[#2D2D2D] text-white' }
  };

  // 🔒 Lock scrolling when the modal is open
  useEffect(() => {
    if (activeStory) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeStory]);

  // 1. Group events by year automatically
  const groupedEvents = useMemo(() => {
    const groups = (timeline || []).reduce((acc: any, item) => {
      const year = item.year || "Archive";
      if (!acc[year]) acc[year] = [];
      acc[year].push(item);
      return acc;
    }, {});
    
    // Sort events within each year by date/id descending
    Object.keys(groups).forEach(year => {
      groups[year].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    });
    return groups;
  }, [timeline]);

  const years = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));
  const [activeYear, setActiveYear] = useState(years[0] || "");

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!timeline || timeline.length === 0) return null;

  return (
    <section id="journey" className="py-24 bg-[#2D2D2D] text-[#FFF9F0] overflow-hidden relative border-b-[8px] md:border-b-[12px] border-black">
      {/* 🔥 Scrollbar Style Injection */}
      <style jsx global>{`
        .swaang-scrollbar::-webkit-scrollbar {
          height: 12px;
        }
        .swaang-scrollbar::-webkit-scrollbar-track {
          background: #2D2D2D;
          border-radius: 10px;
          border: 2px solid #FFF9F0;
        }
        .swaang-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD166;
          border: 3px solid #2D2D2D;
          border-radius: 10px;
          box-shadow: 4px 4px 0px #000;
        }
        .swaang-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #06D6A0;
        }
        .swaang-scrollbar::-webkit-scrollbar-thumb:active {
          background: #FF5F5F;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 🎬 HEADER */}
        <div className="mb-16 text-left">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-[#FFD166] text-[#2D2D2D] px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_#FFF9F0]"
          >
            Our Legacy
          </motion.span>
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mt-6 italic leading-none">
            THE <span className="text-transparent" style={{ WebkitTextStroke: '2px #FFF9F0' }}>JOURNEY</span>
          </h2>
        </div>

        {/* 2. 🔥 YEAR SELECTOR (Horizontal Tabs) */}
        <div className="flex flex-wrap gap-3 mb-12">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setActiveYear(year)}
              className={`px-8 py-3 rounded-2xl border-4 font-black uppercase transition-all duration-300 ${
                activeYear === year 
                ? "bg-[#06D6A0] text-[#2D2D2D] border-[#FFF9F0] -translate-y-2 shadow-[6px_6px_0px_#FFF9F0]" 
                : "bg-transparent border-[#FFF9F0]/20 text-[#FFF9F0]/40 hover:border-[#FFF9F0]/60"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* 3. 🔥 DYNAMIC EVENT CAROUSEL */}
        <div className="group relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeYear}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              ref={scrollRef}
              /* 🔥 Custom Scrollbar Utility Applied */
              className="flex gap-8 overflow-x-auto pb-12 snap-x scroll-smooth swaang-scrollbar"
            >
              {groupedEvents[activeYear]?.map((item: any, index: number) => {
                // Determine Category Icon and Color
                const cat = categoryMap[item.category] || categoryMap.milestone;
                const CatIcon = cat.icon;

                return (
                  <div 
                    key={item.id || index} 
                    className="min-w-[320px] md:min-w-[450px] snap-center"
                  >
                    <motion.div
                      whileHover={{ rotate: 1 }}
                      onClick={() => setActiveStory(item)}
                      className="bg-[#FFF9F0] text-[#2D2D2D] border-8 border-black p-10 rounded-[3.5rem] shadow-[15px_15px_0px_#FF5F5F] h-[500px] flex flex-col justify-between cursor-pointer transition-transform relative"
                    >
                      {/* 🔥 NEW: Floating Category Badge */}
                      <div className={`absolute top-8 right-8 p-3 rounded-2xl border-4 border-black ${cat.color} shadow-[4px_4px_0px_black] rotate-6 group-hover:rotate-0 transition-transform`}>
                        <CatIcon size={20} strokeWidth={3} />
                      </div>

                      <div className="text-left">
                        <div className="flex justify-between items-start">
                          <span className="bg-[#2D2D2D] text-white px-4 py-1 rounded-xl font-black text-[10px] tracking-widest">
                            {item.date || item.year || activeYear}
                          </span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase mt-8 leading-tight tracking-tighter">
                          {item.event || item.title || "Untitled Milestone"}
                        </h3>
                        <p className="mt-4 font-bold opacity-60 text-sm leading-relaxed line-clamp-4">
                          {item.description || item.content || "A milestone event in Swaang's history, showcasing theatrical innovation and ensemble storytelling."}
                        </p>
                      </div>
                      
                      <div className="w-full bg-[#FFD166] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase text-[10px] shadow-[5px_5px_0px_#2D2D2D] group-hover:bg-[#FF5F5F] group-hover:text-white transition-all flex items-center justify-center gap-2">
                        Open Archive 📂 <span className="text-lg leading-none">⤾</span>
                      </div>
                    </motion.div>
                  </div>
                );
              })}

              {/* END CARD: JUMP TO FULL ARCHIVE PAGE */}
              <div className="min-w-[300px] flex flex-col items-center justify-center snap-center p-8 text-center">
                <Link href="/journey" className="group flex flex-col items-center gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-[#FFF9F0]/30 flex items-center justify-center group-hover:border-[#06D6A0] transition-all"
                  >
                    <ChevronRight className="text-[#FFF9F0] group-hover:text-[#06D6A0]" size={32} />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="font-black uppercase text-[11px] tracking-widest text-[#FFF9F0]">Full Archive</p>
                    <p className="font-bold uppercase text-[8px] opacity-30 tracking-[0.2em]">View all {timeline.length} events</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Controls */}
          <div className="hidden md:flex gap-4 mt-8 justify-end">
            <button 
              onClick={() => scroll('left')} 
              className="p-4 border-4 border-[#FFF9F0]/20 rounded-full hover:bg-[#FFF9F0] hover:text-[#2D2D2D] transition-all active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-4 border-4 border-[#FFF9F0]/20 rounded-full hover:bg-[#FFF9F0] hover:text-[#2D2D2D] transition-all active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Faded Background Decal */}
        <div className="absolute -bottom-20 -right-20 text-[300px] font-black opacity-[0.03] pointer-events-none select-none italic hidden md:block">
          {activeYear}
        </div>
      </div>

      {/* 🪟 THE POP-UP MODAL (Preserved with all features) */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setActiveStory(null)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-[#FFF9F0] w-full max-w-3xl max-h-[85vh] overflow-y-auto border-4 border-black p-8 md:p-12 rounded-[2rem] shadow-[16px_16px_0px_#FF5F5F] relative z-10 text-[#2D2D2D] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <button 
                onClick={() => setActiveStory(null)} 
                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white border-4 border-black rounded-full flex items-center justify-center font-black text-xl hover:bg-[#FF5F5F] hover:text-white transition-colors shadow-[2px_2px_0px_black] hover:translate-y-0.5 hover:shadow-none"
              > 
                <X size={20} /> 
              </button>

              <span className="inline-block bg-[#06D6A0] text-black border-2 border-black px-4 py-1 font-black text-xs uppercase tracking-widest rounded-full mb-6 shadow-[2px_2px_0px_black]">
                Journey {activeStory.year}
              </span>

              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-none">
                {activeStory.event || activeStory.title}
              </h2>

              {/* PHOTO GALLERY IN MODAL */}
              {(activeStory.photo1 || activeStory.photo2) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {activeStory.photo1 && (
                    <img src={activeStory.photo1} className="w-full aspect-video object-cover rounded-2xl border-4 border-black shadow-[4px_4px_0px_black]" alt="Memory 1" />
                  )}
                  {activeStory.photo2 && (
                    <img src={activeStory.photo2} className="w-full aspect-video object-cover rounded-2xl border-4 border-black shadow-[4px_4px_0px_black]" alt="Memory 2" />
                  )}
                </div>
              )}

              <div className="bg-white border-4 border-black p-6 md:p-8 rounded-2xl shadow-[6px_6px_0px_black/20]">
                <p className="font-bold text-sm md:text-base leading-relaxed whitespace-pre-wrap opacity-90">
                  {activeStory.description || activeStory.content || "No detailed description was provided."}
                </p>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setActiveStory(null)} 
                  className="font-black uppercase tracking-widest text-[10px] text-black/40 hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1"
                >
                  Close Archive
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}