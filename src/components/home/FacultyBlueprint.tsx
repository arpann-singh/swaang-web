"use client";
import { motion } from "framer-motion";

export default function FacultyBlueprint() {
  return (
    <section className="py-28 px-6 bg-[#FFF9F0] relative overflow-hidden border-y-8 border-[#2D2D2D]">
      
      {/* 🎭 THE PREMIUM TEXTURE & OVERLAYS */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
      
      {/* 🏛️ BACKGROUND KINETIC TEXT (Authorize the Stage) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap opacity-[0.02] select-none pointer-events-none">
        <motion.h2 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="text-[25vw] font-black uppercase leading-none"
        >
          FOUNDING_MENTOR • FOUNDER'S_VISION • PILLAR • FOUNDING_MENTOR •
        </motion.h2>
      </div>

      {/* Dynamic Lighting effect from the top left (Spotlight Lens) */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_15%,_rgba(255,255,255,0.4)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          
          {/* LEFT SIDE: THE ARCHITECTURAL PHOTO & BADGE */}
          <motion.div 
            initial={{ opacity: 0, x: -50, rotate: -2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-5/12 relative"
          >
            {/* Architectural Blueprint Markers */}
            <div className="absolute -top-4 -left-4 w-10 h-10 border-t-4 border-l-4 border-[#2D2D2D]" />
            <div className="absolute -top-4 -right-4 w-10 h-10 border-t-4 border-r-4 border-[#2D2D2D]" />
            <div className="absolute -bottom-4 -left-4 w-10 h-10 border-b-4 border-l-4 border-[#2D2D2D]" />
            <div className="absolute -bottom-4 -right-4 w-10 h-10 border-b-4 border-r-4 border-[#2D2D2D]" />

            <div className="bg-white border-8 border-[#2D2D2D] p-3 shadow-[20px_20px_0px_#2D2D2D]">
              <div className="relative group overflow-hidden h-[550px]">
                <img 
                  src="/faculty-backbone.jpg" // 📸 REPLACE WITH ACTUAL IMAGE
                  alt="Faculty Backbone" 
                  className="w-full h-full object-cover grayscale-0 hover:grayscale transition-all duration-700"
                />
                
                {/* ID Overlay (Pillar of Swaang) */}
                <div className="absolute bottom-4 right-4 bg-[#2D2D2D] text-white px-3 py-1 font-mono text-[10px] uppercase tracking-tighter">
                  LOC: BackBone of SWAANG
                </div>
              </div>
            </div>

            {/* 🎖️ NEW: FOUNDING MENTOR MEDAL BADGE (Explicit Tribute) */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -right-10 top-1/4 z-30 flex flex-col items-center gap-1.5"
            >
                <div className="w-20 h-20 bg-[#FF5F5F] border-4 border-black rounded-full flex flex-col items-center justify-center p-3 text-center shadow-[4px_4px_10px_rgba(0,0,0,0.5)] active:translate-y-1 transition-all">
                    <span className="text-3xl">🏆</span>
                </div>
                <div className="bg-[#FFF9F0] border-2 border-black px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-black tracking-widest whitespace-nowrap">
                    Founding Mentor
                </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: THE EXECUTIVE SPECIFICATIONS */}
          <div className="w-full lg:w-7/12 space-y-10">
            <div>
              <p className="font-mono text-[#FF5F5F] font-black uppercase tracking-[0.3em] text-xs mb-2">
                // EXECUTIVE_FOUNDATION // SINCE_2014
              </p>
              
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-[0.85]">
                The <br />
                <span className="underline decoration-[#FF5F5F] decoration-8 underline-offset-4">Backbone</span>
              </h2>

              {/* 🔥 NEW: LARGE, READABLE AUTHORITATIVE NAME (The main update) */}
              <motion.h4 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-black uppercase tracking-widest text-[#2D2D2D] mt-8 leading-tight relative"
              >
                Prof. Namrata Bhargava
                <span className="font-playfair text-xl italic font-light text-[#FFD166]/40 absolute top-4 -left-4 z-0">Founder's Vision</span>
              </motion.h4>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5F5F]">Chief Mentor & Faculty Coordinator</p>
            </div>

            {/* 🔥 NEW: PURE TRIBUTE QUOTE (Stats removed) */}
            <p className="text-2xl md:text-3xl font-bold text-[#2D2D2D]/90 leading-relaxed italic border-l-8 border-[#06D6A0] pl-6 max-w-2xl">
              "Every standing ovation is a testament to the structure that holds the stage. Swaang exists because of your unwavering support, your strategic vision, and your timeless mentorship. You believed in us before the curtain rose — and that belief made all the difference."
            </p>

            {/* AUTHORIZATION CREDENTIAL */}
            <div className="pt-8 flex items-center gap-6 border-t-4 border-dashed border-[#2D2D2D]/10 text-center">
                 <p className="font-black text-[10px] uppercase tracking-widest opacity-40">With deepest gratitude for engineering the stage.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}