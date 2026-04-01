"use client";
import { motion } from "framer-motion";

interface Props {
  number: string;
  title: string;
  align?: "left" | "center";
}

export default function SectionDivider({ number, title, align = "left" }: Props) {
  return (
    <div className={`py-20 flex flex-col ${align === "center" ? "items-center text-center" : "items-start text-left"} px-6 container mx-auto`}>
      <motion.div 
        initial={{ height: 0 }} 
        whileInView={{ height: 100 }} 
        className="w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent mb-8"
      />
      <span className="text-[10px] font-inter tracking-[0.8em] text-gray-500 uppercase mb-4 pl-2">
        {number}
      </span>
      <h2 className="font-cinzel text-5xl md:text-7xl text-white font-bold tracking-tighter italic">
        {title}<span className="text-white/20">.</span>
      </h2>
    </div>
  );
}
