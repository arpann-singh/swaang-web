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
    // 1. Fetch Branding
    onSnapshot(doc(db, "settings", "homepage"), (doc) => { if (doc.exists()) setConfig(doc.data()); });
    
    // 2. Fetch Audition Status
    onSnapshot(doc(db, "settings", "site_config"), (doc) => {
      if (doc.exists()) setIsAuditionOpen(doc.data().auditionsOpen);
    });
  }, []);

  return (
    <section className="relative h-[95vh] flex items-center justify-center px-6 overflow-hidden border-b-8 border-[#2D2D2D] bg-[#FFF9F0]">
      {config?.headerImageUrl && (
        <div className="absolute inset-0 z-0">
          <img src={config.headerImageUrl} className="w-full h-full object-cover opacity-60" alt="bg" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF9F0]/20 via-transparent to-[#FFF9F0]/80" />
        </div>
      )}

      <div className="container mx-auto text-center z-10">
        <motion.h1 className="font-cinzel text-6xl md:text-9xl font-black text-[#2D2D2D] leading-[0.9] tracking-tighter" style={{ textShadow: "4px 4px 0px #FFFFFF" }}>
          {config?.headerTitle || "SWAANG THE DRAMA CLUB"}
        </motion.h1>

        <div className="mt-20 flex flex-col md:flex-row items-center justify-center gap-10">
          <Link href="/#founders-note">
            <button className="bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] px-16 py-6 rounded-full font-black text-xs uppercase shadow-[10px_10px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
              Know More
            </button>
          </Link>
          
          {isAuditionOpen && (
            <Link href="/auditions">
              <button className="bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] px-16 py-6 rounded-full font-black text-xs uppercase shadow-[10px_10px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                Join the Ensemble
              </button>
            </Link>
          )}
          
          {!isAuditionOpen && (
            <Link href="/events">
              <button className="bg-[#FFD166] text-[#2D2D2D] border-4 border-[#2D2D2D] px-16 py-6 rounded-full font-black text-xs uppercase shadow-[10px_10px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                See the Works
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
