"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export default function ConflictMapper() {
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [activeDetail, setActiveDetail] = useState<{ day: string, hour: number, busyNames: string[] } | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "availability"), (s) => {
      setAllSchedules(s.docs.map(d => d.data()));
    });
  }, []);

  const getSlotData = (day: string, hour: number) => {
    const id = `${day}-${hour}`;
    const targetSchedules = selectedCrew.length > 0 
      ? allSchedules.filter(s => selectedCrew.includes(s.userId))
      : allSchedules;
    
    const busyPeople = targetSchedules.filter(s => s.slots.includes(id));
    const busyNames = busyPeople.map(p => p.userName);
    const ratio = targetSchedules.length > 0 ? busyPeople.length / targetSchedules.length : 0;

    return { ratio, busyNames, totalChecked: targetSchedules.length };
  };

  const getHeatColor = (ratio: number) => {
    if (ratio === 0) return "bg-[#06D6A0] shadow-[0_0_10px_rgba(6,214,160,0.3)]"; 
    if (ratio < 0.3) return "bg-green-200 border-green-300";
    if (ratio < 0.6) return "bg-yellow-200 border-yellow-300";
    return "bg-red-400 border-red-500 shadow-inner"; 
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#FFD166] text-white flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Conflict Mapper</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06D6A0] mt-1">Click a slot to see who is busy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* 👥 CREW SELECTOR */}
        <div className="xl:col-span-3 bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[6px_6px_0px_black] h-fit">
          <h3 className="font-black uppercase text-[10px] mb-4 text-[#FF5F5F] tracking-widest">Filter by Cast</h3>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {allSchedules.map(s => (
              <button 
                key={s.userId} 
                onClick={() => setSelectedCrew(prev => prev.includes(s.userId) ? prev.filter(id => id !== s.userId) : [...prev, s.userId])}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${selectedCrew.includes(s.userId) ? 'bg-[#2D2D2D] text-white border-black' : 'bg-gray-50 border-transparent hover:border-black/10'}`}
              >
                <div className={`w-2 h-2 rounded-full ${selectedCrew.includes(s.userId) ? 'bg-[#06D6A0]' : 'bg-gray-300'}`} />
                <span className="font-black text-[10px] uppercase truncate">{s.userName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🗺️ MASTER HEATMAP */}
        <div className="xl:col-span-9 bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_black]">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="p-2"></th>
                  {DAYS.map(d => <th key={d} className="p-2 font-black text-[10px] uppercase text-black">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HOURS.map(h => (
                  <tr key={h}>
                    <td className="p-2 font-black text-[9px] text-black/40 text-right">{h}:00</td>
                    {DAYS.map(d => {
                      const { ratio, busyNames } = getSlotData(d, h);
                      return (
                        <td key={d} className="p-0">
                          <button 
                            onClick={() => setActiveDetail({ day: d, hour: h, busyNames })}
                            className={`w-full h-10 rounded-lg border-2 transition-all hover:scale-105 hover:z-10 relative group ${getHeatColor(ratio)}`}
                          >
                             {busyNames.length > 0 && (
                               <span className="absolute top-1 right-1 text-[8px] font-black bg-black/10 rounded px-1">
                                 {busyNames.length}
                               </span>
                             )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 🔍 MODAL: WHO IS BUSY? */}
      <AnimatePresence>
        {activeDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveDetail(null)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-8 border-black p-10 rounded-[3rem] shadow-[15px_15px_0px_#FF5F5F] relative z-10 w-full max-w-md"
            >
              <div className="mb-6 border-b-4 border-black pb-4">
                <h4 className="text-3xl font-black uppercase tracking-tighter">
                  {activeDetail.day} @ {activeDetail.hour}:00
                </h4>
                <p className="text-[10px] font-black uppercase text-[#FF5F5F] mt-1">Conflict Breakdown</p>
              </div>

              <div className="space-y-3">
                <p className="font-black uppercase text-xs">Students Busy ({activeDetail.busyNames.length}):</p>
                {activeDetail.busyNames.length === 0 ? (
                  <div className="p-6 bg-[#06D6A0]/20 border-2 border-[#06D6A0] rounded-2xl text-[#06D6A0] font-black text-center uppercase text-sm">
                    🌟 All Clear! Rehearse Away.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {activeDetail.busyNames.map((name, i) => (
                      <div key={i} className="bg-gray-100 p-3 rounded-xl border-2 border-black/5 font-bold text-sm uppercase">
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setActiveDetail(null)}
                className="w-full mt-8 bg-[#2D2D2D] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-[4px_4px_0px_black] active:shadow-none active:translate-y-1 transition-all"
              >
                Close Desk
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}