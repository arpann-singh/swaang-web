"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Hero({ data }: { data: any }) {
  const [activeNotice, setActiveNotice] = useState<any>(null);
  
  // 📱 Device-Safe Scaling Logic
  const imageSource = data.headerImageUrl || data.headerImage;
  const titleSize = data.styles?.hTitleSize || "clamp(2.5rem, 12vw, 10rem)";
  const tagSize = data.styles?.hTaglineSize || "clamp(0.6rem, 2.5vw, 1.2rem)";

  useEffect(() => {
    const q = query(collection(db, "notices"), where("live", "==", true));
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
      
      {/* 🎞️ BACKGROUND: Responsive Image */}
      <div className="absolute inset-0 z-0">
        {imageSource && (
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            src={imageSource} 
            className="w-full h-full object-cover grayscale brightness-50" 
          />
        )}
        {/* Deep Vignette for Mobile Focus */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-transparent to-[#1A1A1A] opacity-90" />
      </div>

      {/* ✍️ CONTENT: Centered & Padded for Mobile */}
      <div className="relative z-10 text-center px-4 w-full max-w-[95vw] md:max-w-6xl flex flex-col items-center justify-center pb-24 md:pb-0">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 
            style={{ 
              fontSize: titleSize, 
              fontFamily: "'Cinzel', serif",
              lineHeight: "0.9"
            }}
            className="font-black text-[#FFF9F0] uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-6 md:mb-10"
          >
            {data.headerTitle || "SWAANG"}
          </h1>
          
          <div className="inline-block bg-white/5 border border-white/20 backdrop-blur-md px-5 py-2 md:px-10 md:py-4 rounded-2xl md:rounded-full">
            <p 
              style={{ fontSize: tagSize }} 
              className="font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] text-[#FFF9F0]/80 italic"
            >
              {data.headerTagline || "A Drama Club of SSTC"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* 🎞️ TICKER: Responsive Film Strip */}
      {activeNotice && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#FFF9F0] text-[#1A1A1A] py-3 md:py-5 border-t-[4px] md:border-t-[6px] border-black overflow-hidden z-[50]">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap flex items-center"
          >
             {[...Array(6)].map((_, i) => (
               <div key={i} className="flex items-center">
                 <span className="font-mono text-[9px] md:text-sm font-black uppercase mx-8 md:mx-16 tracking-[0.2em] md:tracking-[0.5em]">
                   {getNoticeText()} // CUE ACTIVE //
                 </span>
                 <div className="w-2 h-2 md:w-4 md:h-4 bg-[#1A1A1A] rotate-45 shrink-0" />
               </div>
             ))}
          </motion.div>
        </div>
      )}

      {/* 🎭 CORNER DECOR (Desktop Only) */}
      <div className="absolute top-10 left-10 hidden xl:block border-t-2 border-l-2 border-white/20 w-12 h-12" />
      <div className="absolute bottom-20 right-10 hidden xl:block border-b-2 border-r-2 border-white/20 w-12 h-12" />
    </section>
  );
}
