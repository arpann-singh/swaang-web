"use client";
import { motion } from "framer-motion";

const twisters = [
  "RED LEATHER, YELLOW LEATHER",
  "UNIQUE NEW YORK, YOU KNOW YOU NEED NEW YORK",
  "SHE SELLS SEASHELLS BY THE SEASHORE",
  "A PROPER CUP OF COFFEE FROM A COPPER COFFEE POT",
  "SIX SLIPPERY SNAILS SLID SLOWLY SEAWARD",
  "PETER PIPER PICKED A PECK OF PICKLED PEPPERS",
];

export default function TwisterMarquee() {
  return (
    <div className="bg-[#2D2D2D] py-4 border-y-4 border-[#2D2D2D] overflow-hidden flex whitespace-nowrap relative group">
      {/* 🎭 THE SCROLLING TRACK */}
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-12 items-center"
      >
        {[...twisters, ...twisters].map((text, i) => (
          <span 
            key={i} 
            className="text-[#FFD166] font-black uppercase italic text-2xl tracking-tighter flex items-center gap-8"
          >
            {text} <span className="text-[#FF5F5F] not-italic">★</span>
          </span>
        ))}
      </motion.div>

      {/* Hover Overlay Message */}
      <div className="absolute inset-0 bg-[#FF5F5F] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <p className="text-white font-black uppercase tracking-[0.5em] text-sm animate-pulse">
          Can you say it 3 times fast? 🎤
        </p>
      </div>
    </div>
  );
}