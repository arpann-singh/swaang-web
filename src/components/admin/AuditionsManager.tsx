"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AuditionsManager({ auditions }: { auditions: any[] }) {
  const [isOpen, setIsOpen] = useState(true);

  // 📡 Listen for the global switch status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site_config"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().auditionsOpen !== undefined) {
        setIsOpen(docSnap.data().auditionsOpen);
      }
    });
    return () => unsub();
  }, []);

  // 🎚️ Master Form Toggle
  const toggleForm = async () => {
    try {
      await setDoc(doc(db, "settings", "site_config"), { auditionsOpen: !isOpen }, { merge: true });
    } catch (error) {
      console.error("Error toggling form:", error);
    }
  };

  // ⭐ Toggle Shortlist Status
  const toggleShortlist = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'shortlisted' ? 'pending' : 'shortlisted';
      await updateDoc(doc(db, "auditions", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 🗑️ Delete Profile
  const deleteAudition = async (id: string) => {
    if (confirm("Permanently delete this audition profile?")) {
      try {
        await deleteDoc(doc(db, "auditions", id));
      } catch (error) {
        console.error("Error deleting audition:", error);
      }
    }
  };

  // 🧠 Smart URL Fixer
  const formatUrl = (url: string) => {
    if (!url) return "#";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  return (
    <div className="space-y-8">
      <header className="border-b-8 border-black pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Casting Desk</h1>
          <p className="text-[#FFD166] font-bold uppercase text-[10px] tracking-[0.4em]">Audition Profiles</p>
        </div>
        
        <button 
          onClick={toggleForm}
          className={`border-4 border-black px-6 py-4 font-black uppercase text-xs md:text-sm rounded-2xl shadow-[6px_6px_0px_#2D2D2D] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${isOpen ? 'bg-[#06D6A0] text-black' : 'bg-[#FF5F5F] text-white'}`}
        >
          {isOpen ? '🟢 Form is LIVE (Click to Pause)' : '🔴 Form is PAUSED (Click to Open)'}
        </button>
      </header>

      {!auditions || auditions.length === 0 ? (
        <div className="p-12 text-center font-black uppercase text-gray-400 border-4 border-dashed border-gray-300 rounded-[2rem]">No Auditions Received Yet. 🎭</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {auditions.map((actor, i) => {
            const isShortlisted = actor.status === 'shortlisted';

            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                key={actor.id} 
                className={`bg-white border-4 border-black p-6 rounded-[2rem] flex flex-col justify-between transition-all duration-300 ${isShortlisted ? 'shadow-[8px_8px_0px_#FFD166] ring-4 ring-[#FFD166]/50' : 'shadow-[8px_8px_0px_#2D2D2D]'}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6 border-b-2 border-black/10 pb-4">
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter">{actor.name}</h3>
                      <span className="inline-block bg-black text-[#06D6A0] px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full mt-2">
                        {actor.role || "Unspecified Role"}
                      </span>
                    </div>
                    {isShortlisted ? (
                      <span className="w-4 h-4 rounded-full bg-[#FFD166] border-2 border-black shadow-[2px_2px_0px_black]" title="Shortlisted ⭐" />
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-gray-300 border border-black" title="Pending Review" />
                    )}
                  </div>

                  {/* 📞 DIRECT ACTION CONTACT & PORTFOLIO BUTTONS */}
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
                    {/* 🔥 NEW: Email button now shows the actual email */}
                    <a 
                      href={`mailto:${actor.email}`} 
                      title={actor.email}
                      className="flex items-center gap-2 bg-[#FFD166] text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:-translate-y-1 shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] transition-all overflow-hidden"
                    >
                      📧 <span className="truncate max-w-[200px] sm:max-w-[150px] md:max-w-[200px] lowercase">{actor.email}</span>
                    </a>
                    
                    {/* 🔥 NEW: Phone button now shows the actual number */}
                    <a 
                      href={`tel:${actor.phone}`} 
                      className="flex items-center gap-2 bg-[#06D6A0] text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:-translate-y-1 shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] transition-all whitespace-nowrap"
                    >
                      📞 {actor.phone}
                    </a>
                    
                    {actor.portfolio ? (
                      <a 
                        href={formatUrl(actor.portfolio)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 bg-white text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:-translate-y-1 shadow-[3px_3px_0px_black] hover:shadow-[5px_5px_0px_black] transition-all whitespace-nowrap"
                      >
                        🔗 Portfolio ↗
                      </a>
                    ) : (
                      <span className="flex items-center gap-2 bg-gray-100 text-gray-400 border-2 border-gray-200 px-4 py-2 font-black uppercase text-[10px] tracking-widest rounded-xl cursor-not-allowed whitespace-nowrap">
                        🚫 No Portfolio
                      </span>
                    )}
                  </div>

                  {/* 🎭 REASON/MOTIVATION */}
                  <div className="bg-gray-50 p-5 rounded-2xl border-2 border-black/10 mb-6 relative">
                    <div className="absolute -top-3 left-4 bg-[#2D2D2D] text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                      Motivation
                    </div>
                    {actor.reason ? (
                      <p className="font-bold text-sm italic text-gray-700 leading-relaxed mt-2 whitespace-pre-wrap">"{actor.reason}"</p>
                    ) : (
                      <p className="font-bold text-sm italic text-gray-400 leading-relaxed mt-2">No motivation provided.</p>
                    )}
                  </div>
                </div>

                {/* ⭐ BOTTOM ACTION CONTROLS */}
                <div className="flex flex-wrap gap-3 border-t-4 border-black pt-5 mt-auto">
                  <button 
                    onClick={() => toggleShortlist(actor.id, actor.status)}
                    className={`flex-1 text-black border-2 border-black py-3 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[3px_3px_0px_black] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_black] ${isShortlisted ? 'bg-gray-200 hover:bg-gray-300' : 'bg-[#FFD166] hover:bg-[#ffc233]'}`}
                  >
                    {isShortlisted ? '❌ Undo Shortlist' : '⭐ Shortlist Actor'}
                  </button>
                  <button 
                    onClick={() => deleteAudition(actor.id)}
                    className="bg-[#FF5F5F] text-white border-2 border-black px-5 py-3 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-[3px_3px_0px_black] hover:translate-y-0.5 hover:shadow-[1px_1px_0px_black]"
                  >
                    Drop
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
