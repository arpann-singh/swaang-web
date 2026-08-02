"use client";
import { motion } from "framer-motion";

export default function Spotlight({ aotm }: { aotm: any }) {
  if (!aotm) return null;

  return (
    <section className="py-24 md:py-40 px-6 bg-transparent border-b-8 border-black relative overflow-hidden flex flex-col justify-center min-h-screen">
      
      {/* 🌪️ MULTI-ROW KINETIC MARQUEE BACKGROUND */}
      <div className="absolute inset-0 flex flex-col justify-center gap-16 opacity-[0.03] select-none pointer-events-none overflow-hidden">
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
          <div className="bg-white text-black border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_#06D6A0] font-mono">
            
            <div className="flex items-center justify-between mb-8 border-b-4 border-dashed border-black pb-6">
              <span className="bg-black text-[#06D6A0] px-4 py-2 text-xs font-black uppercase tracking-[0.4em]">
                STAGE_MANAGER // SYS.PROFILE.LOADED
              </span>
              <span className="font-mono font-bold text-xs uppercase tracking-widest hidden sm:inline-block animate-pulse text-[#FF5F5F]">
                [ RECORDING ]
              </span>
            </div>

            {/* The Name */}
            <h2 className="text-5xl sm:text-6xl md:text-[5.5rem] font-black uppercase leading-[0.85] tracking-tighter mb-8 break-words text-black">
              {aotm.name.split(' ')[0]} <br />
              <span className="text-[#FF5F5F] underline decoration-8 underline-offset-8 decoration-black">
                 {aotm.name.split(' ').slice(1).join(' ')}
              </span>
            </h2>

            {/* The Quote */}
            <div className="relative pl-6 border-l-8 border-[#06D6A0] mb-12">
              <p className="text-xl md:text-3xl font-bold leading-tight tracking-tight text-black">
                "{aotm.citation || "Defining the future of theater."}"
              </p>
            </div>

            {/* The Stats Grid (Monospace Terminal Look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t-4 border-black border-dashed">
              <div className="space-y-3">
                <h4 className="font-black uppercase text-xs text-white tracking-widest bg-black px-2 py-1 inline-block border-2 border-black">
                  &gt; KEY_ACHIEVEMENT
                </h4>
                <p className="font-bold text-sm md:text-base leading-relaxed text-black">
                  {aotm.achievement || "N/A"}
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-black uppercase text-xs text-black tracking-widest bg-[#FFD166] px-2 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_black]">
                  &gt; CORE_IMPACT
                </h4>
                <p className="font-bold text-sm md:text-base leading-relaxed text-black">
                  {aotm.impact || "N/A"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-12 flex flex-col sm:flex-row gap-4">
               <a 
                 href={aotm.link || "#"} 
                 className="flex-1 bg-black text-white border-4 border-black px-8 py-4 text-center font-black uppercase text-sm tracking-widest hover:bg-[#FFD166] hover:text-black hover:shadow-[4px_4px_0px_black] transition-all"
               >
                 [ VIEW_FULL_ARCHIVE ]
               </a>
            </div>

          </div>
        </motion.div>
        
      </div>
    </section>
  );
}