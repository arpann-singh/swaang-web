"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero = () => {
  const [config, setConfig] = useState<any>(null);
  const [isAuditionOpen, setIsAuditionOpen] = useState(false);

  useEffect(() => {
    onSnapshot(doc(db, "settings", "homepage"), (doc) => { if (doc.exists()) setConfig(doc.data()); });
    onSnapshot(doc(db, "settings", "site_config"), (doc) => {
      if (doc.exists()) setIsAuditionOpen(doc.data().auditionsOpen);
    });
  }, []);

  const titleText = config?.headerTitle || "SWAANG THE DRAMA CLUB";
  const words = titleText.split(" ");

  return (
    <section className="relative min-h-[95vh] pt-24 pb-12 flex flex-col justify-center overflow-hidden border-b-8 border-[var(--border-primary)] bg-[#FFF9F0]">
      
      {/* 📺 Background Noise for raw print texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png")' }} />

      {/* 🎗️ Diagonal Marquee Ribbon Background */}
      <div className="absolute top-[25%] md:top-[35%] -left-[10%] right-[-10%] bg-[#FF5F5F] text-white border-y-[6px] border-[var(--border-primary)] py-4 md:py-6 transform -rotate-3 md:-rotate-6 z-0 overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
         <motion.div 
           animate={{ x: [0, -1500] }} 
           transition={{ repeat: Infinity, ease: "linear", duration: 15 }} 
           className="flex whitespace-nowrap font-mono font-black uppercase text-2xl md:text-4xl tracking-[0.2em]"
         >
            {Array(15).fill("ART IS RESISTANCE // NO RULES // ONLY IMPACT // ").map((text, i) => (
              <span key={i} className="mx-4">{text}</span>
            ))}
         </motion.div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 md:px-12 w-full flex flex-col items-start justify-between min-h-[60vh]">
         
         {/* 💥 Giant Typography Manifesto */}
         <div className="w-full">
            <h1 className="flex flex-wrap items-end gap-x-4 md:gap-x-8 gap-y-2 md:gap-y-0 leading-[0.85]">
               {words.map((word: string, index: number) => {
                  // Make every even word outlined for a collage effect
                  const isOutline = index % 2 !== 0; 
                  return (
                     <motion.span 
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`font-cinzel text-[16vw] md:text-[13vw] lg:text-[11vw] font-black uppercase tracking-tighter hover:italic hover:scale-105 transition-all duration-300 ${isOutline ? 'text-transparent' : 'text-[var(--text-primary)]'}`} 
                        style={{ WebkitTextStroke: isOutline ? "3px var(--text-primary)" : "none", textShadow: !isOutline ? "6px 6px 0px rgba(0,0,0,0.1)" : "none" }}
                     >
                        {word}
                     </motion.span>
                  );
               })}
            </h1>
         </div>

         {/* 🔲 Action Block & Manifesto Stamp */}
         <div className="w-full flex flex-col lg:flex-row items-start lg:items-end justify-between mt-12 md:mt-auto gap-10">
            
            <motion.div 
               initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
               animate={{ opacity: 1, rotate: -2, scale: 1 }}
               transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
               className="bg-[#06D6A0] text-black border-4 border-black px-6 md:px-8 py-3 shadow-[8px_8px_0px_black] w-fit"
            >
               <span className="font-mono text-sm md:text-xl font-black uppercase tracking-[0.3em]">
                  We are the ensemble.
               </span>
            </motion.div>

            {/* Brutalist Buttons */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.8 }}
               className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto"
            >
               <Link href="/#founders-note" className="w-full sm:w-auto">
                  <button className="w-full bg-white text-black border-4 border-black px-8 py-5 rounded-none font-black text-xs md:text-sm uppercase tracking-widest shadow-[6px_6px_0px_black] hover:-translate-y-1 hover:shadow-[10px_10px_0px_black] active:translate-y-2 active:shadow-none transition-all">
                     Read Manifesto
                  </button>
               </Link>
               
               {isAuditionOpen ? (
                  <Link href="/auditions" className="w-full sm:w-auto">
                     <button className="w-full bg-black text-[#FFD166] border-4 border-black px-8 py-5 rounded-none font-black text-xs md:text-sm uppercase tracking-widest shadow-[6px_6px_0px_#FFD166] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#FFD166] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-3">
                        <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD166] opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFD166]"></span>
                        </span>
                        Join The Cast
                     </button>
                  </Link>
               ) : (
                  <Link href="/events" className="w-full sm:w-auto">
                     <button className="w-full bg-black text-[#06D6A0] border-4 border-black px-8 py-5 rounded-none font-black text-xs md:text-sm uppercase tracking-widest shadow-[6px_6px_0px_#06D6A0] hover:-translate-y-1 hover:shadow-[10px_10px_0px_#06D6A0] active:translate-y-2 active:shadow-none transition-all">
                        View Archives
                     </button>
                  </Link>
               )}
            </motion.div>
         </div>
      </div>

      {/* 🎞️ Static Bottom Ticker */}
      <div className="absolute bottom-4 left-0 right-0 overflow-hidden flex z-0 pointer-events-none opacity-20">
         <motion.div 
           animate={{ x: [0, -1000] }} 
           transition={{ repeat: Infinity, ease: "linear", duration: 25 }} 
           className="flex whitespace-nowrap font-mono font-black uppercase text-[10px] tracking-widest text-[var(--border-primary)]"
         >
            {Array(15).fill("SSTC BHILAI — THEATER — NUKKAD NATAK — STAGE PLAY — ").map((text, i) => (
              <span key={i} className="mx-4">{text}</span>
            ))}
         </motion.div>
      </div>

    </section>
  );
};

export default Hero;
