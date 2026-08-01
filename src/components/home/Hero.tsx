"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";

export default function Hero({ data, activeNoticesCount = 0 }: { data: any, activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  const [isAuditionLive, setIsAuditionLive] = useState(false);

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
    <section className="relative min-h-[100dvh] w-full bg-brand-bg flex flex-col items-center justify-center overflow-hidden z-40 selection:bg-[#FF5F5F] selection:text-white pt-24 pb-12 px-4 md:px-8">
      
      {/* NEO-BRUTALIST GRID CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-7xl mx-auto border-[3px] border-brand-border bg-brand-bg shadow-[6px_6px_0px_#2D2D2D] md:shadow-[12px_12px_0px_#2D2D2D] rounded-3xl flex flex-col mt-12 md:mt-8"
      >
        
        {/* TOP BAR / ALERTS */}
        <div className="w-full border-b-[3px] border-brand-border flex items-center justify-between px-6 py-4 bg-white rounded-t-[1.3rem]">
          <div className="flex items-center gap-3">
             <div className="w-4 h-4 bg-[#FF5F5F] rounded-full border-[2px] border-brand-border animate-pulse" />
             <span className="font-black uppercase tracking-widest text-[10px] md:text-xs text-brand-text">
               {activeNoticesCount > 0 ? getNoticeText() : "ALL SYSTEMS NOMINAL"}
             </span>
          </div>
          <div className="hidden md:block font-bold text-xs uppercase tracking-widest text-brand-text">
            EST. 2014 // SSTC
          </div>
        </div>

        {/* MAIN TITLE AREA */}
        <div className="w-full py-16 md:py-24 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
          
          {/* THEATER MASKS PATTERN BACKGROUND */}
          <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="theater-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                  {/* Comedy Mask (Happy) */}
                  <g transform="translate(20, 20) scale(2) rotate(-15 12 12)" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12Z"/>
                    <path d="M8 11h.01"/><path d="M16 11h.01"/><path d="M9 16a5 5 0 0 0 6 0"/>
                  </g>
                  {/* Tragedy Mask (Sad) */}
                  <g transform="translate(80, 80) scale(2) rotate(15 12 12)" fill="none" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12c0 5.5 4.5 10 10 10s10-4.5 10-10S17.5 2 12 2 2 6.5 2 12Z"/>
                    <path d="M8 11h.01"/><path d="M16 11h.01"/><path d="M9 16a5 5 0 0 1 6 0"/>
                  </g>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#theater-pattern)" />
            </svg>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="font-black text-[16vw] md:text-[14rem] leading-[0.8] tracking-tighter text-brand-text uppercase relative z-10"
          >
            SWAANG
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, rotate: -10, scale: 0.5 }}
            animate={{ opacity: 1, rotate: -2, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 12 }}
            className="mt-6 md:mt-8 px-6 md:px-10 py-2 md:py-3 bg-[#FF5F5F] border-[3px] border-brand-border rounded-full transform -rotate-2 shadow-[6px_6px_0px_#2D2D2D] relative z-20"
          >
            <span className="font-black text-xl md:text-4xl uppercase tracking-widest text-white drop-shadow-[2px_2px_0px_#2D2D2D]">
              The Drama Club
            </span>
          </motion.div>
        </div>

        {/* BOTTOM ACTION ROW */}
        <div className="w-full border-t-[3px] border-brand-border grid grid-cols-1 md:grid-cols-3 rounded-b-[1.3rem] overflow-hidden">
          
          {/* Tagline */}
          <div className="p-6 md:p-8 border-b-[3px] md:border-b-0 md:border-r-[3px] border-brand-border flex items-center justify-center md:justify-start bg-white relative z-20">
            <p className="font-bold text-xs md:text-sm leading-relaxed uppercase text-brand-text text-center md:text-left">
              {tagline}
            </p>
          </div>

          {/* Spacer / Graphic */}
          <div className="hidden md:flex border-r-[3px] border-brand-border items-center justify-center bg-[#FF5F5F] overflow-hidden relative z-20">
             <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl drop-shadow-[4px_4px_0px_#2D2D2D]"
             >
               🎭
             </motion.div>
          </div>

          {/* DYNAMIC Call to Action */}
          <div className="p-6 md:p-8 flex items-center justify-center bg-brand-bg relative z-20">
             <Link 
               href={isAuditionLive ? "/auditions" : "/events"}
               className={`group flex items-center gap-4 ${isAuditionLive ? 'bg-white' : 'bg-[#2D2D2D]'} border-[3px] border-brand-border px-8 py-4 rounded-full shadow-[6px_6px_0px_#2D2D2D] hover:shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 transition-all active:shadow-none active:translate-y-2 active:translate-x-2`}
             >
               <span className={`font-black text-lg md:text-xl uppercase tracking-widest ${isAuditionLive ? 'text-brand-text' : 'text-white'}`}>
                 {isAuditionLive ? "Join Us" : "Explore"}
               </span>
               <div className={`w-10 h-10 rounded-full ${isAuditionLive ? 'bg-[#FF5F5F]' : 'bg-brand-bg'} border-[3px] border-brand-border flex items-center justify-center group-hover:rotate-45 transition-transform`}>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
               </div>
             </Link>
          </div>

        </div>
      </motion.div>

    </section>
  );
}