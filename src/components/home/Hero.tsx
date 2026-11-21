"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { Sparkles, Clapperboard, Flame, Volume2, ChevronDown, Theater } from "lucide-react";

function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 220, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (clientX - centerX) * 0.35;
    const distanceY = (clientY - centerY) * 0.35;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const LETTER_CUES = [
  { char: "S", cue: "SPOTLIGHT ENGAGED", color: "#FF5F5F" },
  { char: "W", cue: "WINGS & BACKSTAGE", color: "#06D6A0" },
  { char: "A", cue: "ACT I // SCENE I", color: "#FFD166" },
  { char: "A", cue: "AWAAZ DO! (STREET)", color: "#FF5F5F" },
  { char: "N", cue: "NUKKAD & PROSCENIUM", color: "#06D6A0" },
  { char: "G", cue: "GRAND STAGE SSTC", color: "#FFD166" },
];

const STAGE_MOODS = [
  {
    id: "mainstage",
    label: "ACT I: MAINSTAGE",
    bg: "bg-[#FFF9F0]",
    accent: "#FF5F5F",
    badgeBg: "bg-[#FF5F5F]",
     badgeText: "text-black",
    quote: "HOUSE LIGHTS DOWN // SPOTLIGHT ON",
    icon: Sparkles,
  },
  {
    id: "nukkad",
    label: "ACT II: NUKKAD CIRCLE",
    bg: "bg-[#FFD166]/35",
    accent: "#FFD166",
    badgeBg: "bg-[#FFD166]",
    badgeText: "text-black",
    quote: "AWAAZ DO! // STREET FORMATION LIVE",
    icon: Flame,
  },
  {
    id: "backstage",
    label: "ACT III: GREEN ROOM",
    bg: "bg-[#06D6A0]/20",
    accent: "#06D6A0",
    badgeBg: "bg-[#06D6A0]",
    badgeText: "text-black",
    quote: "MIC CHECK 1-2 // CURTAIN CALL READY",
    icon: Volume2,
  },
];

