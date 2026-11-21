"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";

export default function FacultyBlueprint({ data }: { data?: any }) {
  const mentorName = data?.facultyName || "PROF. NAMRATA BHARGAVA";
  const mentorTitle = data?.facultyTitle || "FOUNDER'S VISION";
  const mentorQuote =
    data?.facultyQuote ||
    "EVERY STANDING OVATION IS A TESTAMENT TO THE STRUCTURE THAT HOLDS THE STAGE. SWAANG EXISTS BECAUSE OF YOUR UNWAVERING SUPPORT, YOUR STRATEGIC VISION, AND YOUR TIMELESS MENTORSHIP. YOU BELIEVED IN US BEFORE THE CURTAIN ROSE — AND THAT BELIEF MADE ALL THE DIFFERENCE.";
  const mentorImage = data?.facultyImage || "/faculty-backbone.jpg";
  const mentorBadge = data?.facultyBadge || "Founding Mentor";

  const [blueprintMode, setBlueprintMode] = useState(false);
  const [saluteCount, setSaluteCount] = useState(0);

  return (
    <section
      id="backbone"
      className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FFF9F0] bg-blueprint-grid relative overflow-hidden border-y-8 border-[var(--border-primary)]"
    >
      {/* 📐 ARCHITECTURAL RULER TICK BAR (Top & Bottom Blueprint Scale) */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-black/5 border-b-2 border-black/20 flex items-center justify-between px-4 font-mono text-[9px] font-black text-black/40 pointer-events-none select-none z-0 overflow-hidden">
        <span>00cm</span>
        <span>10cm // STAGE_AXIS_X</span>
        <span>20cm</span>
        <span className="hidden sm:inline">30cm // PROSCENIUM_ARCH</span>
        <span>40cm</span>
        <span className="hidden md:inline">50cm // BLUEPRINT_SCALE_1:100</span>
        <span>60cm</span>
      </div>

      {/* 🧭 ROTATING ARCHITECTURAL COMPASS RINGS IN BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-12 -right-24 w-80 h-80 rounded-full border-4 border-dashed border-[#06D6A0]/35 flex items-center justify-center"
        >
          <div className="w-52 h-52 rounded-full border-2 border-black/15" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border-4 border-dashed border-black/15"
        />
      </div>

      {/* 🏛️ BACKGROUND KINETIC TEXT -> HARSH RED STAMP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.075] z-0">
        <motion.h2
          initial={{ scale: 1.3, rotate: -18 }}
          whileInView={{ scale: 1, rotate: -12 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 180, damping: 16 }}
          className="text-[20vw] font-black uppercase leading-none whitespace-nowrap text-[#FF5F5F] border-[2vw] border-[#FF5F5F] p-8"
        >
          APPROVED
        </motion.h2>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-16 lg:gap-20">
          {/* LEFT SIDE: THE ARCHITECTURAL PHOTO & BADGE */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className="w-full lg:w-5/12 relative"
          >
            {/* Animated Architectural Blueprint Markers */}
            <motion.div
              animate={{ x: [0, -3, 0], y: [0, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 w-12 h-12 sm:w-16 sm:h-16 border-t-8 border-l-8 border-black z-20 pointer-events-none"
            />
            <motion.div
              animate={{ x: [0, 3, 0], y: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 sm:-bottom-8 sm:-right-8 w-12 h-12 sm:w-16 sm:h-16 border-b-8 border-r-8 border-black z-20 pointer-events-none"
            />

            <motion.div
              whileTap={{ scale: 0.98, rotate: blueprintMode ? 1 : -1 }}
              onClick={() => setBlueprintMode((b) => !b)}
              className={`border-6 sm:border-8 border-black p-3.5 sm:p-6 transition-all duration-300 relative cursor-pointer select-none ${
                blueprintMode
                  ? "bg-[#FFD166] shadow-[12px_12px_0px_#FF5F5F]"
                  : "bg-white shadow-[12px_12px_0px_black] sm:shadow-[16px_16px_0px_black]"
              }`}
            >
              {/* CSS Masking Tape */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 h-8 sm:h-10 bg-[#FFF9F0] border-2 border-black/30 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] -rotate-3 z-30 flex items-center justify-center">
                <span className="font-mono font-black text-[9px] uppercase tracking-widest text-black">
                  TAP PORTRAIT: {blueprintMode ? "ARCHIVAL LENS" : "STAGE COLOR"}
                </span>
              </div>

              <div className="relative group overflow-hidden h-[360px] sm:h-[420px] md:h-[530px] border-4 border-black bg-gray-100">
                <img
                  src={mentorImage}
                  alt={mentorName}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    blueprintMode
                      ? "grayscale contrast-125 scale-105"
                      : "grayscale-0 group-hover:grayscale"
                  }`}
                />

                {/* ID Overlay (Pillar of Swaang) */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-black text-[#06D6A0] border-4 border-black px-3 sm:px-4 py-1.5 sm:py-2 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[4px_4px_0px_#06D6A0]">
                  LOC: CHIEF_MENTOR
                </div>
              </div>
            </motion.div>

            {/* 🎖️ FOUNDING MENTOR MEDAL BADGE (Tap for Standing Ovation) */}
            <motion.button
              type="button"
              onClick={() => setSaluteCount((c) => c + 1)}
              whileTap={{ scale: 1.2, rotate: 12 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-2 md:-right-10 top-8 md:top-1/4 z-30 flex flex-col items-center gap-1.5 scale-90 md:scale-100 origin-right cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF5F5F] border-4 border-black rounded-full flex flex-col items-center justify-center p-2 text-center shadow-[4px_4px_0px_black]">
                <span className="text-2xl sm:text-3xl">🏆</span>
              </div>
              <div className="bg-[#FFD166] border-2 border-black px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase text-black tracking-widest whitespace-nowrap shadow-[2px_2px_0px_black]">
                {saluteCount > 0 ? `👏 OVATION ×${saluteCount}` : mentorBadge}
              </div>
            </motion.button>
          </motion.div>

          {/* RIGHT SIDE: THE EXECUTIVE SPECIFICATIONS */}
          <div className="w-full lg:w-7/12 space-y-8 sm:space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <p className="bg-[#FF5F5F] text-black border-4 border-black font-mono font-black uppercase tracking-[0.25em] text-[11px] sm:text-xs px-4 py-1.5 shadow-[4px_4px_0px_black] inline-block mb-5">
                // EXECUTIVE_FOUNDATION //
              </p>

              <h2 className="text-[13vw] sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-black leading-[0.85]">
                THE <br />
                <span
                  className="text-[#06D6A0]"
                  style={{ WebkitTextStroke: "2.5px black" }}
                >
                  BACKBONE
                </span>
              </h2>

              {/* LARGE, READABLE AUTHORITATIVE NAME */}
              <motion.h4
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileTap={{ scale: 0.98 }}
                className="text-lg sm:text-3xl md:text-4xl font-mono font-black uppercase tracking-wider sm:tracking-widest text-black mt-7 sm:mt-10 leading-tight relative bg-[#FFD166] border-4 border-black p-4 shadow-[6px_6px_0px_black] sm:shadow-[8px_8px_0px_black] inline-block w-full max-w-xl"
              >
                {mentorName}
                <span className="font-black text-xs sm:text-sm block mt-1.5 text-[#FF5F5F]">
                  {mentorTitle}
                </span>
              </motion.h4>
            </motion.div>

            {/* PURE TRIBUTE QUOTE */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              whileTap={{ scale: 0.99 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 18 }}
              className="relative bg-white border-6 sm:border-8 border-black p-6 sm:p-8 shadow-[10px_10px_0px_black] sm:shadow-[12px_12px_0px_black] mt-8 sm:mt-12 max-w-2xl"
            >
              <motion.div
                initial={{ scale: 1.6, rotate: -15 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="absolute -top-5 -left-4 sm:-top-6 sm:-left-6 bg-[#FF5F5F] border-4 border-black w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shadow-[4px_4px_0px_black]"
              >
                <span className="font-mono font-black text-2xl text-white">&ldquo;</span>
              </motion.div>
              <p className="text-sm sm:text-lg md:text-xl font-mono font-bold text-black leading-relaxed">
                {mentorQuote}
              </p>
            </motion.div>

            {/* AUTHORIZATION CREDENTIAL + STANDING OVATION BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-6 sm:pt-8 flex flex-wrap items-center justify-between gap-4 border-t-8 border-black mt-8 sm:mt-12"
            >
              <p className="font-mono font-black text-[11px] sm:text-xs uppercase tracking-widest text-black bg-[#06D6A0] border-4 border-black px-4 py-2.5 shadow-[4px_4px_0px_black]">
                WITH DEEPEST GRATITUDE FOR ENGINEERING THE STAGE.
              </p>

              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setSaluteCount((c) => c + 1)}
                className="bg-black text-[#FFD166] border-4 border-black px-4 py-2.5 font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#FF5F5F] flex items-center gap-2"
              >
                <Sparkles size={14} className="text-[#FF5F5F]" />
                <span>
                  {saluteCount > 0
                    ? `STANDING OVATION (${saluteCount})`
                    : "GIVE STANDING OVATION"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}