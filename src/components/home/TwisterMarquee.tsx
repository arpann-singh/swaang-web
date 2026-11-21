"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

const twisters = [
  "RED LEATHER, YELLOW LEATHER",
  "UNIQUE NEW YORK, YOU KNOW YOU NEED NEW YORK",
  "SHE SELLS SEASHELLS BY THE SEASHORE",
  "A PROPER CUP OF COFFEE FROM A COPPER COFFEE POT",
  "SIX SLIPPERY SNAILS SLID SLOWLY SEAWARD",
  "PETER PIPER PICKED A PECK OF PICKLED PEPPERS",
];

export default function TwisterMarquee() {
  const [turboMode, setTurboMode] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={() => setTurboMode((t) => !t)}
      className={`py-4 sm:py-5 border-y-4 border-black overflow-hidden flex flex-col gap-2 whitespace-nowrap relative group cursor-pointer select-none transition-colors duration-300 ${
        turboMode ? "bg-[#FFD166]" : "bg-transparent"
      }`}
    >
      {/* Mobile & Desktop Interactive Challenge Bar */}
      <div className="flex items-center justify-center gap-2 px-4">
        <span
          className={`px-3 py-0.5 border-2 border-black font-mono font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_black] inline-flex items-center gap-1.5 ${
            turboMode ? "bg-[#FF5F5F] text-white" : "bg-black text-[#06D6A0]"
          }`}
        >
          <Mic size={11} />
          <span>
            {turboMode
              ? "🔥 2X TURBO DICTION CHALLENGE! SAY IT 3 TIMES FAST!"
              : "ACTOR VOCAL WARM-UP • TAP FOR 2X TURBO CHALLENGE"}
          </span>
        </span>
      </div>

      {/* 🎭 THE SCROLLING TRACK */}
      <motion.div
        key={turboMode ? "turbo" : "normal"}
        animate={{ x: [0, -1000] }}
        transition={{
          duration: turboMode ? 9 : 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex gap-10 sm:gap-12 items-center"
      >
        {[...twisters, ...twisters].map((text, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.08 }}
            className="text-black font-black uppercase italic text-xl sm:text-2xl tracking-tighter flex items-center gap-6 sm:gap-8 transition-colors hover:text-[#FF5F5F]"
          >
            {text}{" "}
            <motion.span
              animate={{ rotate: 360 }}
              transition={{
                duration: turboMode ? 3 : 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-[#FF5F5F] not-italic inline-block"
            >
              ★
            </motion.span>
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
}