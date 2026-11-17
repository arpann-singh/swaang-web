"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Spotlight({ aotm }: { aotm: any }) {
  const [isCardHovered, setIsCardHovered] = useState(false);

  if (!aotm) return null;

  return (
    <section className="py-24 md:py-40 px-6 bg-transparent border-b-8 border-black relative overflow-hidden flex flex-col justify-center min-h-screen">
      
      {/* 🎭 THEATRICAL SPOTLIGHT CURTAIN DIMMER */}
      <div 
        className={`absolute inset-0 bg-[#0F051D]/65 pointer-events-none z-0 transition-opacity duration-700 ${isCardHovered ? "opacity-100" : "opacity-0"}`} 
      />

      {/* 💡 FOCUSED STAGE BEAM ON ACTOR */}
      <div 
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${isCardHovered ? "opacity-100" : "opacity-0"}`}
        style={{
          background: "radial-gradient(circle 520px at 30% 50%, rgba(255, 209, 102, 0.28) 0%, rgba(255, 95, 95, 0.1) 45%, transparent 75%)"
        }}
      />

      {/* 🌪️ MULTI-ROW KINETIC MARQUEE BACKGROUND */}
      <div className={`absolute inset-0 flex flex-col justify-center gap-16 select-none pointer-events-none overflow-hidden transition-opacity duration-500 ${isCardHovered ? "opacity-[0.01]" : "opacity-[0.03]"}`}>
        <motion.h2 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          PROTAGONIST // PROTAGONIST // PROTAGONIST // PROTAGONIST
        </motion.h2>
        <motion.h2 
          animate={{ x: [-2000, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          LEAD // LEAD // LEAD // LEAD // LEAD // LEAD
        </motion.h2>
        <motion.h2 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          PROTAGONIST // PROTAGONIST // PROTAGONIST // PROTAGONIST
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-0 mt-8">
        
        {/* 📸 SOLID BRUTALIST IMAGE CONTAINER WITH STAGE SPOTLIGHT HOVER */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={() => setIsCardHovered(false)}
          whileHover={{ scale: 1.03, rotate: -1.5 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="w-full lg:w-5/12 relative z-10 group cursor-pointer"
        >
          {/* Main Photo Box */}
          <div className={`relative w-full aspect-[3/4] md:aspect-[4/5] bg-black border-4 md:border-8 border-black transition-shadow duration-300 overflow-hidden ${isCardHovered ? "shadow-[14px_14px_0px_#FFD166] md:shadow-[24px_24px_0px_#FFD166]" : "shadow-[10px_10px_0px_#FF5F5F] md:shadow-[20px_20px_0px_#FF5F5F]"}`}>
            
            {/* The Solid Image */}
            <img 
              data-cms-doc="settings/aotm"
              data-cms-field="photo"
              data-cms-type="image"
              src={aotm.photo} 
              className="absolute inset-0 w-full h-full object-cover grayscale-0 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
              alt={aotm.name}
            />

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30 group-hover:opacity-10 transition-opacity" />
            
            {/* Floating Role Tag inside Image */}
            <motion.div 
              whileHover={{ scale: 1.08 }}
              data-cms-doc="settings/aotm"
              data-cms-field="role"
              className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 bg-[#06D6A0] text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] lg:text-xs shadow-[4px_4px_0px_black] z-20 transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-[#FFD166]"
            >
              {aotm.role || "Lead Performer"}
            </motion.div>
          </div>
        </motion.div>

        {/* 💻 THE OVERLAPPING TERMINAL DATA BOX */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-8/12 relative z-20 lg:-ml-20 lg:mt-32"
        >
          <div className="bg-white text-black border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_#06D6A0] font-mono">
            
            <div className="flex items-center justify-between mb-8 border-b-4 border-dashed border-black pb-6">
              <span className="bg-black text-[#06D6A0] px-4 py-2 text-xs font-black uppercase tracking-[0.4em]">
                {isCardHovered ? "STAGE_MANAGER // SPOTLIGHT_ENGAGED" : "STAGE_MANAGER // SYS.PROFILE.LOADED"}
              </span>
              <span className={`font-mono font-bold text-xs uppercase tracking-widest hidden sm:inline-block animate-pulse ${isCardHovered ? "text-[#06D6A0]" : "text-[#FF5F5F]"}`}>
                {isCardHovered ? "[ SPOTLIGHT ACTIVE ⚡ ]" : "[ RECORDING ]"}
              </span>
            </div>

            {/* The Name */}
            <h2 
              data-cms-doc="settings/aotm"
              data-cms-field="name"
              className="text-5xl sm:text-6xl md:text-[5.5rem] font-black uppercase leading-[0.85] tracking-tighter mb-8 break-words text-black"
            >
              {aotm.name.split(' ')[0]} <br />
              <span className="text-[#FF5F5F] underline decoration-8 underline-offset-8 decoration-black">
                 {aotm.name.split(' ').slice(1).join(' ')}
              </span>
            </h2>

            {/* The Quote */}
            <div className="relative pl-6 border-l-8 border-[#06D6A0] mb-12">
              <p 
                data-cms-doc="settings/aotm"
                data-cms-field="citation"
                className="text-xl md:text-3xl font-bold leading-tight tracking-tight text-black"
              >
                "{aotm.citation || "Defining the future of theater."}"
              </p>
            </div>

            {/* The Stats Grid (Monospace Terminal Look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-4 border-black border-dashed">
              <div className="space-y-3">
                <h4 className="font-black uppercase text-xs text-white tracking-widest bg-black px-2 py-1 inline-block border-2 border-black">
                  &gt; KEY_ACHIEVEMENT
                </h4>
                <p 
                  data-cms-doc="settings/aotm"
                  data-cms-field="achievement"
                  className="font-bold text-sm md:text-base leading-relaxed text-black"
                >
                  {aotm.achievement || "N/A"}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-black uppercase text-xs text-black tracking-widest bg-[#FFD166] px-2 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_black]">
                  &gt; CORE_IMPACT
                </h4>
                <p 
                  data-cms-doc="settings/aotm"
                  data-cms-field="impact"
                  className="font-bold text-sm md:text-base leading-relaxed text-black"
                >
                  {aotm.impact || "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-12 flex flex-col sm:flex-row gap-4">
               <motion.a 
                 href={aotm.link || "#"} 
                 whileHover={{ scale: 1.02, x: 4 }}
                 whileTap={{ scale: 0.98 }}
                 transition={{ type: "spring", stiffness: 350, damping: 15 }}
                 className="flex-1 bg-black text-white border-4 border-black px-8 py-4 text-center font-black uppercase text-sm tracking-widest hover:bg-[#FFD166] hover:text-black hover:shadow-[6px_6px_0px_black] transition-all"
               >
                 [ VIEW_FULL_ARCHIVE ]
               </motion.a>
            </div>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}