"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Timeline({ timeline }: { timeline: any[] }) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <section id="journey" className="py-32 px-6 bg-[#06D6A0] border-b-[12px] border-[#2D2D2D]">
      <h2 className="font-cinzel text-6xl md:text-9xl font-black uppercase text-center mb-32">The Journey</h2>
      <div className="max-w-5xl mx-auto relative before:absolute before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-full before:bg-[#2D2D2D]">
        {timeline.map((m, i) => (
          <div key={m.id} onClick={() => setSelected(m)} className={`relative flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-24 cursor-pointer group`}>
            <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-4 border-[#2D2D2D] rounded-full z-10 group-hover:bg-[#FF5F5F] transition-colors" />
            <div className="w-[85%] md:w-[45%] bg-white border-4 border-[#2D2D2D] p-6 md:p-8 rounded-[2rem] shadow-[12px_12px_0px_#2D2D2D] group-hover:-translate-y-2 transition-transform">
              <span className="bg-[#FF5F5F] text-white px-3 py-1 rounded font-black text-xs">{m.year}</span>
              <h4 className="text-2xl md:text-3xl font-black uppercase mt-4">{m.event}</h4>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[6000] bg-[#2D2D2D]/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#FFF9F0] border-8 border-[#2D2D2D] w-full max-w-4xl rounded-[3rem] p-10 relative overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} className="absolute top-5 right-10 text-4xl font-black">✕</button>
              <h2 className="text-4xl font-black uppercase mb-6">{selected.event}</h2>
              <p className="text-xl italic mb-10">"{selected.description}"</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <img src={selected.photo1} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-2xl" />
                <img src={selected.photo2} className="w-full aspect-video object-cover border-4 border-[#2D2D2D] rounded-2xl" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
