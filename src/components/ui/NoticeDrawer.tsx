"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function NoticeDrawer({ message }: { message: string }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && message && (
        <motion.div 
          initial={{ x: 400 }} 
          animate={{ x: 0 }} 
          exit={{ x: 400 }}
          className="fixed right-6 bottom-24 z-[110] w-72 md:w-80"
        >
          <div className="bg-white border-4 border-[#2D2D2D] p-6 shadow-[8px_8px_0px_#FF5F5F] rounded-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute -top-4 -left-4 bg-[#2D2D2D] text-white w-8 h-8 rounded-full font-black text-xs border-2 border-white shadow-lg"
            >
              X
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF5F5F] mb-2 block">
              Casting Call / Notice
            </span>
            <p className="font-bold text-sm leading-tight text-[#2D2D2D]">
              {message}
            </p>
            <div className="mt-4 pt-4 border-t-2 border-dashed border-[#2D2D2D]/10 flex justify-between items-center">
               <span className="text-[9px] font-black opacity-30 uppercase">Swaang Stage Ops</span>
               <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
