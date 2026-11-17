"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

export default function Hero({ data, activeNoticesCount = 0 }: { data: any, activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  const [isAuditionLive, setIsAuditionLive] = useState(false);
  const [isChanting, setIsChanting] = useState(false);
  const [drumBeatCount, setDrumBeatCount] = useState(0);
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCinemaOpen(false);
    };
    if (isCinemaOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCinemaOpen]);

  useEffect(() => {
    // Listen for active notices
    const q = query(collection(db, "notices"), where("isActive", "==", true));
    const unsubscribeNotices = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) setActiveNotice(snapshot.docs[0].data());
        else setActiveNotice(null);
      },
      (err) => console.warn("Hero notices listener warning:", err)
    );

    // Listen for auditions status
    const unsubscribeAuditions = onSnapshot(
      doc(db, "settings", "auditions"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsAuditionLive(docSnap.data().isLive || false);
        }
      },
      (err) => console.warn("Hero auditions status listener warning:", err)
    );

    return () => {
      unsubscribeNotices();
      unsubscribeAuditions();
    };
  }, []);

  // 🪘 Authentic Synthesized Dafli / Dholak Street Rhythm via Web Audio API
  const playDafliRhythm = () => {
    setDrumBeatCount(prev => prev + 1);
    setIsChanting(true);
    setTimeout(() => setIsChanting(false), 4500);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Rhythmic 3-beat acoustic strike pattern (Dha... Dhin... Dha!)
      const strikes = [
        { time: 0.0, freq: 110, decay: 0.18, gain: 0.45 },
        { time: 0.16, freq: 160, decay: 0.12, gain: 0.35 },
        { time: 0.32, freq: 85, decay: 0.28, gain: 0.55 },
      ];

      strikes.forEach(({ time, freq, decay, gain }) => {
        const osc = ctx.createOscillator();
        const amp = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + time + decay);

        amp.gain.setValueAtTime(gain, ctx.currentTime + time);
        amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + decay);

        osc.connect(amp);
        amp.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + decay);
      });
    } catch (e) {
      // Audio fallback
    }
  };

  const getNoticeText = () => {
    if (!activeNotice) return "";
    const head = activeNotice.header || activeNotice.title || activeNotice.shortHeader || "NOTICE";
    return `${head}`.toUpperCase();
  };

  const tagline = data?.headerTagline || "We tell stories that refuse to stay silent. The street is our stage; the voice is our weapon.";

  return (
    <section className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-40 bg-[#FFF9F0] selection:bg-[#FF5F5F] selection:text-white pt-24 md:pt-36 pb-16 px-4 md:px-8">
      
      {/* 🎬 AMBIENT STREET THEATRE FILM TEXTURE (Zero-disturbance Projection) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-full object-cover opacity-[0.14] md:opacity-[0.18] grayscale contrast-125 brightness-95 mix-blend-multiply scale-105"
        >
          <source src="/video/hero-bg.mp4" type="video/mp4" />
        </video>
        {/* Vintage Film Scanline & Grain Texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.07] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9F0]/80 via-transparent to-[#FFF9F0] pointer-events-none" />
      </div>

      {/* 📜 BACKGROUND POSTER GRAIN & STENCIL WATERMARK */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex flex-col justify-between items-center opacity-[0.06] select-none">
        <h1 className="text-[28vw] font-black uppercase tracking-tighter text-black -mt-16 rotate-[-5deg]">
          स्वांग
        </h1>
        <h1 className="text-[24vw] font-black uppercase tracking-tighter text-black -mb-16 rotate-[3deg]">
          REVOLUTION
        </h1>
      </div>

      {/* 🔴 FULL-SCREEN STREET THEATRE CHANT FLASH (Triggered on Dafli Beat) */}
      <AnimatePresence>
        {isChanting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-sm text-center"
          >
            <div className="max-w-4xl p-8 bg-[#FFD166] border-8 border-black shadow-[16px_16px_0px_#FF5F5F] transform -rotate-1">
              <span className="font-mono font-black text-xs md:text-sm bg-black text-white px-3 py-1 uppercase tracking-[0.3em] inline-block mb-4">
                ॥ फैज़ अहमद फैज़ // THE NUKKAD ANTHEM ॥
              </span>
              <h2 className="font-cinzel text-3xl md:text-6xl font-black uppercase tracking-tight text-black leading-tight mb-4">
                "बोल कि लब आज़ाद हैं तेरे,<br/>
                बोल ज़बाँ अब तक तेरी है!"
              </h2>
              <p className="font-mono font-black text-xs md:text-base uppercase tracking-widest text-[#FF5F5F] bg-black px-4 py-2 inline-block">
                SPEAK, FOR YOUR LIPS ARE FREE // SSTC STREET ENSEMBLE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ MAIN POSTER WALL CONTAINER */}
      <div className="w-full max-w-7xl mx-auto relative z-20 flex flex-col items-center">
        
        {/* TOP ALERT STRIP */}
        <div className="w-full bg-white border-8 border-black shadow-[8px_8px_0px_black] px-4 md:px-6 py-3 flex items-center justify-between mb-8 overflow-hidden gap-2">
          <div className="flex items-center gap-3 overflow-hidden flex-1 mr-2">
            <span className="w-6 h-6 bg-[#FF5F5F] border-2 border-black flex items-center justify-center font-black text-xs text-white shrink-0 animate-pulse">
              !
            </span>
            <div className="flex whitespace-nowrap overflow-hidden font-mono font-black text-xs md:text-sm uppercase tracking-wider text-black">
              {activeNoticesCount > 0 ? (
                <span>{getNoticeText()}</span>
              ) : (
                <span className="flex gap-4">
                  <span>📢 NUKKAD NATAK SEASON IN PROGRESS</span>
                  <span>//</span>
                  <span>OPEN AUDITIONS AT THE FOYER</span>
                  <span>//</span>
                  <span>EST. 2014 SSTC BHILAI</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 🎬 30s Street Reel Glimpse Button */}
            <button
              onClick={() => setIsCinemaOpen(true)}
              className="flex items-center gap-2 bg-black hover:bg-[#FF5F5F] text-[#06D6A0] hover:text-white border-4 border-black px-3 py-1.5 font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_black] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Watch 30s Street Theatre Glimpse"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5F5F] animate-ping" />
              <span>▶</span>
              <span className="hidden sm:inline">30s REEL</span>
            </button>

            {/* Dafli Sound Trigger */}
            <button
              onClick={playDafliRhythm}
              className="flex items-center gap-2 bg-[#FFD166] hover:bg-[#FF5F5F] hover:text-white border-4 border-black px-3.5 py-1.5 font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_black] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Click to strike the Nukkad Natak Dafli"
            >
              <span>🪘</span>
              <span className="hidden sm:inline">SOUND DAFli</span>
              {drumBeatCount > 0 && (
                <span className="bg-black text-[#FFD166] px-1.5 py-0.2 text-[10px]">
                  {drumBeatCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 🎭 CENTRAL REVOLUTION STAGE (WHEAT-PASTE POSTER GRID) */}
        <div className="w-full relative flex flex-col items-center text-center py-8 md:py-16">
          
          {/* FLOATING POSTER 1 (Top Left Tilted Proclamation) */}
          <motion.div 
            initial={{ opacity: 0, x: -30, rotate: -6 }}
            animate={{ opacity: 1, x: 0, rotate: -4 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block absolute left-0 top-4 max-w-[240px] bg-[#FF5F5F] border-4 border-black p-4 shadow-[8px_8px_0px_black] text-left transform -rotate-4 hover:rotate-0 hover:scale-105 transition-all z-10"
          >
            <div className="text-[9px] font-mono font-black uppercase tracking-widest bg-black text-[#FF5F5F] px-2 py-0.5 inline-block mb-2">
              DISPATCH #50
            </div>
            <h4 className="font-cinzel text-lg font-black uppercase text-black leading-tight mb-2">
              The Streets Do Not Lie.
            </h4>
            <p className="font-mono text-[10px] uppercase font-bold text-black/80 leading-normal">
              50+ Street Plays performed across chhattisgarh. Real stories. Zero censorship.
            </p>
          </motion.div>

          {/* FLOATING POSTER 2 (Top Right Tilted Callout) */}
          <motion.div 
            initial={{ opacity: 0, x: 30, rotate: 6 }}
            animate={{ opacity: 1, x: 0, rotate: 3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block absolute right-0 top-8 max-w-[240px] bg-[#06D6A0] border-4 border-black p-4 shadow-[8px_8px_0px_black] text-left transform rotate-3 hover:rotate-0 hover:scale-105 transition-all z-10"
          >
            <div className="text-[9px] font-mono font-black uppercase tracking-widest bg-black text-[#06D6A0] px-2 py-0.5 inline-block mb-2">
              NEXT GATHERING
            </div>
            <h4 className="font-cinzel text-lg font-black uppercase text-black leading-tight mb-2">
              Open Air Circle.
            </h4>
            <p className="font-mono text-[10px] uppercase font-bold text-black/80 leading-normal">
              SSTC Central Quadrangle // Every Sunset // Come with an open mind.
            </p>
          </motion.div>

          {/* 🎡 THE ROTATING NATYA CHAKRA (Circle of Voices) */}
          <div className="relative flex items-center justify-center my-4">
            
            {/* Spinning Text Ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] md:w-[480px] md:h-[480px] pointer-events-none select-none z-0 opacity-25"
            >
              <svg viewBox="0 0 500 500" className="w-full h-full">
                <path
                  id="circlePath"
                  d="M 250, 250 m -200, 0 a 200,200 0 1,1 400,0 a 200,200 0 1,1 -400,0"
                  fill="none"
                />
                <text className="font-mono font-black uppercase tracking-[0.22em] text-[15px] fill-black">
                  <textPath href="#circlePath">
                    * स्वांग * आवाज़ * क्रांति * नाटक * THE STREET IS OUR STAGE * SSTC *
                  </textPath>
                </text>
              </svg>
            </motion.div>

            {/* MAIN HEADLINE: SWAANG */}
            <div className="relative z-10 flex flex-col items-center">
              
              <div className="flex select-none">
                {"SWAANG".split("").map((char, index) => (
                  <motion.h1 
                    key={index}
                    initial={{ opacity: 0, y: -60, rotate: index % 2 === 0 ? -8 : 8 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ 
                      delay: 0.15 + (index * 0.08), 
                      type: "spring", 
                      stiffness: 220, 
                      damping: 14 
                    }}
                    className="font-black text-[18vw] sm:text-[20vw] md:text-[14rem] leading-[0.8] tracking-tighter text-black uppercase origin-bottom drop-shadow-[8px_8px_0px_#FFD166] hover:text-[#FF5F5F] hover:translate-y-[-4px] transition-all cursor-default"
                  >
                    {char}
                  </motion.h1>
                ))}
              </div>

              {/* Stencil Sub-Stamp */}
              <motion.div 
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -2 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 15 }}
                className="mt-6 md:mt-8 px-6 md:px-10 py-3 bg-[#FF5F5F] border-8 border-black shadow-[8px_8px_0px_black] transform -rotate-2"
              >
                <h3 className="font-mono font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-widest text-black">
                  THE STREET THEATRE ENSEMBLE
                </h3>
              </motion.div>

            </div>

          </div>

          {/* TAGLINE & MANIFESTO */}
          <div className="max-w-2xl mx-auto mt-8 px-4 relative z-10">
            <p className="font-mono font-bold text-xs sm:text-sm md:text-base uppercase tracking-wider text-black bg-white border-4 border-black p-4 shadow-[6px_6px_0px_black]">
              "{tagline}"
            </p>
          </div>

          {/* 📼 MINIMAL STREET ARCHIVE BADGE / GLIMPSE TRIGGER */}
          <div className="mt-4 flex items-center justify-center gap-3 relative z-10">
            <button
              onClick={() => setIsCinemaOpen(true)}
              className="group flex items-center gap-2.5 bg-white/95 hover:bg-black text-black hover:text-[#06D6A0] border-2 border-black px-3.5 py-1.5 font-mono font-black text-[10px] md:text-xs uppercase tracking-widest shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5F5F] animate-ping" />
              <span>WATCH ARCHIVE GLIMPSE</span>
              <span className="font-mono text-[9px] text-[#FF5F5F] group-hover:text-white bg-black/5 group-hover:bg-white/10 px-1.5 py-0.5">
                [0:30]
              </span>
            </button>
          </div>

          {/* DUAL ACTION BUTTON ROW */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg px-4 relative z-10">
            
            {/* Primary Action: Enter the Circle / Audition */}
            <Link 
              href={isAuditionLive ? "/auditions" : "/crew"}
              className="w-full sm:w-1/2 flex items-center justify-between bg-black text-[#06D6A0] hover:bg-[#06D6A0] hover:text-black border-4 border-black px-6 py-4 font-mono font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <span>{isAuditionLive ? "JOIN ENSEMBLE" : "ENTER CIRCLE"}</span>
              <span className="text-lg">➜</span>
            </Link>

            {/* Secondary Action: Explore Street Plays */}
            <Link 
              href="/events"
              className="w-full sm:w-1/2 flex items-center justify-between bg-[#FFD166] text-black hover:bg-[#FF5F5F] hover:text-white border-4 border-black px-6 py-4 font-mono font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <span>EXPLORE PLAYS</span>
              <span className="text-lg">🎭</span>
            </Link>

          </div>

        </div>

      </div>

      {/* 🎬 FULLSCREEN NEO-BRUTALIST CINEMA MODAL */}
      <AnimatePresence>
        {isCinemaOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/90 backdrop-blur-md"
            onClick={() => setIsCinemaOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#FFF9F0] border-8 border-black shadow-[16px_16px_0px_#FFD166] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header Bar */}
              <div className="bg-[#FFD166] border-b-6 border-black px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 font-mono font-black text-xs uppercase tracking-wider text-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F5F] animate-ping" />
                  <span>ACT I // SWAANG STREET REEL // 24 FPS</span>
                </div>
                <button
                  onClick={() => setIsCinemaOpen(false)}
                  className="bg-black hover:bg-[#FF5F5F] text-[#06D6A0] hover:text-white border-2 border-black px-3 py-1 font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_black] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  ✕ CLOSE [ESC]
                </button>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                <video
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="/video/hero-bg.mp4" type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>

              {/* Modal Footer Bar */}
              <div className="bg-white border-t-6 border-black px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-black font-mono">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-wider">
                  ॥ आवाज़ हमारी, रंगमंच आपका ॥ SSTC BHILAI ARCHIVE
                </span>
                <Link
                  href="/events"
                  onClick={() => setIsCinemaOpen(false)}
                  className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#FF5F5F] hover:underline flex items-center gap-1"
                >
                  <span>SEE ALL PRODUCTIONS</span>
                  <span>➜</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}