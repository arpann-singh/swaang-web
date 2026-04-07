"use client";
import { motion } from "framer-motion";

export default function Spotlight({ aotm }: { aotm: any }) {
  if (!aotm) return null;

  return (
    <section className="py-40 px-6 bg-[#FFD166] border-b-[12px] border-[#2D2D2D] relative overflow-hidden">
      
      {/* 🎭 BACKGROUND KINETIC TEXT (The "Soul" of the section) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 whitespace-nowrap opacity-[0.03] select-none pointer-events-none">
        <motion.h2 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="text-[25vw] font-black uppercase leading-none"
        >
          {aotm.name} • {aotm.name} • {aotm.name} • {aotm.name}
        </motion.h2>
      </div>

      {/* 💡 STAGE LIGHT GRADIENT */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(255,255,255,0.4)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
        
        {/* 📸 IMAGE BOX WITH FLOATING BADGE */}
        <motion.div 
          initial={{ x: -80, opacity: 0, rotate: -2 }}
          whileInView={{ x: 0, opacity: 1, rotate: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-5/12 relative group"
        >
          {/* Brutalist Shadow */}
          <div className="absolute inset-0 bg-[#2D2D2D] translate-x-8 translate-y-8 rounded-[4rem]" />
          
          <div className="relative z-10 overflow-hidden border-8 border-[#2D2D2D] rounded-[4rem] bg-white">
            <img 
              src={aotm.photo} 
              className="w-full aspect-[4/5] object-cover grayscale-0 group-hover:grayscale group-hover:scale-105 transition-all duration-700 ease-in-out" 
              alt={aotm.name}
            />
            
            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Core Role Badge */}
            <div className="absolute bottom-10 left-10 bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-[6px_6px_0px_#2D2D2D] group-hover:-translate-y-2 transition-transform">
              {aotm.role || "Lead Performer"}
            </div>
          </div>

          {/* 🎖️ FLOATING RECORD BADGE */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-[#06D6A0] border-4 border-[#2D2D2D] rounded-full hidden lg:flex items-center justify-center p-4 text-center shadow-[4px_4px_0px_#2D2D2D] z-20"
          >
            <p className="font-black uppercase text-[10px] leading-tight text-[#2D2D2D]">
              Swaang Spotlight Member
            </p>
          </motion.div>
        </motion.div>

        {/* 📝 TEXT CONTENT SIDE */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-10 text-[#2D2D2D]">
          <div className="relative">
            <span className="bg-[#FF5F5F] text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] rounded-md shadow-[4px_4px_0px_#2D2D2D]">
              Hall of Fame
            </span>
            <h2 className="font-cinzel text-[5rem] md:text-[8rem] font-black uppercase leading-[0.85] tracking-tighter mt-6 relative">
              {aotm.name.split(' ')[0]} <br />
              <span className="text-transparent border-text-2" style={{ WebkitTextStroke: '3px #2D2D2D' }}>
                 {aotm.name.split(' ')[1]}
              </span>
            </h2>
          </div>

          <div className="relative pl-8 border-l-8 border-[#FF5F5F]">
            <p className="text-3xl md:text-5xl italic font-black leading-tight tracking-tight">
              "{aotm.citation || "Defining the future of theater."}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t-8 border-[#2D2D2D]">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#FF5F5F] rounded-full" />
                <h4 className="font-black uppercase text-xs tracking-widest opacity-40">Key Achievement</h4>
              </div>
              <p className="font-black text-2xl leading-tight">{aotm.achievement || "N/A"}</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-[#06D6A0] rounded-full" />
                <h4 className="font-black uppercase text-xs tracking-widest opacity-40">Core Impact</h4>
              </div>
              <p className="font-black text-2xl leading-tight">{aotm.impact || "N/A"}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap gap-6">
             <a 
               href={aotm.link || "#"} 
               className="group relative inline-block"
             >
               <div className="absolute inset-0 bg-[#2D2D2D] translate-x-2 translate-y-2 rounded-xl" />
               <div className="relative z-10 bg-white border-4 border-[#2D2D2D] px-10 py-5 font-black uppercase tracking-widest rounded-xl group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
                 View Full Profile →
               </div>
             </a>
             
             {/* Dynamic Share or Social Badge */}
             <div className="flex items-center gap-4 bg-black/5 px-6 py-3 rounded-full border-2 border-dashed border-[#2D2D2D]/20">
                <span className="text-xl">🏆</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Swaang Artist of the Month</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}