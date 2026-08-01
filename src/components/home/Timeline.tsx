"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Archive, X, Star, Film, GraduationCap, Award } from "lucide-react";
import Link from "next/link";

export default function Timeline({ timeline = [] }: { timeline: any[] }) {
  // 🧠 State to track which card is currently "Open"
  const [activeStory, setActiveStory] = useState<any | null>(null);
  
  // 🃏 State for Flashcard Deck physics
  const [activeCardIndex, setActiveCardIndex] = useState(0);

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

  // Reset deck when switching years
  useEffect(() => {
    setActiveCardIndex(0);
  }, [activeYear]);

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
            className="bg-[#FFD166] text-[var(--text-primary)] px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_#FFF9F0]"
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
                ? "bg-[#06D6A0] text-[var(--text-primary)] border-[#FFF9F0] -translate-y-2 shadow-[6px_6px_0px_#FFF9F0]" 
                : "bg-transparent border-[#FFF9F0]/20 text-[#FFF9F0]/40 hover:border-[#FFF9F0]/60"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* 3. 🔥 THE FLASHCARD DECK */}
        <div className="relative min-h-[500px] md:min-h-[600px] w-full max-w-lg mx-auto py-8">
          {groupedEvents[activeYear]?.length > 0 ? (
            <AnimatePresence>
              {groupedEvents[activeYear].map((item: any, index: number) => {
                const isPast = index < activeCardIndex;
                const offsetIndex = index - activeCardIndex;
                
                // For extreme performance, only render the top 3 cards visually
                if (isPast || offsetIndex > 2) return null;

                const cat = categoryMap[item.category] || categoryMap.milestone;
                const CatIcon = cat.icon;
                
                // Stack physics calculations (Z-depth, shrinking, offset)
                const zIndex = 40 - offsetIndex;
                const scale = 1 - (offsetIndex * 0.05); // e.g. 1, 0.95, 0.90
                const yOffset = offsetIndex * 24; // Pushes lower cards further down to "peek" out
                
                // Deterministic pseudo-random rotation between -3 and +3 degrees
                const rotations = [-3, 2, -1, 3, -2, 1];
                const baseRotation = rotations[index % rotations.length];

                return (
                  <motion.div 
                    key={item.id || index} 
                    initial={{ opacity: 0, y: yOffset + 100, scale: 0.8 }}
                    animate={{ opacity: 1, y: yOffset, scale: scale, zIndex: zIndex, rotate: baseRotation }}
                    exit={{ opacity: 0, x: "120%", rotate: 25, transition: { duration: 0.5, ease: "easeIn" } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-8 left-4 right-4 md:left-0 md:right-0 bg-[#FFF9F0] text-[var(--text-primary)] border-4 md:border-8 border-black p-6 md:p-8 shadow-[8px_8px_0px_#FF5F5F] md:shadow-[12px_12px_0px_#FF5F5F] flex flex-col justify-between h-[420px] md:h-[480px] group"
                    style={{ transformOrigin: "bottom center" }}
                  >
                    {/* 📌 The "Masking Tape" */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/70 border border-black/10 shadow-sm rotate-2 mix-blend-overlay z-20 pointer-events-none" />
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#FFD166]/30 border border-black/5 -rotate-1 mix-blend-multiply z-20 pointer-events-none" />

                    {/* 🔥 Floating Category Badge */}
                    <div className={`absolute -right-4 -top-4 p-3 rounded-full border-4 border-black ${cat.color} shadow-[4px_4px_0px_black] rotate-12 transition-transform z-20`}>
                      <CatIcon size={24} strokeWidth={3} className={cat.color.includes('text-white') ? 'text-white' : 'text-black'} />
                    </div>

                    <div className="text-left mt-2 relative z-10 h-full flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-[#2D2D2D] text-white px-4 py-1.5 border-2 border-black rounded-lg font-black text-[10px] md:text-xs tracking-widest shadow-[2px_2px_0px_black] -rotate-2">
                          {item.date || item.year || activeYear}
                        </span>
                      </div>
                      
                      <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-tighter line-clamp-2">
                        {item.event || item.title || "Untitled Milestone"}
                      </h3>
                      
                      <div className="w-16 h-2 bg-[#06D6A0] my-4 border-2 border-black" />
                      
                      <p className="font-bold opacity-70 text-xs md:text-sm leading-relaxed line-clamp-3 bg-black/5 p-4 border-l-4 border-black rounded-r-lg">
                        {item.description || item.content || "A milestone event in Swaang's history."}
                      </p>
                      
                      {/* Interaction Controls (Only clickable if it is the Top Card) */}
                      <div className="mt-auto flex gap-3 pt-4">
                        <button 
                          disabled={offsetIndex !== 0}
                          onClick={() => setActiveStory(item)}
                          className={`flex-1 bg-[#2D2D2D] text-white border-4 border-black py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs shadow-[4px_4px_0px_black] transition-all flex items-center justify-center gap-2 ${offsetIndex === 0 ? 'hover:bg-[#FFD166] hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
                        >
                          Read
                        </button>
                        
                        <button 
                          disabled={offsetIndex !== 0}
                          onClick={(e) => { e.stopPropagation(); setActiveCardIndex(prev => prev + 1); }}
                          className={`flex-1 bg-[#06D6A0] text-black border-4 border-black py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs shadow-[4px_4px_0px_black] transition-all flex items-center justify-center gap-2 ${offsetIndex === 0 ? 'hover:bg-[#FF5F5F] hover:text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
                        >
                          Next ➔
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : null}

          {/* Deck Empty State / Reset */}
          {activeCardIndex >= (groupedEvents[activeYear]?.length || 0) && groupedEvents[activeYear]?.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute top-8 left-4 right-4 md:left-0 md:right-0 bg-black text-[#FFF9F0] text-center border-4 md:border-8 border-dashed border-[#FFF9F0]/30 p-8 flex flex-col items-center justify-center h-[420px] md:h-[480px] z-10"
             >
               <h3 className="text-3xl font-black uppercase mb-2">End of {activeYear}</h3>
               <p className="font-bold text-xs opacity-50 uppercase tracking-widest mb-8">All events reviewed.</p>
               
               <button 
                 onClick={() => setActiveCardIndex(0)}
                 className="bg-[#2D2D2D] text-white border-4 border-[#FFF9F0]/30 px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_#FFF9F0]/30 hover:bg-[#FFD166] hover:text-black hover:border-black hover:shadow-[4px_4px_0px_black] hover:-translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
               >
                 Restack Deck ↺
               </button>
               
               <Link href="/journey" className="mt-8 font-bold uppercase text-xs tracking-widest text-[#06D6A0] hover:underline flex items-center gap-2">
                  View Full Archive <ChevronRight size={16}/>
               </Link>
             </motion.div>
          )}
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
              className="bg-[var(--bg-primary)] w-full max-w-3xl max-h-[85vh] overflow-y-auto border-4 border-black p-8 md:p-12 rounded-[2rem] shadow-[16px_16px_0px_#FF5F5F] relative z-10 text-[var(--text-primary)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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