"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

export default function Hero({ data, activeNoticesCount = 0 }: { data: any, activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  const [isAuditionLive, setIsAuditionLive] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    // Listen for active notices
    const q = query(collection(db, "notices"), where("isActive", "==", true));
    const unsubscribeNotices = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setActiveNotice(snapshot.docs[0].data());
      else setActiveNotice(null);
    });

    // Listen for auditions status
    const unsubscribeAuditions = onSnapshot(doc(db, "settings", "auditions"), (docSnap) => {
      if (docSnap.exists()) {
        setIsAuditionLive(docSnap.data().isLive || false);
      }
    });

    return () => {
      unsubscribeNotices();
      unsubscribeAuditions();
    };
  }, []);

  const getNoticeText = () => {
    if (!activeNotice) return "";
    const head = activeNotice.header || activeNotice.title || activeNotice.shortHeader || "NOTICE";
    return `${head}`.toUpperCase();
  };

  const tagline = data?.headerTagline || "We tell stories that matter. Join the revolution of art and expression at SSTC.";

  return (
    <section 
      className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden z-40 selection:bg-[#FF5F5F] selection:text-white pt-32 md:pt-40 pb-12 px-4 md:px-8 bg-transparent"
      onMouseMove={(e) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - left) / width) * 100;
        const y = ((clientY - top) / height) * 100;
        setMousePos({ x, y });
      }}
    >
      
      {/* 🔦 STAGE SPOTLIGHT MASK */}
      <div 
        className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay transition-opacity duration-300 hidden md:block"
        style={{
          background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.15) 0%, transparent 80%)`
        }}
      />
      
      {/* NEO-BRUTALIST GRID CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-7xl mx-auto border-8 border-black shadow-[12px_12px_0px_#2D2D2D] flex flex-col mt-12 md:mt-8 bg-transparent"
      >
        
        {/* TOP BAR / ALERTS */}
        <div className="w-full border-b-8 border-black flex items-center justify-between px-6 py-4 bg-white overflow-hidden">
          <div className="flex items-center gap-4 whitespace-nowrap overflow-hidden relative w-full md:w-auto">
             <div className="w-6 h-6 bg-[#FF5F5F] border-4 border-black shadow-[2px_2px_0px_black] animate-pulse flex items-center justify-center font-black text-[10px] text-white shrink-0 z-10">!</div>
             
             {activeNoticesCount > 0 ? (
               <span className="font-mono font-black uppercase tracking-[0.2em] text-xs md:text-sm text-black">
                 {getNoticeText()}
               </span>
             ) : (
               <div className="flex w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
                 <motion.div 
                   animate={{ x: ["0%", "-50%"] }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="flex font-mono font-black uppercase tracking-[0.2em] text-xs md:text-sm text-black whitespace-nowrap"
                 >
                   <span className="pr-4">ALL SYSTEMS NOMINAL // PREPARING FOR ACT I // STANDBY //</span>
                   <span className="pr-4">ALL SYSTEMS NOMINAL // PREPARING FOR ACT I // STANDBY //</span>
                 </motion.div>
               </div>
             )}
          </div>
          <div className="hidden md:block font-mono font-black text-xs uppercase tracking-widest text-black">
            EST. 2014 // SSTC
          </div>
        </div>

        {/* MAIN TITLE AREA */}
        <div className="w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-[#FFF9F0]">
          
          {/* THEATRICAL MARQUEE WATERMARK */}
          <div className="absolute inset-0 z-0 pointer-events-none flex flex-col justify-center gap-8 opacity-[0.03] overflow-hidden -rotate-6 scale-110">
            <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter">
              HOUSE OPEN // CURTAIN RAISES // HOUSE OPEN // CURTAIN RAISES
            </h1>
            <h1 className="text-[12vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter -ml-32">
              QUIET ON SET // ACTION // QUIET ON SET // ACTION
            </h1>
          </div>
          
          <div className="flex z-10">
            {"SWAANG".split("").map((char, index) => (
              <motion.h1 
                key={index}
                initial={{ opacity: 0, y: -100, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  delay: 0.2 + (index * 0.1), 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 10,
                  mass: 2
                }}
                className="font-black text-[16vw] md:text-[14rem] leading-[0.8] tracking-tighter text-brand-text uppercase origin-bottom"
              >
                {char}
              </motion.h1>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, rotate: -10, scale: 0.5 }}
            animate={{ opacity: 1, rotate: -2, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
            className="mt-6 md:mt-8 px-8 py-3 bg-[#FF5F5F] border-8 border-black transform -rotate-2 shadow-[8px_8px_0px_black] relative z-20"
          >
            <span className="font-mono font-black text-xl md:text-3xl uppercase tracking-widest text-black">
              THE DRAMA CLUB
            </span>
          </motion.div>
        </div>

        {/* BOTTOM ACTION ROW */}
        <div className="w-full border-t-8 border-black grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          
          {/* Tagline */}
          <div className="p-6 md:p-8 border-b-8 md:border-b-0 md:border-r-8 border-black flex items-center justify-center md:justify-start bg-white relative z-20">
            <p className="font-mono font-bold text-xs md:text-sm leading-relaxed uppercase text-black text-center md:text-left">
              {tagline}
            </p>
          </div>

          {/* Spacer / Graphic */}
          <div className="hidden md:flex border-r-8 border-black items-center justify-center bg-[#FFD166] overflow-hidden relative z-20 shadow-[inset_8px_8px_0px_rgba(0,0,0,0.1)]">
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
             >
                <svg width="80" height="80" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 0 L55 40 L95 20 L65 50 L95 80 L55 60 L50 100 L45 60 L5 80 L35 50 L5 20 L45 40 Z" />
                </svg>
             </motion.div>
          </div>

          {/* DYNAMIC Call to Action */}
          <div className="p-6 md:p-8 flex items-center justify-center bg-[#06D6A0] relative z-20">
             <Link 
               href={isAuditionLive ? "/auditions" : "/events"}
               className={`group flex items-center justify-between w-full max-w-[280px] bg-black border-4 border-black px-6 py-4 shadow-[8px_8px_0px_white] hover:translate-y-1 hover:translate-x-1 transition-all active:shadow-none active:translate-y-2 active:translate-x-2`}
             >
               <span className={`font-mono font-black text-lg md:text-xl uppercase tracking-widest text-[#06D6A0]`}>
                 {isAuditionLive ? "JOIN US" : "EXPLORE"}
               </span>
               <div className={`w-10 h-10 bg-[#FF5F5F] border-4 border-black flex items-center justify-center group-hover:rotate-45 transition-transform shadow-[4px_4px_0px_white]`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </div>
             </Link>
          </div>

        </div>
      </motion.div>

    </section>
  );
}