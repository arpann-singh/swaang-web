"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Timeline({ timeline }: { timeline: any[] }) {
  // 🧠 State to track which card is currently "Open"
  const [activeStory, setActiveStory] = useState<any | null>(null);

  // 🔒 Lock scrolling when the modal is open
  useEffect(() => {
    if (activeStory) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeStory]);

  if (!timeline || timeline.length === 0) return null;

  // 🔥 ENHANCEMENT: Sort timeline so earliest year (e.g. 2014) is at the top
  const sortedTimeline = [...timeline].sort((a, b) => parseInt(a.year) - parseInt(b.year));

  // 🎨 Swaang brand colors to alternate the drop shadows
  const shadowColors = ["shadow-[8px_8px_0px_#FF5F5F]", "shadow-[8px_8px_0px_#06D6A0]", "shadow-[8px_8px_0px_#FFD166]"];

  return (
    <section className="py-24 px-6 bg-[#2D2D2D] border-b-[8px] md:border-b-[12px] border-black relative overflow-hidden text-[#FFF9F0]">
      
      {/* 🎬 HEADER */}
      <div className="max-w-6xl mx-auto relative z-10 text-center md:text-left mb-20">
        <div className="inline-block bg-[#FFD166] text-[#2D2D2D] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-[3px_3px_0px_black]">
          Our Legacy
        </div>
        <h2 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none">
          The <span className="italic text-white/50">Journey</span>
        </h2>
      </div>

      {/* 🛣️ THE TIMELINE GRID */}
      <div className="relative max-w-5xl mx-auto">
        {/* The center line (Left aligned on mobile, Center on desktop) */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1.5 md:-ml-[3px] bg-white/10 rounded-full" />

        {sortedTimeline.map((item, index) => {
          const isLeft = index % 2 === 0;
          const shadowClass = shadowColors[index % shadowColors.length];

          return (
            <div key={item.id || index} className={`relative flex items-center mb-16 md:mb-24 w-full ${isLeft ? 'md:justify-start' : 'md:justify-end'}`}>
              
              {/* 🟠 The Timeline Dot */}
              <div className="absolute left-6 md:left-1/2 w-6 h-6 rounded-full bg-[#FFF9F0] border-4 border-black -ml-[9px] md:-ml-3 z-10 shadow-[2px_2px_0px_#FF5F5F]" />

              {/* 🃏 THE OPENABLE CARD */}
              <div className={`ml-16 md:ml-0 w-[calc(100%-4rem)] md:w-[45%] ${isLeft ? 'md:mr-[5%]' : 'md:ml-[5%]'}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => setActiveStory(item)}
                  className={`bg-[#FFF9F0] text-[#2D2D2D] border-4 border-black p-6 md:p-8 rounded-[2rem] ${shadowClass} cursor-pointer group relative transition-all duration-300 flex flex-col h-full min-h-[180px]`}
                >
                  {/* Top: Year Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-[#2D2D2D] text-white px-4 py-1.5 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-full border-2 border-black">
                      {item.year || "YEAR"}
                    </span>
                  </div>

                  {/* Middle: Title (Using item.event to match your DB) */}
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-8">
                    {item.event || item.title || "Untitled Milestone"}
                  </h3>

                  {/* Bottom Right: Click to know more */}
                  <div className="mt-auto self-end">
                    <span className="bg-[#FFD166] text-[#2D2D2D] border-2 border-black px-3 py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_black] group-hover:bg-[#FF5F5F] group-hover:text-white transition-colors flex items-center gap-1.5">
                      Open Archive 📂 <span className="text-base leading-none">⤾</span>
                    </span>
                  </div>
                </motion.div>
              </div>

            </div>
          );
        })}
      </div>

      {/* 🪟 THE POP-UP MODAL */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              > X </button>

              <span className="inline-block bg-[#06D6A0] text-black border-2 border-black px-4 py-1 font-black text-xs uppercase tracking-widest rounded-full mb-6 shadow-[2px_2px_0px_black]">
                Journey {activeStory.year}
              </span>

              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-none">
                {activeStory.event || activeStory.title}
              </h2>

              {/* 🔥 ENHANCEMENT: PHOTO GALLERY IN MODAL */}
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
                <button onClick={() => setActiveStory(null)} className="font-black uppercase tracking-widest text-[10px] text-black/40 hover:text-black transition-colors border-b-2 border-transparent hover:border-black pb-1">
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