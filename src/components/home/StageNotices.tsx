"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, CheckCircle2, BellRing } from "lucide-react";

export default function StageNotices({ notices }: { notices: any[] }) {
  const activeNotices = notices.filter((n) => n.isActive === true);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>({});

  if (activeNotices.length === 0) return null;

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-20 md:py-24 px-4 sm:px-6 bg-[var(--bg-primary)] border-b-[8px] md:border-b-[12px] border-black relative overflow-hidden">
      {/* Background Decor - Animated Kinetic Theatrical Hazard Tape */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 -z-0">
        <div className="absolute top-[16%] -left-10 w-[130%] h-14 sm:h-20 bg-[#FFD166] border-y-4 sm:border-y-8 border-black -rotate-12 flex items-center overflow-hidden shadow-[0_6px_0px_black]">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap font-mono font-black text-xl sm:text-3xl uppercase tracking-[0.25em] text-black"
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4">
                QUIET BACKSTAGE // STAGE IN USE //
              </span>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-[16%] -left-10 w-[130%] h-14 sm:h-20 bg-[#FF5F5F] border-y-4 sm:border-y-8 border-black -rotate-12 flex items-center overflow-hidden shadow-[0_6px_0px_black]">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap font-mono font-black text-xl sm:text-3xl uppercase tracking-[0.25em] text-black"
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className="mx-4">
                DO NOT CROSS // LIVE SET //
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-4 sm:gap-6 border-b-8 border-black pb-6 sm:pb-8"
        >
          <div>
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 bg-[#FF5F5F] text-black border-4 border-black px-4 py-1.5 text-xs font-mono font-black uppercase tracking-[0.25em] mb-4 shadow-[4px_4px_0px_black]"
            >
              <BellRing size={14} />
              <span>Backstage Bulletin</span>
            </motion.div>
            <h2
              className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter text-black leading-none"
              style={{ WebkitTextStroke: "2px black" }}
            >
              THE CALL <br />{" "}
              <motion.span
                initial={{ rotate: -3, scale: 0.9 }}
                whileInView={{ rotate: -1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-[#06D6A0] text-black px-3 mt-2 inline-block border-4 border-black shadow-[6px_6px_0px_black]"
              >
                BOARD
              </motion.span>
            </h2>
          </div>

          <p className="font-mono font-black text-xs uppercase tracking-widest bg-white border-4 border-black px-3.5 py-2 shadow-[4px_4px_0px_black] text-black">
            📌 TAP ANY DISPATCH CARD TO STAMP &ldquo;READ&rdquo;
          </p>
        </motion.div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
          {activeNotices.map((notice, index) => {
            const cardId = String(notice.id || index);
            const isAck = Boolean(acknowledgedIds[cardId]);

            return (
              <motion.div
                key={cardId}
                onClick={() => toggleAcknowledge(cardId)}
                initial={{
                  opacity: 0,
                  y: 45,
                  rotate: index % 2 === 0 ? -3 : 3,
                  scale: 0.94,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  rotate: isAck ? 0 : index % 2 === 0 ? -1 : 1,
                  scale: 1,
                }}
                whileTap={{ scale: 0.96, rotate: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                className={`border-6 sm:border-8 border-black p-6 sm:p-8 shadow-[8px_8px_0px_black] transition-all duration-300 flex flex-col group relative cursor-pointer select-none ${
                  isAck
                    ? "bg-[#06D6A0]/20 shadow-[4px_4px_0px_black]"
                    : notice.priority === "urgent"
                    ? "bg-[#FFF9F0]"
                    : "bg-white hover:-translate-y-2 hover:shadow-[12px_12px_0px_black]"
                }`}
              >
                {/* Brutalist Pin Decor with Pendulum Bounce */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className={`absolute -top-6 left-6 w-12 h-12 border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_black] ${
                    isAck
                      ? "bg-[#06D6A0] text-black"
                      : notice.priority === "urgent"
                      ? "bg-[#FF5F5F] text-white"
                      : "bg-black text-[#06D6A0]"
                  }`}
                >
                  {isAck ? <CheckCircle2 size={22} /> : <Pin size={20} />}
                </motion.div>

                {/* Interactive Stamp Overlay when tapped on mobile */}
                <AnimatePresence>
                  {isAck && (
                    <motion.div
                      initial={{ scale: 1.8, opacity: 0, rotate: -18 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute top-4 right-4 bg-black text-[#06D6A0] border-2 border-black px-2.5 py-1 font-mono font-black text-[10px] uppercase tracking-widest shadow-[3px_3px_0px_#06D6A0] z-20"
                    >
                      ✓ STAMPED: NOTED
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-5 mt-5 border-b-4 border-black pb-4">
                  {notice.priority === "urgent" && (
                    <span className="inline-block bg-[#FF5F5F] text-black border-4 border-black text-[10px] font-mono font-black uppercase px-3 py-1 tracking-widest mb-3 shadow-[2px_2px_0px_black] animate-pulse">
                      URGENT CALL
                    </span>
                  )}
                  {notice.priority === "highlight" && (
                    <span className="inline-block bg-[#FFD166] text-black border-4 border-black text-[10px] font-mono font-black uppercase px-3 py-1 tracking-widest mb-3 shadow-[2px_2px_0px_black]">
                      HIGHLIGHT
                    </span>
                  )}

                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black leading-tight group-hover:text-[#FF5F5F] transition-colors">
                    {notice.title}
                  </h3>
                </div>

                <p className="font-mono font-bold text-xs sm:text-sm text-black leading-relaxed mb-6 sm:mb-8 flex-1 whitespace-pre-wrap border-l-4 border-black pl-4">
                  {notice.content}
                </p>

                <div className="mt-auto pt-4 flex justify-between items-center bg-black text-white p-3 border-4 border-black shadow-[4px_4px_0px_#06D6A0]">
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#06D6A0]">
                    {isAck ? "✓ CALL ACKNOWLEDGED" : "TAP TO ACKNOWLEDGE"}
                  </span>
                  {notice.createdAt && (
                    <span className="text-[10px] font-mono font-black uppercase">
                      {notice.createdAt?.toDate
                        ? notice.createdAt.toDate().toLocaleDateString()
                        : "LIVE"}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
