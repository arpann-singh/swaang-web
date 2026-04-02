"use client";
import { motion } from "framer-motion";

export default function Spotlight({ aotm }: { aotm: any }) {
  if (!aotm) return null;

  return (
    <section className="py-40 px-6 bg-[#FFD166] border-b-[12px] border-[#2D2D2D] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_0%,_transparent_70%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-16 relative z-10">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="w-full lg:w-5/12 relative group"
        >
          <div className="absolute inset-0 bg-[#2D2D2D] translate-x-6 translate-y-6 rounded-[3rem]" />
          <div className="relative z-10 overflow-hidden border-8 border-[#2D2D2D] rounded-[3rem]">
            <img 
              src={aotm.photo} 
              className="w-full aspect-[3/4] object-cover grayscale hover:grayscale-0 transition-all duration-700" 
              alt={aotm.name}
            />
            {/* 🏷️ FIXED: Badge now shows CORE ROLE instead of date */}
            <div className="absolute bottom-8 left-8 bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] px-6 py-2 rounded-xl font-black uppercase text-sm shadow-[4px_4px_0px_#2D2D2D]">
              {aotm.role || "Lead Performer"}
            </div>
          </div>
        </motion.div>

        <div className="w-full lg:w-7/12 flex flex-col justify-center space-y-8 text-[#2D2D2D]">
          <div>
            <span className="text-[#FF5F5F] font-black uppercase tracking-[0.3em] text-sm">Artist of the Month</span>
            <h2 className="font-cinzel text-7xl md:text-9xl font-black uppercase leading-none tracking-tighter mt-2">
              {aotm.name}
            </h2>
          </div>

          <div className="relative">
            <span className="absolute -top-10 -left-6 text-[12rem] font-black opacity-10 leading-none">“</span>
            <p className="text-3xl md:text-4xl italic font-bold leading-tight relative z-10">
              {aotm.citation || "Their vision on the stage redefined Swaang's legacy."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t-4 border-[#2D2D2D]/10">
            <div className="space-y-2">
              <h4 className="font-black uppercase text-xs opacity-50 tracking-widest">Key Achievement</h4>
              <p className="font-bold text-xl">{aotm.achievement || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-black uppercase text-xs opacity-50 tracking-widest">Core Impact</h4>
              <p className="font-bold text-xl">{aotm.impact || "N/A"}</p>
            </div>
          </div>

          <div className="pt-4">
             <a 
               href={aotm.link || "#"} 
               target="_blank" 
               className="inline-block bg-white border-4 border-[#2D2D2D] px-8 py-3 font-black uppercase shadow-[6px_6px_0px_#2D2D2D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
             >
               About Artist →
             </a>
          </div>
        </div>
      </div>
    </section>
  );
}
