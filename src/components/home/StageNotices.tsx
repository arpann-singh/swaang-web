"use client";
import { motion } from "framer-motion";

export default function StageNotices({ notices }: { notices: any[] }) {
  // 🔥 Now looking for your exact 'isActive' field from the Admin Panel
  const activeNotices = notices.filter(n => n.isActive === true);

  if (activeNotices.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-[#FFF9F0] border-b-[8px] md:border-b-[12px] border-[#2D2D2D] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD166] rounded-full blur-[100px] opacity-40 -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#06D6A0] rounded-full blur-[100px] opacity-30 -z-0" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6"
        >
          <div>
            <div className="inline-block bg-[#FF5F5F] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-[3px_3px_0px_#2D2D2D]">
              Bulletin
            </div>
            <h2 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-none">
              The Call <br /> <span className="italic text-black/40">Board</span>
            </h2>
          </div>
        </motion.div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeNotices.map((notice, index) => (
            <motion.div 
              key={notice.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white border-4 p-8 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] transition-all duration-300 flex flex-col group relative ${notice.priority === 'urgent' ? 'border-[#FF5F5F] hover:translate-x-1 hover:-translate-y-1' : 'border-[#2D2D2D] hover:-translate-y-2'}`}
            >
              {/* Pin Decor */}
              <div className={`absolute -top-3 left-8 w-6 h-6 rounded-full flex items-center justify-center ${notice.priority === 'urgent' ? 'bg-[#FF5F5F]' : 'bg-[#2D2D2D]'}`}>
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>

              <div className="mb-6 mt-2 border-b-4 border-black/10 pb-4">
                {/* Priority Badges synced to your Admin Panel */}
                {notice.priority === 'urgent' && (
                  <span className="inline-block bg-[#FF5F5F] text-white text-[9px] font-black uppercase px-2 py-1 rounded-sm tracking-widest mb-3 animate-pulse">
                    Urgent Alert
                  </span>
                )}
                {notice.priority === 'highlight' && (
                  <span className="inline-block bg-[#FFD166] text-black border-2 border-black text-[9px] font-black uppercase px-2 py-1 rounded-sm tracking-widest mb-3">
                    Highlighted
                  </span>
                )}
                
                <h3 className="text-2xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-tight group-hover:text-[#FF5F5F] transition-colors">
                  {notice.title}
                </h3>
              </div>
              
              <p className="font-bold text-sm text-[#2D2D2D]/70 leading-relaxed mb-6 flex-1 whitespace-pre-wrap">
                {notice.content}
              </p>
              
              <div className="mt-auto pt-4 flex justify-between items-center border-t-2 border-dashed border-black/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#06D6A0]">
                  Active Notice
                </span>
                {notice.createdAt && (
                  <span className="text-[9px] font-mono font-bold text-black/40 uppercase">
                    {/* Handles Firebase serverTimestamps properly */}
                    {notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleDateString() : 'Just Now'}
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
