"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AuditionsManager({ auditions }: { auditions: any[] }) {
  const [isOpen, setIsOpen] = useState(true); // Default assuming it's open

  // 📡 Listen for the global switch status
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site_config"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().auditionsOpen !== undefined) {
        setIsOpen(docSnap.data().auditionsOpen);
      }
    });
    return () => unsub();
  }, []);

  // 🎚️ Flip the Switch!
  const toggleForm = async () => {
    try {
      // We use setDoc with { merge: true } so we don't accidentally erase other site_config data
      await setDoc(doc(db, "settings", "site_config"), { auditionsOpen: !isOpen }, { merge: true });
    } catch (error) {
      console.error("Error toggling form:", error);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "auditions", id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const deleteAudition = async (id: string) => {
    if (confirm("Permanently delete this audition profile?")) {
      try {
        await deleteDoc(doc(db, "auditions", id));
      } catch (error) {
        console.error("Error deleting audition:", error);
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="border-b-8 border-black pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Casting Desk</h1>
          <p className="text-[#FFD166] font-bold uppercase text-[10px] tracking-[0.4em]">Audition Profiles</p>
        </div>
        
        {/* 🎛️ THE MASTER TOGGLE BUTTON */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {auditions.map((actor, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              key={actor.id} 
              className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_#2D2D2D] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{actor.name}</h3>
                    <span className="inline-block bg-black text-[#06D6A0] px-3 py-1 font-black text-[9px] uppercase tracking-widest rounded-full mt-1">
                      {actor.role || "Unspecified Role"}
                    </span>
                  </div>
                  {actor.status === 'pending' && (
                    <span className="w-3 h-3 rounded-full bg-[#FFD166] animate-pulse border border-black" title="Pending Review" />
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <p className="font-mono text-[10px] uppercase font-bold text-gray-500">📧 {actor.email}</p>
                  <p className="font-bold text-[10px] uppercase text-gray-500 tracking-widest">📞 {actor.phone}</p>
                  {actor.portfolio && (
                    <a href={actor.portfolio} target="_blank" className="font-mono text-[10px] uppercase font-black text-[#FF5F5F] hover:underline inline-block">
                      🔗 View Portfolio ↗
                    </a>
                  )}
                </div>

                {actor.reason && (
                  <div className="bg-gray-100 p-4 rounded-xl border-2 border-black/10 mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Motivation</p>
                    <p className="font-bold text-xs italic">"{actor.reason}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 border-t-4 border-black pt-4 mt-auto">
                <button 
                  onClick={() => updateStatus(actor.id, 'reviewed')}
                  disabled={actor.status === 'reviewed'}
                  className="flex-1 bg-[#06D6A0] text-black border-2 border-black py-2 font-black uppercase text-[9px] rounded-xl hover:bg-[#05b586] disabled:opacity-50 disabled:bg-gray-200 transition-colors shadow-[2px_2px_0px_black]"
                >
                  {actor.status === 'reviewed' ? 'Reviewed ✓' : 'Mark Reviewed'}
                </button>
                <button 
                  onClick={() => deleteAudition(actor.id)}
                  className="bg-[#FF5F5F] text-white border-2 border-black px-4 py-2 font-black uppercase text-[9px] rounded-xl hover:bg-red-600 transition-colors shadow-[2px_2px_0px_black]"
                >
                  Drop
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
