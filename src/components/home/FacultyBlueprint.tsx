"use client";
import { motion } from "framer-motion";

export default function FacultyBlueprint() {
  return (
    <section className="py-28 px-6 bg-[var(--bg-primary)] relative overflow-hidden border-y-8 border-[var(--border-primary)]">
      
      {/* 🏛️ BACKGROUND KINETIC TEXT -> HARSH RED STAMP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.03] z-0">
        <h2 className="text-[20vw] font-black uppercase leading-none whitespace-nowrap text-[#FF5F5F] border-[2vw] border-[#FF5F5F] p-8 -rotate-12">
          APPROVED
        </h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* LEFT SIDE: THE ARCHITECTURAL PHOTO & BADGE */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-5/12 relative"
          >
            {/* Architectural Blueprint Markers -> Brutalist Crosshairs */}
            <div className="absolute -top-8 -left-8 w-16 h-16 border-t-8 border-l-8 border-black z-20" />
            <div className="absolute -bottom-8 -right-8 w-16 h-16 border-b-8 border-r-8 border-black z-20" />

            <div className="bg-white border-8 border-black p-4 md:p-6 shadow-[16px_16px_0px_black] relative">
              {/* CSS Masking Tape */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-10 bg-[#FFF9F0] border-4 border-black/10 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] -rotate-3 z-30 opacity-90 mix-blend-multiply" />
              <div className="absolute -bottom-4 right-10 w-24 h-10 bg-[#FFF9F0] border-4 border-black/10 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] rotate-6 z-30 opacity-90 mix-blend-multiply" />

              <div className="relative group overflow-hidden h-[380px] md:h-[550px] border-4 border-black bg-gray-100">
                <img 
                  src="/faculty-backbone.jpg" // 📸 REPLACE WITH ACTUAL IMAGE
                  alt="Faculty Backbone" 
                  className="w-full h-full object-cover grayscale-0 group-hover:grayscale transition-all duration-700"
                />
                
                {/* ID Overlay (Pillar of Swaang) */}
                <div className="absolute bottom-4 right-4 bg-black text-[#06D6A0] border-4 border-black px-4 py-2 font-mono font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#06D6A0]">
                  LOC: CHIEF_MENTOR
                </div>
              </div>
            </div>

            {/* 🎖️ NEW: FOUNDING MENTOR MEDAL BADGE (Explicit Tribute) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute right-0 md:-right-10 top-1/4 md:top-1/4 z-30 flex flex-col items-center gap-1.5 scale-75 md:scale-100 origin-right"
            >
                <div className="w-20 h-20 bg-[#FF5F5F] border-4 border-black rounded-full flex flex-col items-center justify-center p-3 text-center shadow-[4px_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all">
                    <span className="text-3xl">🏆</span>
                </div>
                <div className="bg-[var(--bg-primary)] border-2 border-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-black tracking-widest whitespace-nowrap">
                    Founding Mentor
                </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: THE EXECUTIVE SPECIFICATIONS */}
          <div className="w-full lg:w-7/12 space-y-10">
            <div>
              <p className="bg-[#FF5F5F] text-black border-4 border-black font-mono font-black uppercase tracking-[0.3em] text-xs px-4 py-1.5 shadow-[4px_4px_0px_black] inline-block mb-6">
                // EXECUTIVE_FOUNDATION //
              </p>
              
              <h2 className="text-7xl md:text-8xl font-black uppercase tracking-tighter text-black leading-[0.85]">
                THE <br />
                <span className="text-[#06D6A0]" style={{ WebkitTextStroke: '3px black' }}>BACKBONE</span>
              </h2>

              {/* 🔥 NEW: LARGE, READABLE AUTHORITATIVE NAME (The main update) */}
              <motion.h4 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-mono font-black uppercase tracking-widest text-black mt-10 leading-tight relative bg-[#FFD166] border-4 border-black p-4 shadow-[8px_8px_0px_black] inline-block w-full max-w-xl"
              >
                PROF. NAMRATA BHARGAVA
                <span className="font-black text-sm block mt-2 text-[#FF5F5F]">FOUNDER'S VISION</span>
              </motion.h4>
            </div>

            {/* 🔥 NEW: PURE TRIBUTE QUOTE (Stats removed) */}
            <div className="relative bg-white border-8 border-black p-8 shadow-[12px_12px_0px_black] mt-12 max-w-2xl">
              <div className="absolute -top-6 -left-6 bg-[#FF5F5F] border-4 border-black w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_black]">
                <span className="font-mono font-black text-2xl text-white">"</span>
              </div>
              <p className="text-lg md:text-xl font-mono font-bold text-black leading-relaxed">
                EVERY STANDING OVATION IS A TESTAMENT TO THE STRUCTURE THAT HOLDS THE STAGE. SWAANG EXISTS BECAUSE OF YOUR UNWAVERING SUPPORT, YOUR STRATEGIC VISION, AND YOUR TIMELESS MENTORSHIP. YOU BELIEVED IN US BEFORE THE CURTAIN ROSE — AND THAT BELIEF MADE ALL THE DIFFERENCE.
              </p>
            </div>

            {/* AUTHORIZATION CREDENTIAL */}
            <div className="pt-8 flex items-center gap-6 border-t-8 border-black text-center mt-12">
                 <p className="font-mono font-black text-xs uppercase tracking-widest text-black bg-[#06D6A0] border-4 border-black px-4 py-2 shadow-[4px_4px_0px_black]">
                   WITH DEEPEST GRATITUDE FOR ENGINEERING THE STAGE.
                 </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}