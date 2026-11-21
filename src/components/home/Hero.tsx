"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { Theater, Megaphone, Clapperboard } from "lucide-react";

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

const PLAYBILL_EDITIONS = [
  {
    id: "01",
    archBg: "bg-[#FFD166]",
    badgeBg: "bg-[#FF5F5F]",
    icon: Theater,
    title: "MAINSTAGE",
  },
  {
    id: "02",
    archBg: "bg-[#FF5F5F]",
    badgeBg: "bg-[#FFD166]",
    icon: Megaphone,
    title: "NUKKAD",
  },
  {
    id: "03",
    archBg: "bg-[#06D6A0]",
    badgeBg: "bg-[#FF5F5F]",
    icon: Clapperboard,
    title: "CINEMA",
  },
];

export default function Hero({ data, activeNoticesCount = 0 }: { data: any; activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  const [isAuditionLive, setIsAuditionLive] = useState(false);
  const [joinCtaText, setJoinCtaText] = useState("JOIN US");
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Mobile Playbill Cover interactive artwork state
  const [editionIdx, setEditionIdx] = useState(0);
  const currentEdition = PLAYBILL_EDITIONS[editionIdx];
  const EditionIcon = currentEdition.icon;

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

  const getNoticeText = () => {
    if (!activeNotice) return "";
    const head = activeNotice.header || activeNotice.title || activeNotice.shortHeader || "NOTICE";
    return `${head}`.toUpperCase();
  };

  const tagline =
    data?.headerTagline ||
    "We tell stories that matter. Join the revolution of art and expression at SSTC.";

  const cycleEdition = () => {
    setEditionIdx((prev) => (prev + 1) % PLAYBILL_EDITIONS.length);
  };

  return (
    <section
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-40 selection:bg-[#FF5F5F] selection:text-white pt-24 md:pt-40 pb-10 md:pb-12 px-4 md:px-8 bg-[#FFF9F0] bg-stage-grid-animated border-b-8 border-black"
      onMouseMove={(e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - left) / width) * 100;
        const y = ((clientY - top) / height) * 100;
        setMousePos({ x, y });
      }}
    >
      {/* 🕸️ FLOATING GEOMETRIC STAGE REGISTRATION MARKS (Background Layer) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full border-4 border-dashed border-black/15 flex items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full border-2 border-black/15" />
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0], rotate: [-12, -4, -12] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 -left-6 w-24 h-24 bg-[#FFD166]/35 border-4 border-black/20 rotate-12"
        />

        <motion.div
          animate={{ y: [0, 14, 0], rotate: [8, 18, 8] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-28 -left-8 w-20 h-20 bg-[#06D6A0]/25 border-4 border-black/20 -rotate-12"
        />
      </div>

      {/* DYNAMIC BACKGROUND WATERMARK */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-center items-center opacity-[0.09] md:opacity-10">
        <motion.h1
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="text-[35vw] md:text-[20vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter rotate-[-10deg] origin-center text-black"
        >
          THE STAGE IS SET // THE STAGE IS SET // THE STAGE IS SET //
        </motion.h1>
        <motion.h1
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="text-[35vw] md:text-[20vw] font-black uppercase whitespace-nowrap leading-[0.8] tracking-tighter rotate-[-10deg] origin-center text-black mt-4"
        >
          ACT I // SCENE I // ACT I // SCENE I // ACT I // SCENE I //
        </motion.h1>
      </div>

      {/* 🔦 DESKTOP STAGE SPOTLIGHT MASK */}
      <div
        className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`,
        }}
      />

      {/* ===================================================================== */}
      {/* 📱 DEDICATED MOBILE HERO: "THE OPENING-NIGHT PLAYBILL COVER" (md:hidden) */}
      {/* ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="md:hidden w-full max-w-md mx-auto border-[6px] border-black shadow-[10px_10px_0px_#2D2D2D] bg-[#FFF9F0] flex flex-col relative z-20 mt-2"
      >
        {/* 1. SLIM PLAYBILL MASTHEAD */}
        <div className="w-full border-b-4 border-black bg-white px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 bg-[#FF5F5F] border-2 border-black shrink-0 animate-pulse" />
            <span className="font-mono font-black text-[10px] uppercase tracking-[0.18em] text-black truncate">
              {activeNoticesCount > 0 ? getNoticeText() : "EST. 2014 • SSTC BHILAI"}
            </span>
          </div>
          <span className="font-mono font-black text-[10px] uppercase tracking-widest text-black/60 shrink-0">
            ISSUE #{currentEdition.id}
          </span>
        </div>

        {/* 2. SPACIOUS EDITORIAL POSTER CENTERPIECE WITH HALFTONE DOT MATRIX */}
        <div className="px-5 pt-8 pb-9 flex flex-col items-center text-center relative overflow-hidden bg-dot-matrix">
          {/* Corner Blueprint Crosshairs inside Playbill */}
          <span className="absolute top-2.5 left-3 font-mono font-black text-xs text-black/30 select-none">+</span>
          <span className="absolute top-2.5 right-3 font-mono font-black text-xs text-black/30 select-none">+</span>
          <span className="absolute bottom-2.5 left-3 font-mono font-black text-xs text-black/30 select-none">+</span>
          <span className="absolute bottom-2.5 right-3 font-mono font-black text-xs text-black/30 select-none">+</span>
          {/* Interactive Central Theatrical Arch Emblem (Tap to flip edition) */}
          <motion.button
            type="button"
            onClick={cycleEdition}
            whileTap={{ scale: 0.93, rotate: -3 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative mb-3 focus:outline-none group"
            aria-label="Tap to switch playbill artwork"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentEdition.id}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className={`w-32 h-36 rounded-t-full ${currentEdition.archBg} border-4 border-black shadow-[6px_6px_0px_black] flex flex-col items-center justify-center relative overflow-hidden`}
              >
                {/* Rotating Starburst Halo behind Icon */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center text-black/15 pointer-events-none"
                >
                  <svg width="110" height="110" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 0 L55 40 L95 20 L65 50 L95 80 L55 60 L50 100 L45 60 L5 80 L35 50 L5 20 L45 40 Z" />
                  </svg>
                </motion.div>

                <EditionIcon size={40} strokeWidth={2.5} className="text-black relative z-10 mb-1" />
                <span className="font-mono font-black text-[9px] uppercase tracking-widest bg-black text-white px-2 py-0.5 relative z-10">
                  {currentEdition.title}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Monumental SWAANG Typography */}
          <div className="flex items-center justify-center select-none -mt-1 z-10">
            {"SWAANG".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{
                  y: -12,
                  scale: 1.18,
                  rotate: index % 2 === 0 ? -6 : 6,
                  color: "#FF5F5F",
                }}
                transition={{
                  delay: 0.1 + index * 0.06,
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                }}
                className="font-black text-[17.5vw] leading-[0.82] tracking-tighter text-brand-text uppercase cursor-pointer"
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* Iconic Tilted Stamp */}
          <motion.button
            type="button"
            onClick={cycleEdition}
            whileTap={{ scale: 0.94, rotate: 2 }}
            className={`mt-3 px-6 py-2 ${currentEdition.badgeBg} border-4 border-black transform -rotate-2 shadow-[5px_5px_0px_black] relative z-20 transition-colors duration-300`}
          >
            <span className="font-mono font-black text-base uppercase tracking-[0.2em] text-black">
              THE DRAMA CLUB
            </span>
          </motion.button>

          {/* Clean Editorial Tagline */}
          <p className="mt-6 font-mono font-bold text-xs leading-relaxed uppercase text-black/85 max-w-[280px]">
            {tagline}
          </p>
        </div>

        {/* 3. SINGLE UNIFIED BOTTOM CTA BAR */}
        <div className="w-full border-t-4 border-black bg-[#06D6A0] p-4">
          <Link
            href={isAuditionLive ? "/auditions" : "/events"}
            className="group flex items-center justify-between w-full bg-black border-4 border-black px-5 py-3.5 shadow-[6px_6px_0px_white] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            <span className="font-mono font-black text-lg uppercase tracking-[0.2em] text-[#06D6A0] group-hover:text-white">
              {isAuditionLive ? joinCtaText : "EXPLORE"}
            </span>
            <div className="w-9 h-9 bg-[#FF5F5F] border-3 border-black flex items-center justify-center shadow-[3px_3px_0px_white] shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
            </div>
          </Link>
        </div>
      </motion.div>

      {/* ===================================================================== */}
      {/* 💻 DESKTOP HERO: NEO-BRUTALIST GRID CONTAINER (hidden md:flex)        */}
      {/* ===================================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex w-full max-w-7xl mx-auto border-8 border-black shadow-[12px_12px_0px_#2D2D2D] flex-col mt-8 bg-transparent"
      >
        {/* TOP BAR / ALERTS */}
        <div className="w-full border-b-8 border-black flex items-center justify-between px-6 py-4 bg-white overflow-hidden">
          <div className="flex items-center gap-4 whitespace-nowrap overflow-hidden relative w-full md:w-auto">
            <div className="w-6 h-6 bg-[#FF5F5F] border-4 border-black shadow-[2px_2px_0px_black] animate-pulse flex items-center justify-center font-black text-[10px] text-white shrink-0 z-10">
              !
            </div>

            {activeNoticesCount > 0 ? (
              <span className="font-mono font-black uppercase tracking-[0.2em] text-xs md:text-sm text-black">
                {getNoticeText()}
              </span>
            ) : (
              <div
                className="flex w-full overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                }}
              >
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="flex font-mono font-black uppercase tracking-[0.2em] text-xs md:text-sm text-black whitespace-nowrap"
                >
                  <span className="pr-4">
                    ALL SYSTEMS NOMINAL // PREPARING FOR ACT I // STANDBY //
                  </span>
                  <span className="pr-4">
                    ALL SYSTEMS NOMINAL // PREPARING FOR ACT I // STANDBY //
                  </span>
                </motion.div>
              </div>
            )}
          </div>
          <div className="hidden md:block font-mono font-black text-xs uppercase tracking-widest text-black">
            EST. 2014 // SSTC
          </div>
        </div>

        {/* MAIN TITLE AREA */}
        <div className="w-full py-24 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[#FFF9F0]">
          {/* THEATRICAL MARQUEE WATERMARK */}
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-center gap-8 opacity-[0.03] overflow-hidden -rotate-6 scale-110">
            <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter">
              HOUSE OPEN // CURTAIN RAISES // HOUSE OPEN // CURTAIN RAISES
            </h1>
            <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter -ml-32">
              QUIET ON SET // ACTION // QUIET ON SET // ACTION
            </h1>
          </div>

          <div className="flex z-10 select-none">
            {"SWAANG".split("").map((char, index) => (
              <motion.h1
                key={index}
                initial={{ opacity: 0, y: -100, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                whileHover={{
                  y: -24,
                  scale: 1.15,
                  rotate: index % 2 === 0 ? -6 : 6,
                  color: "#FF5F5F",
                  transition: { type: "spring", stiffness: 450, damping: 12 },
                }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 150,
                  damping: 10,
                  mass: 2,
                }}
                className="font-black text-[14rem] leading-[0.8] tracking-tighter text-brand-text uppercase origin-bottom cursor-pointer transition-colors duration-200"
              >
                {char}
              </motion.h1>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.5 }}
            animate={{ opacity: 1, rotate: -2, scale: 1 }}
            whileHover={{
              scale: 1.08,
              rotate: 1,
              boxShadow: "12px 12px 0px black",
              transition: { type: "spring", stiffness: 350, damping: 12 },
            }}
            whileTap={{ scale: 0.96 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
            className="mt-8 px-8 py-3 bg-[#FF5F5F] border-8 border-black transform -rotate-2 shadow-[8px_8px_0px_black] relative z-20 cursor-pointer"
          >
            <span className="font-mono font-black text-3xl uppercase tracking-widest text-black">
              THE DRAMA CLUB
            </span>
          </motion.div>
        </div>

        {/* BOTTOM ACTION ROW */}
        <div className="w-full border-t-8 border-black grid grid-cols-3 overflow-hidden">
          {/* Tagline */}
          <div className="p-8 border-r-8 border-black flex items-center justify-start bg-white relative z-20">
            <p className="font-mono font-bold text-sm leading-relaxed uppercase text-black text-left">
              {tagline}
            </p>
          </div>

          {/* Spacer / Graphic */}
          <div className="flex border-r-8 border-black items-center justify-center bg-[#FFD166] overflow-hidden relative z-20 shadow-[inset_8px_8px_0px_rgba(0,0,0,0.1)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M50 0 L55 40 L95 20 L65 50 L95 80 L55 60 L50 100 L45 60 L5 80 L35 50 L5 20 L45 40 Z" />
              </svg>
            </motion.div>
          </div>

          {/* DYNAMIC Call to Action with Magnetic Attraction */}
          <div className="p-8 flex items-center justify-center bg-[#06D6A0] relative z-20">
            <Magnetic className="w-full max-w-[280px]">
              <Link
                href={isAuditionLive ? "/auditions" : "/events"}
                className="group flex items-center justify-between w-full bg-black border-4 border-black px-6 py-4 shadow-[8px_8px_0px_white] hover:shadow-[12px_12px_0px_white] transition-all duration-200 active:shadow-none active:translate-y-2 active:translate-x-2"
              >
                <span className="font-mono font-black text-xl uppercase tracking-widest text-[#06D6A0] group-hover:text-white transition-colors">
                  {isAuditionLive ? joinCtaText : "EXPLORE"}
                </span>
                <motion.div
                  whileHover={{ rotate: 45, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 10 }}
                  className="w-10 h-10 bg-[#FF5F5F] border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_white] group-hover:bg-[#FFD166] transition-colors"
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
    </section>
  );
}