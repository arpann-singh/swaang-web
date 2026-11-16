"use client";
import { motion } from "framer-motion";

interface SectionDividerProps {
  number?: string;
  title?: string;
  tagline?: string;
  variant?: "caution" | "protest" | "chalk";
}

export default function SectionDivider({ 
  number = "ACT // 02", 
  title = "SCENE BREAK", 
  tagline = "THE STREET IS OUR STAGE // DO NOT CROSS UNLESS READY",
  variant = "caution"
}: SectionDividerProps) {
  return (
    <div className="w-full relative py-12 md:py-16 overflow-hidden select-none pointer-events-none">
      
      {/* ⚠️ DIAGONAL BARRICADE CAUTION TAPE 1 (Tilts Left) */}
      <motion.div 
        initial={{ x: "-10%", opacity: 0 }}
        whileInView={{ x: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[120%] -ml-[10%] bg-[#FFD166] border-y-4 border-black py-2.5 transform -rotate-1 shadow-[0_6px_0px_black] relative z-10 flex items-center overflow-hidden"
      >
        <div className="flex whitespace-nowrap animate-marquee font-mono font-black text-xs md:text-sm uppercase tracking-[0.25em] text-black">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-4 mx-4">
              <span className="text-[#FF5F5F] font-black">///</span>
              <span>⚠️ SCENE TRANSITION</span>
              <span className="text-[#FF5F5F] font-black">///</span>
              <span>DO NOT SILENCE THE VOICE</span>
              <span className="text-[#FF5F5F] font-black">///</span>
              <span>NUKKAD NATAK IN PROGRESS</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* 📢 CENTER NEO-BRUTALIST SCENE STAMP / BADGE */}
      <div className="relative z-20 flex justify-center -my-5 pointer-events-auto">
        <motion.div 
          initial={{ scale: 0.8, rotate: -6, opacity: 0 }}
          whileInView={{ scale: 1, rotate: -2, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="bg-black text-white border-4 border-black px-6 md:px-10 py-3 md:py-4 shadow-[8px_8px_0px_#FF5F5F] flex items-center gap-4 cursor-default transform hover:rotate-0 hover:scale-105 transition-all"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF5F5F] border-2 border-black flex items-center justify-center text-lg md:text-xl font-black text-black shrink-0 shadow-[2px_2px_0px_white]">
            📢
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-[#06D6A0]">
              {number}
            </span>
            <h3 className="font-cinzel text-xl md:text-3xl font-black uppercase tracking-tight text-[#FFF9F0] leading-none mt-0.5">
              {title}
            </h3>
            {tagline && (
              <span className="font-mono text-[8px] md:text-[9px] uppercase tracking-widest text-gray-400 mt-1 hidden sm:block">
                {tagline}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* ⚠️ REVERSE BARRICADE CAUTION TAPE 2 (Tilts Right) */}
      <motion.div 
        initial={{ x: "10%", opacity: 0 }}
        whileInView={{ x: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="w-[120%] -ml-[10%] bg-[#FF5F5F] border-y-4 border-black py-2 transform rotate-1 shadow-[0_6px_0px_black] relative z-0 flex items-center overflow-hidden"
      >
        <div className="flex whitespace-nowrap animate-marquee-reverse font-mono font-black text-[11px] md:text-xs uppercase tracking-[0.25em] text-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-4 mx-4">
              <span className="text-black font-black">///</span>
              <span>बोल कि लब आज़ाद हैं तेरे</span>
              <span className="text-black font-black">///</span>
              <span>SSTC STREET ENSEMBLE</span>
              <span className="text-black font-black">///</span>
              <span>STAGE // STREET // REVOLUTION</span>
            </span>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
