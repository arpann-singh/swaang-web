"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

export default function FounderNote({ data }: { data: any }) {
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const founders = [
    {
      role: "Founder & Director",
      name: data?.founderName,
      note: data?.founderNote,
      img: data?.founderImage,
      color: "bg-[#FF5F5F]",
      postIt: "bg-[#FFD166]",
    },
    {
      role: "Co-Founder",
      name: data?.coFounder1Name,
      note: data?.coFounder1Note,
      img: data?.coFounder1Image,
      color: "bg-[#06D6A0]",
      postIt: "bg-[#06D6A0]",
    },
    {
      role: "Co-Founder",
      name: data?.coFounder2Name,
      note: data?.coFounder2Note,
      img: data?.coFounder2Image,
      color: "bg-[#FFD166]",
      postIt: "bg-[#FF5F5F]",
    },
  ];

  const DirectorCardDesktop = ({ name, note, img, color, role, index }: any) => {
    const cardRotations = ["-rotate-2", "rotate-1", "-rotate-1"];
    const hoverRotations = ["hover:rotate-0", "hover:-rotate-1", "hover:rotate-1"];
    const postItRotations = ["rotate-6", "-rotate-6", "rotate-3"];
    const postItColors = ["bg-[#FFD166]", "bg-[#06D6A0]", "bg-[#FF5F5F]"];

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.2}
        whileDrag={{ scale: 1.04, rotate: 0, zIndex: 50, cursor: "grabbing" }}
        whileHover={{ cursor: "grab" }}
        className={`relative group flex flex-col h-full transition-transform duration-300 ${cardRotations[index]} ${hoverRotations[index]}`}
      >
        {/* 📸 STACKED PAPER EFFECT (Brutalist Layer) */}
        <div className="absolute inset-0 bg-black translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-all" />

        {/* 🎭 MAIN CONTENT CARD (Folder) */}
        <div className="bg-[#FFF9F0] border-8 border-black p-6 md:p-8 h-full flex flex-col shadow-[8px_8px_0px_black]">
          {/* Top Masking Tape with Drag Hint */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 h-10 bg-white/90 backdrop-blur-sm border-2 border-black/30 shadow-sm -rotate-3 z-30 opacity-95 mix-blend-multiply flex items-center justify-center gap-1 group-hover:bg-[#FFD166] transition-colors">
            <span className="font-mono font-bold text-[9px] uppercase tracking-wider text-black select-none">
              📌 DRAG TO TEST
            </span>
          </div>

          {/* Corner Masking Tape */}
          <div className="absolute -bottom-4 -left-4 w-20 h-8 bg-white/80 backdrop-blur-sm border-2 border-black/20 shadow-sm rotate-45 z-30 opacity-90 mix-blend-multiply" />

          {/* POLAROID FRAME */}
          <div className="relative mb-12 bg-white border-4 border-black p-4 pb-12 shadow-[4px_4px_0px_black] transform group-hover:scale-[1.02] transition-transform duration-300 z-20">
            <div className={`absolute inset-0 ${color} opacity-20 -z-10`} />

            <div className="relative aspect-square w-full border-4 border-black overflow-hidden bg-gray-200 transition-all duration-700">
              {img ? (
                <img
                  src={img}
                  className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-all duration-700 pointer-events-none"
                  alt={name}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-mono font-black text-black opacity-30 text-2xl uppercase -rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]">
                  MISSING
                </div>
              )}
            </div>

            {/* Overlapping Post-it Note */}
            <div
              className={`absolute -right-8 -top-8 w-24 h-24 ${postItColors[index]} border-4 border-black shadow-[4px_4px_0px_black] ${postItRotations[index]} p-3 flex flex-col justify-center items-center z-40 transform group-hover:rotate-12 transition-transform`}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black shadow-inner" />
              <span className="font-cinzel font-black uppercase text-center leading-none text-black text-[12px] mt-2 select-none">
                EST.
                <br />
                2014
              </span>
            </div>

            {/* Role Tag (Typewriter Tape) */}
            <div className="absolute -bottom-6 -left-6 bg-black text-white border-4 border-black px-4 py-2 font-mono font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_black] z-40 -rotate-3 select-none">
              {role}
            </div>
          </div>

          {/* FOUNDER QUOTE / NOTE */}
          <div className="space-y-4 flex-1 mt-4 relative z-10 select-none">
            <div className="flex flex-col gap-2 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black] relative">
              <div className="absolute -top-4 -right-2 text-6xl text-black opacity-10 font-serif">
                &ldquo;
              </div>
              <h4 className="text-xl md:text-2xl font-black uppercase tracking-widest text-black leading-none border-b-4 border-black pb-2 mb-2">
                {name || "DIRECTOR"}
              </h4>
              <p className="text-sm font-mono font-bold text-black leading-relaxed uppercase relative z-10">
                {note || "THE STAGE IS WHERE WE FIND OUR TRUEST SELVES."}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="py-20 md:py-40 px-4 sm:px-6 bg-[#FFF9F0] bg-diagonal-hatch border-b-8 border-black relative overflow-hidden">
      {/* 🎞️ FLOATING CUTTING-ROOM POLAROID SILHOUETTES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [-12, -6, -12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 -right-8 w-36 h-44 border-4 border-black/15 bg-[#FFD166]/20 p-2 pb-8"
        >
          <div className="w-full h-full border-2 border-black/10" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [10, 16, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-14 -left-10 w-36 h-44 border-4 border-black/15 bg-[#FF5F5F]/15 p-2 pb-8"
        >
          <div className="w-full h-full border-2 border-black/10" />
        </motion.div>
      </div>

      {/* 🏙️ ANIMATED CASTING CALL WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-16 pointer-events-none opacity-10 overflow-hidden -rotate-3 z-0">
        <motion.h1
          animate={{ x: ["0%", "-40%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="text-[14vw] md:text-[12vw] font-black uppercase whitespace-nowrap leading-none text-black"
        >
          CASTING CALL // CASTING CALL // CASTING CALL // CASTING CALL //
        </motion.h1>
        <motion.h1
          animate={{ x: ["-40%", "0%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="text-[14vw] md:text-[12vw] font-black uppercase whitespace-nowrap leading-none text-black -ml-40"
        >
          AUDITION TAPES // AUDITION TAPES // AUDITION TAPES //
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mb-12 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8 sm:pb-10"
        >
          <div className="max-w-3xl">
            <span className="bg-black text-[#FFD166] px-5 py-2 border-4 border-black font-mono font-black uppercase text-[11px] sm:text-[12px] tracking-[0.25em] shadow-[6px_6px_0px_#FF5F5F] mb-5 inline-block">
              EXECUTIVE BOARD
            </span>
            <h2 className="text-[12vw] sm:text-7xl md:text-[6rem] lg:text-[7.5rem] font-black uppercase tracking-tighter text-black leading-[0.85] whitespace-nowrap mt-2">
              THE <br />{" "}
              <span className="text-white" style={{ WebkitTextStroke: "2px black" }}>
                FOUNDERS
              </span>
            </h2>
          </div>
          <p className="md:max-w-xs font-mono font-black text-xs sm:text-sm uppercase tracking-widest text-black bg-white border-4 border-black p-4 shadow-[6px_6px_0px_black] leading-relaxed">
            THE CREATIVE VISIONARIES WHO LAID THE FOUNDATION FOR SWAANG&apos;S DRAMATIC LEGACY.
          </p>
        </motion.div>

        {/* ========================================= */}
        {/* DESKTOP VIEW: SCRAPBOOK GRID              */}
        {/* ========================================= */}
        <div className="hidden md:grid md:grid-cols-3 gap-10 lg:gap-14 pt-10 pb-16">
          {founders.map((founder, i) => (
            <DirectorCardDesktop key={i} index={i} {...founder} />
          ))}
        </div>

        {/* ========================================= */}
        {/* MOBILE VIEW: INTERACTIVE DOSSIER DECK     */}
        {/* ========================================= */}
        <div className="md:hidden w-full max-w-sm mx-auto">
          {/* Top Dossier Quick-Jump Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {founders.map((f, idx) => {
              const isSelected = activeCardIndex === idx;
              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setActiveCardIndex(idx)}
                  className={`py-2 px-2 border-4 border-black font-mono font-black text-[10px] uppercase transition-all truncate ${
                    isSelected
                      ? "bg-[#FFD166] text-black shadow-[4px_4px_0px_black] -translate-y-0.5"
                      : "bg-white text-black/70"
                  }`}
                >
                  0{idx + 1}. {(f.name || f.role).split(" ")[0]}
                </motion.button>
              );
            })}
          </div>

          <div className="relative min-h-[580px] w-full py-4">
            <AnimatePresence>
              {founders.map((item, index) => {
                const isPast = index < activeCardIndex;
                const offsetIndex = index - activeCardIndex;

                if (isPast || offsetIndex > 2) return null;

                const zIndex = 40 - offsetIndex;
                const scale = 1 - offsetIndex * 0.05;
                const yOffset = offsetIndex * 18;

                const rotations = [-1.5, 1.5, -1];
                const baseRotation = rotations[index % rotations.length];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: yOffset + 80, scale: 0.85 }}
                    animate={{
                      opacity: 1,
                      y: yOffset,
                      scale,
                      zIndex,
                      rotate: baseRotation,
                    }}
                    exit={{
                      opacity: 0,
                      x: "-120%",
                      rotate: -22,
                      transition: { duration: 0.4, ease: "easeIn" },
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    drag={offsetIndex === 0 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.65}
                    onDragEnd={(_e, info) => {
                      if (
                        offsetIndex === 0 &&
                        (info.offset.x < -55 || info.velocity.x < -240)
                      ) {
                        setActiveCardIndex((prev) => prev + 1);
                      } else if (
                        offsetIndex === 0 &&
                        activeCardIndex > 0 &&
                        (info.offset.x > 55 || info.velocity.x > 240)
                      ) {
                        setActiveCardIndex((prev) => Math.max(0, prev - 1));
                      }
                    }}
                    whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                    className="absolute top-0 left-0 right-0 bg-[#FFF9F0] border-6 border-black p-4 shadow-[8px_8px_0px_black] flex flex-col min-h-[520px]"
                    style={{ transformOrigin: "bottom center" }}
                  >
                    {/* Top Masking Tape with Swipe / Next Hint */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FFD166] border-2 border-black shadow-[2px_2px_0px_black] -rotate-2 z-30 flex items-center justify-center">
                      <span className="font-mono font-black text-[9px] uppercase tracking-wider text-black select-none">
                        {offsetIndex === 0
                          ? `DOSSIER 0${index + 1}/0${founders.length} • SWIPE CARD`
                          : "IN QUEUE"}
                      </span>
                    </div>

                    {/* POLAROID FRAME */}
                    <div className="relative mb-5 mt-2 bg-white border-4 border-black p-2.5 pb-7 shadow-[4px_4px_0px_black] z-20 shrink-0">
                      <div className="relative h-52 w-full border-4 border-black overflow-hidden bg-gray-200">
                        {item.img ? (
                          <img
                            src={item.img}
                            className="w-full h-full object-cover"
                            alt={item.name}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-mono font-black text-black opacity-30 text-xl uppercase -rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)]">
                            MISSING
                          </div>
                        )}
                      </div>

                      {/* Floating Post-it on Mobile Card too! */}
                      <motion.div
                        animate={{ rotate: [4, 8, 4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute -right-3 -top-3 w-14 h-14 ${item.postIt} border-3 border-black shadow-[3px_3px_0px_black] p-1.5 flex flex-col justify-center items-center z-40`}
                      >
                        <span className="font-mono font-black uppercase text-center leading-none text-black text-[9px]">
                          EST.
                          <br />
                          2014
                        </span>
                      </motion.div>

                      {/* Role Tag (Typewriter Tape) */}
                      <div className="absolute -bottom-4 -left-3 bg-black text-white border-3 border-black px-3 py-1 font-mono font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_#06D6A0] z-40 -rotate-2">
                        {item.role}
                      </div>
                    </div>

                    {/* FOUNDER QUOTE / NOTE */}
                    <div className="flex flex-col gap-2 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black] relative flex-1">
                      <div className="absolute -top-2 -right-1 text-5xl text-black opacity-10 font-serif">
                        &ldquo;
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-wider text-black leading-none border-b-4 border-black pb-2 mb-1 shrink-0">
                        {item.name || "DIRECTOR"}
                      </h4>
                      <p className="text-[11px] font-mono font-bold text-black leading-relaxed uppercase relative z-10">
                        {item.note || "THE STAGE IS WHERE WE FIND OUR TRUEST SELVES."}
                      </p>
                    </div>

                    {/* PREV / NEXT NAVIGATION CONTROLS */}
                    <div className="mt-4 grid grid-cols-3 gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={offsetIndex !== 0 || activeCardIndex === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardIndex((prev) => Math.max(0, prev - 1));
                        }}
                        className="bg-white text-black border-4 border-black py-3.5 font-mono font-black uppercase text-xs shadow-[3px_3px_0px_black] disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        <ArrowLeft size={14} />
                        <span>Prev</span>
                      </button>

                      <button
                        type="button"
                        disabled={offsetIndex !== 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardIndex((prev) => prev + 1);
                        }}
                        className="col-span-2 bg-[#06D6A0] text-black border-4 border-black py-3.5 font-mono font-black uppercase text-xs shadow-[4px_4px_0px_black] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>
                          {index === founders.length - 1
                            ? "Finish Deck"
                            : "Next Founder"}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* End of Deck Message */}
            {activeCardIndex >= founders.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-0 left-0 right-0 bg-black text-[#FFF9F0] text-center border-6 border-black shadow-[10px_10px_0px_#FF5F5F] p-8 flex flex-col items-center justify-center min-h-[500px] z-10"
              >
                <span className="bg-[#06D6A0] text-black px-3 py-1 font-mono font-black text-[10px] uppercase mb-3">
                  ARCHIVE COMPLETE
                </span>
                <h3 className="text-3xl font-black uppercase mb-2">
                  ALL FOUNDERS VIEWED
                </h3>
                <p className="font-mono font-bold text-xs opacity-70 uppercase tracking-widest mb-8">
                  Tap below to restack the Founding Directorate deck.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveCardIndex(0)}
                  className="bg-[#FFD166] text-black border-4 border-black px-8 py-4 font-mono font-black uppercase tracking-widest shadow-[4px_4px_0px_#06D6A0] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all inline-flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  <span>RESTACK DECK</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
