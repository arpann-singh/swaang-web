"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";

export default function Spotlight({ aotm }: { aotm: any }) {
  const [isSpotlightOn, setIsSpotlightOn] = useState(false);

  if (!aotm) return null;

  return (
    <section className="py-20 md:py-40 px-4 sm:px-6 bg-transparent border-b-8 border-black relative overflow-hidden flex flex-col justify-center min-h-screen">
      {/* 🎭 THEATRICAL SPOTLIGHT CURTAIN DIMMER (Works on Mobile Toggle & Desktop Hover) */}
      <div
        className={`absolute inset-0 bg-[#0F051D]/75 pointer-events-none z-0 transition-opacity duration-700 ${
          isSpotlightOn ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 💡 FOCUSED STAGE BEAM ON ACTOR */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 ${
          isSpotlightOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle 480px at 50% 35%, rgba(255, 209, 102, 0.34) 0%, rgba(255, 95, 95, 0.14) 45%, transparent 78%)",
        }}
      />

      {/* 🌪️ MULTI-ROW KINETIC MARQUEE BACKGROUND */}
      <div
        className={`absolute inset-0 flex flex-col justify-center gap-16 select-none pointer-events-none overflow-hidden transition-opacity duration-500 ${
          isSpotlightOn ? "opacity-[0.02]" : "opacity-[0.04]"
        }`}
      >
        <motion.h2
          animate={{ x: [0, -1800] }}
          transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
          className="text-[16vw] md:text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          PROTAGONIST // PROTAGONIST // PROTAGONIST // PROTAGONIST
        </motion.h2>
        <motion.h2
          animate={{ x: [-1800, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="text-[16vw] md:text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          LEAD // LEAD // LEAD // LEAD // LEAD // LEAD
        </motion.h2>
        <motion.h2
          animate={{ x: [0, -1800] }}
          transition={{ duration: 42, repeat: Infinity, ease: "linear" }}
          className="text-[16vw] md:text-[15vw] font-black font-mono uppercase leading-none whitespace-nowrap"
        >
          PROTAGONIST // PROTAGONIST // PROTAGONIST // PROTAGONIST
        </motion.h2>
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 sm:gap-12 lg:gap-0 mt-4 sm:mt-8">
        {/* 📸 SOLID BRUTALIST IMAGE CONTAINER WITH STAGE SPOTLIGHT HOVER & TAP */}
        <motion.div
          initial={{ opacity: 0, y: 45, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          onMouseEnter={() => setIsSpotlightOn(true)}
          onMouseLeave={() => setIsSpotlightOn(false)}
          onClick={() => setIsSpotlightOn((prev) => !prev)}
          whileHover={{ scale: 1.03, rotate: -1.5 }}
          whileTap={{ scale: 0.97, rotate: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 16 }}
          className="w-full lg:w-5/12 relative z-10 group cursor-pointer select-none"
        >
          {/* Mobile Spotlight Switch Floating Badge */}
          <div className="absolute -top-4 right-4 z-30 bg-[#FFD166] text-black border-2 border-black px-3 py-1 font-mono font-black text-[10px] uppercase tracking-wider shadow-[3px_3px_0px_black] flex items-center gap-1.5">
            <Zap size={12} className="text-[#FF5F5F] fill-current" />
            <span>{isSpotlightOn ? "SPOTLIGHT: ON" : "TAP FOR SPOTLIGHT"}</span>
          </div>

          {/* Main Photo Box */}
          <div
            className={`relative w-full aspect-[3/4] md:aspect-[4/5] bg-black border-6 md:border-8 border-black transition-shadow duration-300 overflow-hidden ${
              isSpotlightOn
                ? "shadow-[14px_14px_0px_#FFD166] md:shadow-[24px_24px_0px_#FFD166]"
                : "shadow-[10px_10px_0px_#FF5F5F] md:shadow-[20px_20px_0px_#FF5F5F]"
            }`}
          >
            {/* The Solid Image */}
            <img
              src={aotm.photo}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                isSpotlightOn ? "scale-105" : "scale-100 group-hover:scale-105"
              }`}
              alt={aotm.name}
            />

            {/* CRT Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.12)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30 group-hover:opacity-10 transition-opacity" />

            {/* Floating Role Tag inside Image */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute bottom-4 left-4 lg:bottom-6 lg:left-6 border-2 border-black px-4 py-2 font-black uppercase text-[10px] lg:text-xs shadow-[4px_4px_0px_black] z-20 transition-all duration-300 ${
                isSpotlightOn ? "bg-[#FFD166] text-black" : "bg-[#06D6A0] text-black"
              }`}
            >
              ★ {aotm.role || "Lead Performer"}
            </motion.div>
          </div>
        </motion.div>

        {/* 💻 THE OVERLAPPING TERMINAL DATA BOX */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 18 }}
          className="w-full lg:w-8/12 relative z-20 lg:-ml-20 lg:mt-32"
        >
          <div className="bg-white text-black border-6 sm:border-8 border-black p-6 sm:p-8 md:p-12 shadow-[12px_12px_0px_#06D6A0] sm:shadow-[16px_16px_0px_#06D6A0] font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8 border-b-4 border-dashed border-black pb-5">
              <span className="bg-black text-[#06D6A0] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.35em]">
                {isSpotlightOn
                  ? "STAGE_MANAGER // SPOTLIGHT_ENGAGED"
                  : "STAGE_MANAGER // ARTIST_OF_THE_MONTH"}
              </span>

              <button
                type="button"
                onClick={() => setIsSpotlightOn((prev) => !prev)}
                className={`font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 border-2 border-black shadow-[2px_2px_0px_black] transition-all flex items-center gap-1.5 ${
                  isSpotlightOn
                    ? "bg-[#FFD166] text-black"
                    : "bg-[#FF5F5F] text-white"
                }`}
              >
                <Sparkles size={12} />
                <span>{isSpotlightOn ? "BEAM ACTIVE" : "ENGAGE BEAM"}</span>
              </button>
            </div>

            {/* The Name */}
            <h2 className="text-4xl sm:text-6xl md:text-[5.5rem] font-black uppercase leading-[0.88] tracking-tighter mb-6 sm:mb-8 break-words text-black">
              {aotm.name.split(" ")[0]} <br />
              <span className="text-[#FF5F5F] underline decoration-4 sm:decoration-8 underline-offset-4 sm:underline-offset-8 decoration-black">
                {aotm.name.split(" ").slice(1).join(" ")}
              </span>
            </h2>

            {/* The Quote */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative pl-4 sm:pl-6 border-l-6 sm:border-l-8 border-[#06D6A0] mb-8 sm:mb-12"
            >
              <p className="text-base sm:text-xl md:text-3xl font-bold leading-snug tracking-tight text-black">
                &ldquo;{aotm.citation || "Defining the future of theater."}&rdquo;
              </p>
            </motion.div>

            {/* The Stats Grid (Monospace Terminal Look) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t-4 border-black border-dashed">
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="space-y-2.5 bg-[#FFF9F0] border-2 border-black p-4 shadow-[4px_4px_0px_black]"
              >
                <h4 className="font-black uppercase text-xs text-white tracking-widest bg-black px-2.5 py-1 inline-block border-2 border-black">
                  &gt; KEY_ACHIEVEMENT
                </h4>
                <p className="font-bold text-xs sm:text-sm md:text-base leading-relaxed text-black">
                  {aotm.achievement || "N/A"}
                </p>
              </motion.div>

              <motion.div
                whileTap={{ scale: 0.98 }}
                className="space-y-2.5 bg-[#FFF9F0] border-2 border-black p-4 shadow-[4px_4px_0px_black]"
              >
                <h4 className="font-black uppercase text-xs text-black tracking-widest bg-[#FFD166] px-2.5 py-1 inline-block border-2 border-black shadow-[2px_2px_0px_black]">
                  &gt; CORE_IMPACT
                </h4>
                <p className="font-bold text-xs sm:text-sm md:text-base leading-relaxed text-black">
                  {aotm.impact || "N/A"}
                </p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 sm:pt-10 flex flex-col sm:flex-row gap-4">
              <motion.a
                href={aotm.link || "/team"}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                className="flex-1 bg-black text-white border-4 border-black px-6 sm:px-8 py-4 text-center font-black uppercase text-xs sm:text-sm tracking-widest hover:bg-[#FFD166] hover:text-black shadow-[6px_6px_0px_#FF5F5F] transition-all"
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