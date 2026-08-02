"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* The Iron Curtain - Rises on mount */}
      <motion.div
        className="fixed inset-0 z-[100] bg-black origin-top pointer-events-none flex items-center justify-center"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.7, ease: [0.87, 0, 0.13, 1] }}
      >
        <motion.div 
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center gap-4 pointer-events-none"
        >
            <span className="font-mono text-[#FFF9F0] text-xs font-black uppercase tracking-[0.5em] opacity-50">LOADING ACT</span>
            <div className="w-16 h-1 bg-[#FFD166] animate-heavyPulse"></div>
        </motion.div>
      </motion.div>

      {/* Page Content bounces in slightly */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.2,
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
