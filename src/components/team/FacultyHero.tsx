"use client";
import BrutalistReveal from "@/components/ui/BrutalistReveal";
import { motion } from "framer-motion";

export default function FacultyHero({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="w-full relative z-10 mb-16">
      <BrutalistReveal direction="up" className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12 bg-white border-8 border-black p-4 md:p-8 shadow-[12px_12px_0px_black] hover:shadow-[16px_16px_0px_#06D6A0] transition-shadow duration-300">
          
          {/* LEFT: THE COMPACT PHOTO */}
          <div className="w-full md:w-1/3 lg:w-1/4 shrink-0 relative group">
            {/* Masking Tape */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/90 border-2 border-black shadow-sm rotate-3 z-30 flex items-center justify-center">
                <span className="font-black uppercase tracking-[0.2em] text-[8px] px-2 text-black">
                   COORDINATOR
                </span>
            </div>
            
            <div className="relative overflow-hidden bg-gray-100 aspect-square border-4 border-black">
              <img 
                src={data.image || "/faculty-placeholder.jpg"} 
                alt="Faculty Coordinator" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Typewriter ID Tag */}
              <div className="absolute -bottom-2 -right-2 bg-black text-white border-4 border-black px-3 py-1 font-mono font-black uppercase text-[9px] tracking-widest shadow-[4px_4px_0px_black] -rotate-3 group-hover:animate-glitch transition-transform cursor-crosshair">
                ID: {data.role || "FAC_01"}
              </div>
            </div>
          </div>

          {/* RIGHT: TEXT & INFO */}
          <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
            
            <div className="flex flex-wrap items-center gap-4 mb-4">
               <span className="bg-[#FF5F5F] text-black px-3 py-1 border-4 border-black font-black uppercase text-[10px] tracking-[0.2em] shadow-[4px_4px_0px_black] inline-block -rotate-1">
                 FACULTY COORDINATOR
               </span>
               <h4 className="font-mono font-black uppercase text-[10px] tracking-widest text-black/40">Clearance: <span className="text-black">MAXIMUM</span></h4>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-black leading-[0.9] font-cinzel break-words group-hover:text-[#FF5F5F] transition-colors mb-6">
              {data.name || "Prof. Name"}
            </h2>

            {/* The Quote Block */}
            <div className="bg-[#FFD166] border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_black] relative mt-auto">
              <div className="absolute -top-4 -left-2 text-5xl text-black font-cinzel opacity-20 rotate-12">"</div>
              <p className="text-lg md:text-xl font-bold text-black leading-tight font-mono uppercase tracking-tight relative z-10 italic">
                {data.citation || "Guiding the visionaries of tomorrow."}
              </p>
              
              {/* APPROVED STAMP */}
              <div className="absolute -bottom-4 -right-4 rotate-[-15deg] opacity-90 pointer-events-none z-30 mix-blend-multiply">
                <div className="border-4 border-[#E4405F] text-[#E4405F] p-1 bg-white/50 backdrop-blur-sm">
                  <div className="border-2 border-[#E4405F] px-2 py-1 font-black uppercase tracking-widest text-xs font-mono">
                    APPROVED
                  </div>
                </div>
              </div>
            </div>

          </div>

      </BrutalistReveal>
    </div>
  );
}