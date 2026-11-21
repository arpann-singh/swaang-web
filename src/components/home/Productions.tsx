"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Ticket, ArrowRight, Film } from "lucide-react";

export default function Productions({ events }: { events: any[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section
      id="productions"
      className="py-20 md:py-40 px-4 sm:px-6 bg-white bg-stage-grid relative overflow-hidden border-b-8 border-black"
    >
      {/* 🎟️ BROADWAY CHECKERED MARQUEE BORDER STRIP */}
      <div className="absolute top-0 left-0 right-0 h-3.5 bg-checkered-strip border-b-2 border-black pointer-events-none z-10" />

      {/* 🎭 KINETIC THEATRICAL MARQUEE WATERMARK */}
      <div className="absolute inset-0 flex flex-col justify-center gap-24 opacity-[0.075] pointer-events-none overflow-hidden select-none z-0">
        <motion.h1
          animate={{ x: ["0%", "-45%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] md:text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black"
        >
          NOW SHOWING // NOW SHOWING // NOW SHOWING // NOW SHOWING //
        </motion.h1>
        <motion.h1
          animate={{ x: ["-45%", "0%"] }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="text-[15vw] md:text-[12vw] font-black font-mono uppercase whitespace-nowrap leading-none tracking-tighter text-black -ml-40"
        >
          PLAYBILL ARCHIVE // PLAYBILL ARCHIVE // PLAYBILL ARCHIVE //
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mb-14 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8"
        >
          <div className="max-w-3xl">
            <span className="bg-[#FF5F5F] text-white px-5 py-2 font-mono font-black uppercase text-xs tracking-[0.25em] shadow-[4px_4px_0px_black] border-4 border-black inline-flex items-center gap-2 mb-5">
              <Ticket size={14} />
              <span>THE REPERTOIRE</span>
            </span>
            <h2 className="text-[10.5vw] sm:text-6xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter text-black leading-[0.85] mt-2">
              MAJOR <br />
              <span
                className="text-white"
                style={{ WebkitTextStroke: "2.5px black" }}
              >
                PRODUCTIONS
              </span>
            </h2>
          </div>
          <p className="md:max-w-sm font-mono font-bold text-xs sm:text-sm leading-relaxed uppercase bg-[#FFF9F0] border-4 border-black p-4 shadow-[6px_6px_0px_black] text-black">
            FROM SCRIPT TO STAGE. THE CULMINATION OF COUNTLESS HOURS OF REHEARSAL, SWEAT, AND DEVOTION.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
          {events.map((e, i) => {
            const isActive = selectedId === e.id;
            return (
              <motion.div
                key={e.id || i}
                onClick={() =>
                  setSelectedId((prev) => (prev === e.id ? null : e.id))
                }
                initial={{
                  opacity: 0,
                  y: 55,
                  rotate: i % 2 === 0 ? -2.5 : 2.5,
                  scale: 0.94,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotate: 0,
                  scale: 1,
                }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.97, rotate: i % 2 === 0 ? -1 : 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 250,
                  damping: 18,
                }}
                className="group relative cursor-pointer select-none"
              >
                {/* PLAYBILL POSTER FRAME */}
                <div
                  className={`bg-[#FFF9F0] border-6 sm:border-8 border-black p-4 md:p-6 transition-all duration-300 h-full flex flex-col ${
                    isActive
                      ? "shadow-[14px_14px_0px_#FF5F5F] -translate-y-2"
                      : "shadow-[10px_10px_0px_#06D6A0] sm:shadow-[12px_12px_0px_#06D6A0] group-hover:-translate-y-2 group-hover:shadow-[18px_18px_0px_#FF5F5F]"
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full border-4 border-black mb-5 bg-black overflow-hidden group-hover:border-[#FF5F5F] transition-colors">
                    {e.image ? (
                      <img
                        src={e.image}
                        alt={e.title}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          isActive
                            ? "opacity-100 scale-100"
                            : "opacity-90 group-hover:opacity-100 scale-105 group-hover:scale-100"
                        }`}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <span className="font-mono font-black text-black opacity-30 text-2xl uppercase -rotate-12 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] p-4">
                          NO POSTER
                        </span>
                      </div>
                    )}

                    {/* Top Playbill Ribbon */}
                    <div className="absolute top-3 left-3 bg-black text-white border-2 border-black px-2.5 py-1 font-mono font-black text-[10px] uppercase tracking-widest z-10">
                      PLAYBILL #0{i + 1}
                    </div>

                    {/* Date / Status Badge */}
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        delay: i * 0.25,
                      }}
                      className="absolute top-3 right-3 bg-[#FFD166] border-3 sm:border-4 border-black px-3 sm:px-4 py-1.5 font-mono font-black text-[10px] sm:text-xs uppercase shadow-[4px_4px_0px_black] z-10 text-black"
                    >
                      {e.status || "PLAY"}
                    </motion.div>
                  </div>

                  <div className="flex flex-col flex-1 border-t-4 border-black pt-4 border-dashed justify-between">
                    <div>
                      <h3
                        className={`text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none mb-3 transition-colors ${
                          isActive
                            ? "text-[#FF5F5F]"
                            : "text-black group-hover:text-[#FF5F5F]"
                        }`}
                      >
                        {e.title}
                      </h3>

                      {e.description && (
                        <p className="font-mono font-bold text-xs text-black/75 line-clamp-2 mb-4">
                          {e.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <span className="bg-black text-[#06D6A0] font-mono font-black text-xs px-3 py-1 uppercase shadow-[2px_2px_0px_#06D6A0]">
                        {e.date || "MAINSTAGE"}
                      </span>

                      <Link
                        href="/events"
                        onClick={(ev) => ev.stopPropagation()}
                        className="font-mono font-black text-[11px] uppercase bg-[#FFD166] text-black border-2 border-black px-3 py-1 shadow-[2px_2px_0px_black] hover:bg-[#FF5F5F] hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <span>SHOWBILL</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Gateway Bar to Showtimes & Production Archive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/events"
            className="w-full sm:w-auto bg-black text-[#FFD166] border-4 border-black px-8 py-4 font-mono font-black uppercase text-xs sm:text-sm tracking-widest shadow-[6px_6px_0px_#FF5F5F] hover:bg-[#FFD166] hover:text-black active:translate-y-1 transition-all inline-flex items-center justify-center gap-2"
          >
            <Ticket size={16} />
            <span>VIEW LIVE SHOWTIMES &amp; TICKETS</span>
          </Link>
          <Link
            href="/archive"
            className="w-full sm:w-auto bg-[#FFF9F0] text-black border-4 border-black px-8 py-4 font-mono font-black uppercase text-xs sm:text-sm tracking-widest shadow-[6px_6px_0px_black] hover:bg-[#06D6A0] active:translate-y-1 transition-all inline-flex items-center justify-center gap-2"
          >
            <Film size={16} />
            <span>EXPLORE PRODUCTION ARCHIVE</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}