export default function Hero({ data, activeNoticesCount = 0 }: { data: any; activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  const [isAuditionLive, setIsAuditionLive] = useState(false);
  const [joinCtaText, setJoinCtaText] = useState("JOIN US");
  const [mousePos, setMousePos] = useState({ x: 50, y: 45 });

  // Interactive Mobile & Desktop Stage States
  const [activeLetterIdx, setActiveLetterIdx] = useState<number | null>(null);
  const [moodIdx, setMoodIdx] = useState(0);
  const [clapSnap, setClapSnap] = useState(false);
  const [takeCount, setTakeCount] = useState(1);

  const currentMood = STAGE_MOODS[moodIdx];

  useEffect(() => {
    const q = query(collection(db, "notices"), where("isActive", "==", true));
    const unsubscribeNotices = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) setActiveNotice(snapshot.docs[0].data());
        else setActiveNotice(null);
      },
      (err) => console.warn("Hero notices listener warning:", err)
    );

    const unsubscribeAuditions = onSnapshot(
      doc(db, "settings", "auditions"),
      (docSnap) => {
        if (docSnap.exists()) {
          const audData = docSnap.data();
          setIsAuditionLive(audData.isLive || false);
          if (typeof audData.ctaText === "string" && audData.ctaText.trim()) {
            setJoinCtaText(audData.ctaText.trim());
          }
        }
      },
      (err) => console.warn("Hero auditions status listener warning:", err)
    );

    const unsubscribeJoinForms = onSnapshot(
      doc(db, "settings", "join_forms"),
      (docSnap) => {
        if (docSnap.exists()) {
          const jfData = docSnap.data();
          if (typeof jfData.masterLive === "boolean") {
            setIsAuditionLive(jfData.masterLive);
          }
          if (typeof jfData.heroCtaText === "string" && jfData.heroCtaText.trim()) {
            setJoinCtaText(jfData.heroCtaText.trim());
          }
        }
      },
      (err) => console.warn("Hero join_forms status listener warning:", err)
    );

    return () => {
      unsubscribeNotices();
      unsubscribeAuditions();
      unsubscribeJoinForms();
    };
  }, []);

  // Gentle auto-wave across SWAANG letters on mobile so it feels alive even before first tap
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLetterIdx((prev) => (prev === null ? 0 : (prev + 1) % LETTER_CUES.length));
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handleClapScene = () => {
    setClapSnap(true);
    setTakeCount((t) => t + 1);
    setMoodIdx((m) => (m + 1) % STAGE_MOODS.length);
    setTimeout(() => setClapSnap(false), 380);
  };

  const getNoticeText = () => {
    if (!activeNotice) return "";
    const head = activeNotice.header || activeNotice.title || activeNotice.shortHeader || "NOTICE";
    return `${head}`.toUpperCase();
  };

  const tagline =
    data?.headerTagline ||
    "We tell stories that matter. Join the revolution of art and expression at SSTC.";

  return (
    <section
      className="relative min-h-[96dvh] md:min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-40 selection:bg-[#FF5F5F] selection:text-white pt-24 sm:pt-28 md:pt-40 pb-8 md:pb-12 px-3.5 sm:px-6 md:px-8 bg-transparent"
      onMouseMove={(e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - left) / width) * 100;
        const y = ((clientY - top) / height) * 100;
        setMousePos({ x, y });
      }}
      onTouchMove={(e) => {
        if (!e.touches[0]) return;
        const { currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = Math.min(100, Math.max(0, ((e.touches[0].clientX - left) / width) * 100));
        const y = Math.min(100, Math.max(0, ((e.touches[0].clientY - top) / height) * 100));
        setMousePos({ x, y });
      }}
    >
      {/* DYNAMIC KINETIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-center items-center opacity-10">
        <motion.h1
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="text-[32vw] md:text-[20vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter rotate-[-10deg] origin-center text-black"
        >
          THE STAGE IS SET // THE STAGE IS SET // THE STAGE IS SET //
        </motion.h1>
        <motion.h1
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          className="text-[32vw] md:text-[20vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter rotate-[-10deg] origin-center text-black mt-4"
        >
          ACT I // SCENE I // ACT I // SCENE I // ACT I // SCENE I //
        </motion.h1>
      </div>

      {/* 🔦 STAGE SPOTLIGHT MASK (Works on both Mobile Touch & Desktop Cursor) */}
      <div
        className="absolute inset-0 z-30 pointer-events-none mix-blend-overlay transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 280px at ${mousePos.x}% ${mousePos.y}%, rgba(255,209,102,0.28) 0%, transparent 80%)`,
        }}
      />

      {/* NEO-BRUTALIST GRID CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="w-full max-w-7xl mx-auto border-4 sm:border-8 border-black shadow-[8px_8px_0px_#2D2D2D] md:shadow-[12px_12px_0px_#2D2D2D] flex flex-col mt-2 md:mt-8 bg-white relative z-20"
      >
        {/* TOP BAR / ALERTS & TAKE COUNTER */}
        <div className="w-full border-b-4 sm:border-b-8 border-black flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 bg-white overflow-hidden gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 whitespace-nowrap overflow-hidden relative flex-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85, rotate: -12 }}
              onClick={handleClapScene}
              className="w-6 h-6 bg-[#FF5F5F] border-2 sm:border-4 border-black shadow-[2px_2px_0px_black] animate-pulse flex items-center justify-center font-black text-[10px] text-white shrink-0 z-10"
              aria-label="Trigger Stage Cue"
            >
              !
            </motion.button>

            {activeNoticesCount > 0 ? (
              <span className="font-mono font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-xs md:text-sm text-black truncate">
                {getNoticeText()}
              </span>
            ) : (
              <div
                className="flex w-full overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                }}
              >
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                  className="flex font-mono font-black uppercase tracking-[0.18em] text-[11px] sm:text-xs md:text-sm text-black whitespace-nowrap"
                >
                  <span className="pr-4">
                    {currentMood.quote} // TAP LETTERS TO PLAY STAGE CUES //
                  </span>
                  <span className="pr-4">
                    {currentMood.quote} // TAP LETTERS TO PLAY STAGE CUES //
                  </span>
                </motion.div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleClapScene}
            className="shrink-0 bg-black text-[#FFD166] border-2 border-black px-2.5 py-1 font-mono font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_#FF5F5F] active:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <Clapperboard size={12} className="text-[#FF5F5F]" />
            <span>TAKE #{takeCount}</span>
          </button>
        </div>

        {/* MAIN STAGE TITLE AREA */}
        <div
          className={`w-full py-10 sm:py-16 md:py-24 px-3 sm:px-6 flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors duration-500 ${currentMood.bg}`}
        >
          {/* THEATRICAL MARQUEE WATERMARK */}
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-center gap-6 sm:gap-8 opacity-[0.04] overflow-hidden -rotate-6 scale-110">
            <h1 className="text-[16vw] md:text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter">
              HOUSE OPEN // CURTAIN RAISES // HOUSE OPEN // CURTAIN RAISES
            </h1>
            <h1 className="text-[16vw] md:text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter -ml-32">
              QUIET ON SET // ACTION // QUIET ON SET // ACTION
            </h1>
          </div>

          {/* FLOATING MOBILE STAGE STICKERS */}
          <div className="w-full max-w-4xl flex items-center justify-between px-2 mb-3 sm:mb-4 z-20">
            <motion.button
              type="button"
              onClick={handleClapScene}
              whileTap={{ scale: 0.9, rotate: -6 }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white border-2 sm:border-4 border-black px-2.5 sm:px-3.5 py-1 shadow-[3px_3px_0px_black] -rotate-3 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-ping" />
              <span className="font-mono font-black text-[9px] sm:text-[11px] uppercase tracking-wider text-black">
                {currentMood.label}
              </span>
            </motion.button>

            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-[#FFD166] border-2 sm:border-4 border-black px-2.5 sm:px-3.5 py-1 shadow-[3px_3px_0px_black] rotate-2"
            >
              <span className="font-mono font-black text-[9px] sm:text-[11px] uppercase tracking-wider text-black">
                EST. 2014 • SSTC BHILAI
              </span>
            </motion.div>
          </div>

          {/* INTERACTIVE S-W-A-A-N-G LETTERS (Touch & Hover Responsive) */}
          <div className="flex items-center justify-center z-10 select-none py-2 sm:py-0">
            {LETTER_CUES.map((item, index) => {
              const isHighlighted = activeLetterIdx === index;
              return (
                <motion.button
                  type="button"
                  key={index}
                  onClick={() => {
                    setActiveLetterIdx(index);
                  }}
                  initial={{ opacity: 0, y: -70, rotateX: 90 }}
                  animate={{
                    opacity: 1,
                    y: isHighlighted ? -10 : 0,
                    rotateX: 0,
                    rotate: isHighlighted ? (index % 2 === 0 ? -5 : 5) : 0,
                    scale: isHighlighted ? 1.08 : 1,
                  }}
                  whileHover={{
                    y: -22,
                    scale: 1.15,
                    rotate: index % 2 === 0 ? -6 : 6,
                    color: item.color,
                    transition: { type: "spring", stiffness: 450, damping: 12 },
                  }}
                  whileTap={{
                    scale: 1.22,
                    y: -16,
                    rotate: index % 2 === 0 ? -8 : 8,
                  }}
                  transition={{
                    delay: 0.1 + index * 0.07,
                    type: "spring",
                    stiffness: 240,
                    damping: 14,
                  }}
                  style={{
                    color: isHighlighted ? item.color : undefined,
                    WebkitTextStroke: isHighlighted ? "2px black" : undefined,
                  }}
                  className="font-black text-[18.5vw] sm:text-[16vw] md:text-[13.5rem] leading-[0.82] tracking-tighter text-brand-text uppercase origin-bottom cursor-pointer transition-colors duration-150 focus:outline-none px-0.5 sm:px-0"
                  aria-label={`Swaang letter ${item.char} - ${item.cue}`}
                >
                  {item.char}
                </motion.button>
              );
            })}
          </div>

          {/* LIVE LETTER CUE PILL (Shows which letter cue is active on mobile!) */}
          <div className="h-7 sm:h-8 mt-2 flex items-center justify-center z-20">
            <AnimatePresence mode="wait">
              {activeLetterIdx !== null && (
                <motion.div
                  key={activeLetterIdx}
                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  className="bg-black text-white border-2 border-black px-3 py-0.5 font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-[3px_3px_0px_#06D6A0] flex items-center gap-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LETTER_CUES[activeLetterIdx].color }}
                  />
                  <span>
                    [{LETTER_CUES[activeLetterIdx].char}] {LETTER_CUES[activeLetterIdx].cue}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* THE DRAMA CLUB STAMP BUTTON (Tapping snaps clapperboard & switches stage mood) */}
          <motion.button
            type="button"
            onClick={handleClapScene}
            initial={{ opacity: 0, rotate: -8, scale: 0.7 }}
            animate={{
              opacity: 1,
              rotate: clapSnap ? 3 : -2,
              scale: clapSnap ? 0.94 : 1,
            }}
            whileHover={{
              scale: 1.07,
              rotate: 1,
              boxShadow: "12px 12px 0px black",
              transition: { type: "spring", stiffness: 350, damping: 12 },
            }}
            whileTap={{ scale: 0.92, rotate: 2 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className={`mt-4 sm:mt-6 md:mt-8 px-5 sm:px-8 py-2.5 sm:py-3 ${currentMood.badgeBg} border-4 sm:border-8 border-black transform -rotate-2 shadow-[6px_6px_0px_black] sm:shadow-[8px_8px_0px_black] relative z-20 cursor-pointer group`}
          >
            <span
              className={`font-mono font-black text-base sm:text-xl md:text-3xl uppercase tracking-widest ${currentMood.badgeText} flex items-center gap-2`}
            >
              <Theater className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" />
              <span>THE DRAMA CLUB</span>
            </span>
          </motion.button>

          {/* MOBILE INTERACTIVE STAGE MOOD & TELEMETRY DECK */}
          <div className="mt-6 sm:mt-8 w-full max-w-xl mx-auto grid grid-cols-3 gap-2 sm:gap-3 z-20 md:hidden">
            {STAGE_MOODS.map((m, idx) => {
              const Icon = m.icon;
              const isSelected = moodIdx === idx;
              return (
                <motion.button
                  key={m.id}
                  type="button"
                  whileTap={{ scale: 0.93 }}
                  onClick={() => {
                    setMoodIdx(idx);
                    setTakeCount((c) => c + 1);
                  }}
                  className={`p-2 border-2 border-black font-mono text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-black text-[#FFD166] shadow-[3px_3px_0px_#FF5F5F] -translate-y-0.5"
                      : "bg-white text-black shadow-[2px_2px_0px_black]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={13} className={isSelected ? "text-[#06D6A0]" : "text-[#FF5F5F]"} />
                    <span className="text-[8px] font-black uppercase opacity-75">
                      0{idx + 1}
                    </span>
                  </div>
                  <span className="font-black text-[9px] uppercase tracking-wider leading-tight mt-1.5 truncate">
                    {m.label.replace(/ACT [I]+:\s*/, "")}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* BOTTOM ACTION ROW */}
        <div className="w-full border-t-4 sm:border-t-8 border-black grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Tagline + Mobile Live Counters */}
          <div className="p-5 sm:p-6 md:p-8 border-b-4 sm:border-b-8 md:border-b-0 md:border-r-8 border-black flex flex-col justify-center bg-white relative z-20 gap-3">
            <p className="font-mono font-bold text-xs md:text-sm leading-relaxed uppercase text-black text-center md:text-left">
              {tagline}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
              <span className="bg-[#FFF9F0] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase text-black shadow-[2px_2px_0px_black]">
                50+ PLAYS
              </span>
              <span className="bg-[#FFD166] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase text-black shadow-[2px_2px_0px_black]">
                10+ YRS
              </span>
              <span className="bg-[#06D6A0] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase text-black shadow-[2px_2px_0px_black]">
                SSTC
              </span>
            </div>
          </div>

          {/* Interactive Stage Star / Mood Cycler (Visible on Desktop, compact strip on Mobile) */}
          <motion.button
            type="button"
            onClick={handleClapScene}
            whileTap={{ scale: 0.97 }}
            className="flex border-b-4 sm:border-b-8 md:border-b-0 md:border-r-8 border-black items-center justify-between md:justify-center px-5 py-3.5 md:p-0 bg-[#FFD166] overflow-hidden relative z-20 shadow-[inset_6px_6px_0px_rgba(0,0,0,0.08)] cursor-pointer group"
          >
            <div className="flex items-center gap-3 md:flex-col">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                className="text-black drop-shadow-[3px_3px_0px_rgba(0,0,0,0.2)] w-9 h-9 md:w-20 md:h-20"
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 100 100"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M50 0 L55 40 L95 20 L65 50 L95 80 L55 60 L50 100 L45 60 L5 80 L35 50 L5 20 L45 40 Z" />
                </svg>
              </motion.div>
              <div className="text-left md:text-center">
                <span className="font-mono font-black text-[10px] uppercase tracking-widest bg-black text-white px-2 py-0.5 inline-block">
                  TAP TO SWITCH SCENE
                </span>
                <p className="font-mono font-black text-xs uppercase text-black mt-0.5 md:hidden">
                  {currentMood.label}
                </p>
              </div>
            </div>

            <span className="md:hidden font-mono font-black text-[10px] uppercase border-2 border-black bg-white px-2.5 py-1 shadow-[2px_2px_0px_black]">
              CUE ➔
            </span>
          </motion.button>

          {/* DYNAMIC Call to Action with Magnetic Attraction */}
          <div className="p-5 sm:p-6 md:p-8 flex items-center justify-center bg-[#06D6A0] relative z-20">
            <Magnetic className="w-full max-w-[320px] md:max-w-[280px]">
              <Link
                href={isAuditionLive ? "/auditions" : "/events"}
                className="group flex items-center justify-between w-full bg-black border-4 border-black px-5 sm:px-6 py-4 shadow-[6px_6px_0px_white] sm:shadow-[8px_8px_0px_white] hover:shadow-[12px_12px_0px_white] transition-all duration-200 active:shadow-none active:translate-y-1.5 active:translate-x-1.5"
              >
                <div className="flex flex-col text-left">
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest text-white/70">
                    {isAuditionLive ? "PORTAL OPEN • APPLY NOW" : "DISCOVER SHOWS"}
                  </span>
                  <span className="font-mono font-black text-lg md:text-xl uppercase tracking-widest text-[#06D6A0] group-hover:text-white transition-colors">
                    {isAuditionLive ? joinCtaText : "EXPLORE"}
                  </span>
                </div>
                <motion.div
                  whileHover={{ rotate: 45, scale: 1.15 }}
                  whileTap={{ rotate: 45, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                  className="w-10 h-10 bg-[#FF5F5F] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_white] group-hover:bg-[#FFD166] transition-colors shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.div>
              </Link>
            </Magnetic>
          </div>
        </div>
      </motion.div>

      {/* MOBILE SCROLL DOWN CURTAIN CUE */}
      <motion.a
        href="#call-board"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-5 md:mt-6 inline-flex items-center gap-2 bg-white border-2 border-black px-3.5 py-1.5 shadow-[3px_3px_0px_black] font-mono font-black text-[10px] uppercase tracking-widest text-black z-20"
      >
        <span>SCROLL FOR ACT II</span>
        <ChevronDown size={14} className="text-[#FF5F5F]" />
      </motion.a>
    </section>
  );
}