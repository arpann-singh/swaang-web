"use client";
import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Archive, ArrowRight } from "lucide-react";
import Link from "next/link";

interface JourneyEvent {
  id: string;
  year: string;
  title: string;
  date?: string;
  description?: string;
  link?: string;
  createdAt?: number;
}

export default function JourneySection({ allEvents = [] }: { allEvents: JourneyEvent[] }) {
  // 1. Grouping Logic: Automatically categorizes events by year
  const groupedEvents = useMemo(() => {
    const groups = allEvents.reduce((acc: any, event) => {
      const year = event.year || "Archive";
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    }, {});
    
    // Sort years descending and events within years by date
    Object.keys(groups).forEach(year => {
      groups[year].sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    });
    return groups;
  }, [allEvents]);

  const years = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));
  const [activeYear, setActiveYear] = useState(years[0] || "");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (allEvents.length === 0) return null;

  return (
    <section id="journey" className="py-24 bg-[#2D2D2D] text-[#FFF9F0] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* SECTION HEADER */}
        <div className="mb-16 text-left">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-[#FFD166] text-[#2D2D2D] px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-[4px_4px_0px_#FFF9F0]"
          >
            Our Legacy
          </motion.span>
          <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mt-6 italic leading-none">
            THE <span className="text-transparent" style={{ WebkitTextStroke: '2px #FFF9F0' }}>JOURNEY</span>
          </h2>
        </div>

        {/* 2. 🔥 YEAR SELECTOR (Navigation) */}
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
              className="flex gap-8 overflow-x-auto pb-12 no-scrollbar snap-x"
            >
              {groupedEvents[activeYear]?.map((event: JourneyEvent) => (
                <div 
                  key={event.id} 
                  className="min-w-[320px] md:min-w-[450px] snap-center"
                >
                  <div className="bg-[#FFF9F0] text-[#2D2D2D] border-8 border-[#2D2D2D] p-10 rounded-[3.5rem] shadow-[15px_15px_0px_#FF5F5F] h-[480px] flex flex-col justify-between hover:rotate-1 transition-transform cursor-default">
                    <div className="text-left">
                      <div className="flex justify-between items-start">
                        <span className="bg-[#2D2D2D] text-white px-4 py-1 rounded-xl font-black text-[10px] tracking-widest">
                          {event.date || activeYear}
                        </span>
                        <Archive size={20} className="opacity-20" />
                      </div>
                      <h3 className="text-4xl font-black uppercase mt-6 leading-tight tracking-tighter">
                        {event.title}
                      </h3>
                      <p className="mt-4 font-bold opacity-60 text-sm leading-relaxed line-clamp-4">
                        {event.description || "A milestone event in Swaang's history, showcasing theatrical innovation and ensemble storytelling."}
                      </p>
                    </div>
                    
                    <Link 
                      href={event.link || `/journey#${event.id}`}
                      className="w-full bg-[#FFD166] border-4 border-[#2D2D2D] py-4 rounded-2xl font-black uppercase text-xs shadow-[5px_5px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Open Archive 📂
                    </Link>
                  </div>
                </div>
              ))}

              {/* 🔥 THE "VIEW ALL" END CARD (Step-by-step Implementation) */}
              <div className="min-w-[300px] flex flex-col items-center justify-center snap-center p-8">
                <Link href="/journey" className="group flex flex-col items-center gap-6 text-center">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-[#FFF9F0]/30 flex items-center justify-center group-hover:border-[#06D6A0] group-hover:bg-[#06D6A0]/10 transition-all"
                  >
                    <ArrowRight className="text-[#FFF9F0] group-hover:text-[#06D6A0]" size={32} />
                  </motion.div>
                  <div className="space-y-1">
                    <p className="font-black uppercase text-[11px] tracking-[0.2em] text-[#FFF9F0]">Full Archive</p>
                    <p className="font-bold uppercase text-[9px] opacity-30 tracking-widest">Explore all {allEvents.length} events</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Desktop Navigation Controls */}
          <div className="hidden md:flex gap-4 mt-8 justify-end">
            <button 
              onClick={() => scroll('left')} 
              className="p-4 border-4 border-[#FFF9F0]/20 rounded-full hover:bg-[#FFF9F0] hover:text-[#2D2D2D] transition-all active:scale-90"
              aria-label="Previous Events"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-4 border-4 border-[#FFF9F0]/20 rounded-full hover:bg-[#FFF9F0] hover:text-[#2D2D2D] transition-all active:scale-90"
              aria-label="Next Events"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Faded Background Decal - Aesthetic Legacy Touch */}
        <div className="absolute -bottom-20 -right-20 text-[300px] font-black opacity-[0.03] pointer-events-none select-none italic hidden md:block">
          {activeYear}
        </div>
      </div>
    </section>
  );
}