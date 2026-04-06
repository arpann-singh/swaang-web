"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Hero({ data, activeNoticesCount = 0 }: { data: any, activeNoticesCount?: number }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  
  // 🧠 THE SMART SCALING FIX:
  const adminTitle = data.styles?.hTitleSize ? parseFloat(data.styles.hTitleSize) : 9;
  const adminTag = data.styles?.hTaglineSize ? parseFloat(data.styles.hTaglineSize) : 1.2;

  const safeTitleSize = `clamp(2rem, 10vw, ${adminTitle}rem)`;
  const safeTagSize = `clamp(0.5rem, 2.5vw, ${adminTag}rem)`;

  const imageSource = data.headerImageUrl || data.headerImage;

  useEffect(() => {
    const q = query(collection(db, "notices"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setActiveNotice(snapshot.docs[0].data());
      else setActiveNotice(null);
    });
    return () => unsubscribe();
  }, []);

  const getNoticeText = () => {
    if (!activeNotice) return "";
    const head = activeNotice.header || activeNotice.title || activeNotice.shortHeader || "NOTICE";
    const msg = activeNotice.message || activeNotice.content || activeNotice.text || "";
    return `${head}: ${msg}`.toUpperCase();
  };

  return (
    <section className="relative h-[100dvh] flex flex-col items-center justify-center border-b-[8px] md:border-b-[12px] border-[#2D2D2D] overflow-hidden bg-[#1A1A1A]">
      
      {/* 🎞️ BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* 🔥 FIXED: Comment moved outside the tag! Dynamically injects 'grayscale' based on Admin Setting */}
        {imageSource && (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            src={imageSource} 
            className={`w-full h-full object-cover brightness-50 ${data?.heroGrayscale !== false ? 'grayscale' : ''}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-transparent to-[#1A1A1A] opacity-90" />
      </div>

      {/* ✍️ CONTENT: Edge-Safe Padding */}
      <div className="relative z-10 text-center px-8 sm:px-12 w-full max-w-6xl flex flex-col items-center justify-center pb-28 md:pb-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full flex flex-col items-center"
        >
          
          {/* 🚨 NEW: THE ALERT BADGE */}
          {activeNoticesCount > 0 && (
            <a 
              href="#call-board" 
              className="inline-flex items-center gap-2 bg-[#FF5F5F] border-2 md:border-4 border-[#2D2D2D] text-white px-4 md:px-6 py-2 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all mb-6 md:mb-8 group cursor-pointer"
            >
              <span className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full animate-pulse" />
              {activeNoticesCount} Active Alert{activeNoticesCount > 1 ? 's' : ''}
              <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 -mr-2">↓</span>
            </a>
          )}

          <h1 
            style={{ 
              fontSize: safeTitleSize, 
              fontFamily: "'Cinzel', serif",
              lineHeight: "0.9"
            }}
            className="font-black text-[#FFF9F0] uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6 md:mb-10 mx-auto break-words"
          >
            {data.headerTitle || "SWAANG"}
          </h1>
          
          <div className="inline-block bg-white/5 border border-white/20 backdrop-blur-md px-6 py-3 md:px-10 md:py-4 rounded-3xl md:rounded-full max-w-full">
            <p 
              style={{ fontSize: safeTagSize }} 
              className="font-bold uppercase tracking-[0.15em] md:tracking-[0.4em] text-[#FFF9F0]/80 italic break-words"
            >
              {data.headerTagline || "A Drama Club of SSTC"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* 🎞️ TICKER */}
      {activeNotice && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#FFF9F0] text-[#1A1A1A] py-3 md:py-5 border-t-[4px] md:border-t-[6px] border-black overflow-hidden z-[50]">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap flex items-center"
          >
             {[...Array(6)].map((_, i) => (
               <div key={i} className="flex items-center">
                 <span className="font-mono text-[10px] md:text-sm font-black uppercase mx-8 md:mx-16 tracking-[0.2em] md:tracking-[0.5em]">
                   {getNoticeText()} // CUE ACTIVE //
                 </span>
                 <div className="w-2 h-2 md:w-4 md:h-4 bg-[#1A1A1A] rotate-45 shrink-0" />
               </div>
             ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}