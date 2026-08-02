"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Productions({ events }: { events: any[] }) {
  return (
    <section id="productions" className="py-24 md:py-40 px-6 bg-white relative overflow-hidden border-b-8 border-black">
      
      {/* 🎭 THEATRICAL MARQUEE WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-5 pointer-events-none overflow-hidden select-none z-0">
        <h1 className="text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black">
          NOW SHOWING // NOW SHOWING // NOW SHOWING // 
        </h1>
        <h1 className="text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-40">
          PLAYBILL ARCHIVE // PLAYBILL ARCHIVE // 
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
          <div className="max-w-3xl">
            <span className="bg-[#FF5F5F] text-white px-6 py-2 font-mono font-black uppercase text-xs tracking-[0.3em] shadow-[4px_4px_0px_black] border-4 border-black inline-block mb-6">
              THE REPERTOIRE
            </span>
            <h2 className="text-6xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter text-black leading-[0.85] mt-4">
              MAJOR <br />
              <span className="text-white" style={{ WebkitTextStroke: '3px black' }}>PRODUCTIONS</span>
            </h2>
          </div>
          <p className="md:max-w-sm font-mono font-bold text-sm leading-relaxed uppercase bg-[#FFF9F0] border-4 border-black p-4 shadow-[6px_6px_0px_black] text-black">
            FROM SCRIPT TO STAGE. THE CULMINATION OF COUNTLESS HOURS OF REHEARSAL, SWEAT, AND DEVOTION.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {events.map((e, i) => (
            <motion.div 
              key={e.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              {/* PLAYBILL POSTER FRAME */}
              <div className="bg-[#FFF9F0] border-8 border-black p-4 md:p-6 shadow-[12px_12px_0px_#06D6A0] transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-[20px_20px_0px_#FF5F5F] h-full flex flex-col">
                
                <div className="relative aspect-[3/4] w-full border-4 border-black mb-6 bg-black overflow-hidden group-hover:border-[#FF5F5F] transition-colors">
                  {e.image ? (
                    <img 
                      src={e.image} 
                      alt={e.title} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-90 group-hover:opacity-100 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="font-mono font-black text-black opacity-30 text-2xl uppercase -rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] p-4">NO POSTER</span>
                    </div>
                  )}

                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 bg-[#FFD166] border-4 border-black px-4 py-2 font-mono font-black text-xs uppercase shadow-[4px_4px_0px_black] z-10 text-black">
                    {e.status || "PLAY"}
                  </div>
                </div>

                <div className="flex flex-col flex-1 border-t-4 border-black pt-4 border-dashed">
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-black leading-none mb-4 group-hover:text-[#FF5F5F] transition-colors">
                    {e.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-black text-[#06D6A0] font-mono font-black text-xs px-3 py-1 uppercase shadow-[2px_2px_0px_#06D6A0]">
                      {e.date}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}