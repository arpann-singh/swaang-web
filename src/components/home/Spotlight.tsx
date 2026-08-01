"use client";
import { motion } from "framer-motion";

export default function Spotlight({ aotm }: { aotm: any }) {
  if (!aotm) return null;

  return (
    <section className="py-24 md:py-40 px-6 bg-[#FFD166] border-b-[12px] border-[var(--border-primary)] relative overflow-hidden flex flex-col justify-center min-h-screen">
      
      {/* 🌪️ MULTI-ROW KINETIC MARQUEE BACKGROUND */}
      <div className="absolute inset-0 flex flex-col justify-center gap-12 opacity-[0.04] select-none pointer-events-none overflow-hidden">
        <motion.h2 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="text-[20vw] font-black uppercase leading-none whitespace-nowrap"
        >
          {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name}
        </motion.h2>
        <motion.h2 
          animate={{ x: [-2000, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="text-[20vw] font-black uppercase leading-none whitespace-nowrap"
        >
          {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name}
        </motion.h2>
        <motion.h2 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="text-[20vw] font-black uppercase leading-none whitespace-nowrap"
        >
          {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name}
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-12 lg:gap-0 mt-8">
        
        {/* 📸 SOLID BRUTALIST IMAGE CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-5/12 relative z-10 group cursor-pointer"
        >
          {/* Main Photo Box */}
          <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-black border-4 md:border-8 border-black shadow-[10px_10px_0px_#FF5F5F] md:shadow-[20px_20px_0px_#FF5F5F] overflow-hidden">
            
            {/* The Solid Image */}
            <img 
              src={aotm.photo} 
              className="absolute inset-0 w-full h-full object-cover grayscale-0 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
              alt={aotm.name}
            />

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30 group-hover:opacity-10 transition-opacity" />
            
            {/* Floating Role Tag inside Image */}
            <div className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 bg-[#06D6A0] text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] lg:text-xs shadow-[4px_4px_0px_black] z-20 transition-transform duration-300 group-hover:-translate-y-2">
              {aotm.role || "Lead Performer"}
            </div>
          </div>
        </motion.div>

        {/* 💻 THE OVERLAPPING TERMINAL DATA BOX */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-8/12 relative z-20 lg:-ml-20 lg:mt-32"
        >
          <div className="bg-[#2D2D2D] text-[#FFF9F0] border-4 md:border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_#06D6A0] md:shadow-[16px_16px_0px_#06D6A0]">
            
            <div className="flex items-center justify-between mb-8 border-b-4 border-dashed border-[#FFF9F0]/20 pb-6">
              <span className="bg-[#FF5F5F] text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] border-2 border-black shadow-[2px_2px_0px_black]">
                Hall of Fame
              </span>
              <span className="font-mono text-xs opacity-50 uppercase tracking-widest hidden sm:inline-block">
                // SYS.PROFILE.LOADED
              </span>
            </div>

            {/* The Name */}
            <h2 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black uppercase leading-[0.85] tracking-tighter mb-8 break-words">
              {aotm.name.split(' ')[0]} <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #FFF9F0' }}>
                 {aotm.name.split(' ').slice(1).join(' ')}
              </span>
            </h2>

            {/* The Quote */}
            <div className="relative pl-6 border-l-8 border-[#06D6A0] mb-12">
              <p className="text-xl md:text-3xl italic font-bold leading-tight tracking-tight text-[#FFF9F0]/90">
                "{aotm.citation || "Defining the future of theater."}"
              </p>
            </div>

            {/* The Stats Grid (Monospace Terminal Look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-4 border-[#FFF9F0]/10 font-mono">
              <div className="space-y-3">
                <h4 className="font-black uppercase text-[10px] text-[#FF5F5F] tracking-widest">
                  &gt; KEY_ACHIEVEMENT
                </h4>
                <p className="font-bold text-sm md:text-base leading-relaxed text-[#FFF9F0]/80">
                  {aotm.achievement || "N/A"}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-black uppercase text-[10px] text-[#06D6A0] tracking-widest">
                  &gt; CORE_IMPACT
                </h4>
                <p className="font-bold text-sm md:text-base leading-relaxed text-[#FFF9F0]/80">
                  {aotm.impact || "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-12 flex flex-col sm:flex-row gap-4">
               <a 
                 href={aotm.link || "#"} 
                 className="flex-1 bg-[#FFF9F0] text-black border-4 border-black px-8 py-4 text-center font-black uppercase text-xs md:text-sm tracking-widest hover:bg-[#FFD166] hover:-translate-y-1 hover:shadow-[6px_6px_0px_black] active:translate-y-0 active:shadow-none transition-all"
               >
                 View Full Archive →
               </a>
            </div>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}