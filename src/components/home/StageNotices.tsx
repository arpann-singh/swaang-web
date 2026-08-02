"use client";
import { motion } from "framer-motion";

export default function StageNotices({ notices }: { notices: any[] }) {
  // 🔥 Now looking for your exact 'isActive' field from the Admin Panel
  const activeNotices = notices.filter(n => n.isActive === true);

  if (activeNotices.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-[var(--bg-primary)] border-b-[8px] md:border-b-[12px] border-black relative overflow-hidden">
      
      {/* Background Decor - Theatrical Hazard Tape */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 -z-0">
        <div className="absolute top-[20%] -left-10 w-[120%] h-20 bg-[#FFD166] border-y-8 border-black -rotate-12 flex items-center overflow-hidden shadow-[0_8px_0px_black]">
          <div className="flex whitespace-nowrap font-mono font-black text-3xl uppercase tracking-[0.3em] text-black">
            {[...Array(10)].map((_, i) => (
               <span key={i} className="mx-4">QUIET BACKSTAGE // STAGE IN USE //</span>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-[20%] -left-10 w-[120%] h-20 bg-[#FF5F5F] border-y-8 border-black -rotate-12 flex items-center overflow-hidden shadow-[0_8px_0px_black]">
          <div className="flex whitespace-nowrap font-mono font-black text-3xl uppercase tracking-[0.3em] text-black">
            {[...Array(10)].map((_, i) => (
               <span key={i} className="mx-4">DO NOT CROSS // LIVE SET //</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 border-b-8 border-black pb-8"
        >
          <div>
            <div className="inline-block bg-[#FF5F5F] text-black border-4 border-black px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.3em] mb-4 shadow-[4px_4px_0px_black]">
              Bulletin
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-black leading-none" style={{ WebkitTextStroke: '2px black' }}>
              THE CALL <br /> <span className="bg-[#06D6A0] text-black px-2 mt-2 inline-block border-4 border-black shadow-[6px_6px_0px_black]">BOARD</span>
            </h2>
          </div>
        </motion.div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {activeNotices.map((notice, index) => (
            <motion.div 
              key={notice.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white border-8 border-black p-8 shadow-[8px_8px_0px_black] transition-all duration-300 flex flex-col group relative ${notice.priority === 'urgent' ? 'bg-[#FFF9F0]' : 'hover:-translate-y-2 hover:shadow-[12px_12px_0px_black]'}`}
            >
              {/* Brutalist Pin Decor */}
              <div className={`absolute -top-6 left-6 w-12 h-12 border-4 border-black flex items-center justify-center font-black text-xl shadow-[4px_4px_0px_black] ${notice.priority === 'urgent' ? 'bg-[#FF5F5F] text-white' : 'bg-black text-[#06D6A0]'}`}>
                !
              </div>

              <div className="mb-6 mt-6 border-b-4 border-black pb-4">
                {/* Priority Badges */}
                {notice.priority === 'urgent' && (
                  <span className="inline-block bg-[#FF5F5F] text-black border-4 border-black text-[10px] font-mono font-black uppercase px-3 py-1 tracking-widest mb-4 shadow-[2px_2px_0px_black] animate-pulse">
                    URGENT
                  </span>
                )}
                {notice.priority === 'highlight' && (
                  <span className="inline-block bg-[#FFD166] text-black border-4 border-black text-[10px] font-mono font-black uppercase px-3 py-1 tracking-widest mb-4 shadow-[2px_2px_0px_black]">
                    HIGHLIGHT
                  </span>
                )}
                
                <h3 className="text-3xl font-black uppercase tracking-tighter text-black leading-tight group-hover:text-[#FF5F5F] transition-colors">
                  {notice.title}
                </h3>
              </div>
              
              <p className="font-mono font-bold text-sm text-black leading-relaxed mb-8 flex-1 whitespace-pre-wrap border-l-4 border-black pl-4">
                {notice.content}
              </p>
              
              <div className="mt-auto pt-4 flex justify-between items-center bg-black text-white p-3 border-4 border-black shadow-[4px_4px_0px_#06D6A0]">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#06D6A0]">
                  ACTIVE
                </span>
                {notice.createdAt && (
                  <span className="text-[10px] font-mono font-black uppercase">
                    {notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString() : 'JUST NOW'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
