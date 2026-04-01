"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

const FoundersNote = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchNote = async () => {
      const snap = await getDoc(doc(db, "settings", "homepage"));
      if (snap.exists()) setData(snap.data());
    };
    fetchNote();
  }, []);

  if (!data) return null;

  return (
    <section className="py-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white border-4 border-[#2D2D2D] p-12 md:p-20 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D] text-center"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#FF5F5F] mb-6 block">A Message From The Stage</span>
        <h2 className="font-playfair text-3xl md:text-5xl font-black text-[#2D2D2D] italic leading-tight mb-8">
          "{data.foundersNote}"
        </h2>
        <div className="space-y-1">
          <p className="font-cinzel text-xl font-black text-[#2D2D2D]">{data.foundersName}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Founder & President</p>
        </div>
      </motion.div>
    </section>
  );
};

export default FoundersNote;
