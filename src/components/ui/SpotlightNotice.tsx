"use client";
import { motion } from "framer-motion";

export default function SpotlightNotice({ title, content }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-[#1A1A1A]/95 flex items-center justify-center p-6 backdrop-blur-sm"
    >
      <div className="max-w-2xl w-full text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative inline-block"
        >
          <h2 className="font-cinzel text-6xl md:text-8xl font-black text-white uppercase leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(255,95,95,0.4)]">
            {title}
          </h2>
          <div className="h-2 w-full bg-[#FF5F5F] mt-4" />
        </motion.div>
        
        <p className="text-xl md:text-3xl font-black uppercase tracking-widest text-[#06D6A0] italic">
          {content}
        </p>

        <button 
          onClick={() => window.location.reload()} // Or use a state-based close
          className="bg-white border-4 border-black px-12 py-4 font-black uppercase tracking-widest rounded-full shadow-[6px_6px_0px_#FF5F5F] hover:shadow-none transition-all active:scale-95"
        >
          Enter the Stage →
        </button>
      </div>
    </motion.div>
  );
}
