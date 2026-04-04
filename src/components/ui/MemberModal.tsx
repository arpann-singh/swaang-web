"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function MemberModal({ member, onClose }: { member: any, onClose: () => void }) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} 
        className="absolute inset-0 bg-[#2D2D2D]/90 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative bg-[#FFF9F0] border-8 border-[#2D2D2D] w-full max-w-2xl rounded-[3rem] shadow-[20px_20px_0px_#FFD166] overflow-hidden flex flex-col md:flex-row z-50"
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-20 w-12 h-12 bg-white border-4 border-[#2D2D2D] rounded-full font-black text-xl hover:bg-[#FF5F5F] hover:text-white transition-colors">✕</button>

        <div className="w-full md:w-1/2 aspect-square md:aspect-auto h-80 md:h-auto border-b-8 md:border-b-0 md:border-r-8 border-[#2D2D2D]">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center text-[#2D2D2D]">
          <div className="mb-6">
            <h2 className="font-cinzel text-4xl font-black uppercase tracking-tighter leading-none mb-2">{member.name}</h2>
            <p className="font-black uppercase tracking-widest text-[#FF5F5F] text-[10px] bg-[#FF5F5F]/10 px-3 py-1 rounded-full inline-block">{member.role}</p>
          </div>

          <p className="font-medium italic text-lg leading-relaxed mb-8">"{member.description || "A Swaang thing."}"</p>

          <div className="flex flex-wrap gap-4">
            {member.instagram && (
              <a href={`https://instagram.com/${member.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="w-14 h-14 bg-white border-4 border-[#2D2D2D] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:text-[#FF5F5F] transition-colors"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-14 h-14 bg-white border-4 border-[#2D2D2D] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:text-[#0077b5] transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            )}
            {member.github && (
              <a href={member.github} target="_blank" rel="noreferrer" className="w-14 h-14 bg-white border-4 border-[#2D2D2D] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 group-hover:text-[#2D2D2D] transition-colors"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
