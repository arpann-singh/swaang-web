"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function AvailabilityGrid({ userId, userName }: { userId: string, userName: string }) {
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userId) return;
    return onSnapshot(doc(db, "availability", userId), (d) => {
      if (d.exists()) setBusySlots(d.data().slots || []);
    });
  }, [userId]);

  const toggleSlot = (slot: string) => {
    setBusySlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "availability", userId), { 
        userId, userName, slots: busySlots, updatedAt: Date.now() 
      });
      alert("Schedule Synced! 🕒");
    } catch (e) {
      alert("Failed to sync.");
    }
    setSaving(false);
  };

  return (
    <div className="bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_#2D2D2D] text-black">
      <h3 className="font-black uppercase text-[10px] mb-4 text-[#FF5F5F] tracking-widest">
        Mark Your Busy Hours (Classes/Labs)
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              {/* Top-left empty cell */}
              <th className="p-1"></th>
              {DAYS.map(d => (
                <th key={d} className="p-1 font-black text-[10px] uppercase text-black tracking-tighter">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(h => (
              <tr key={h}>
                {/* Time Label on the left */}
                <td className="p-1 font-black text-[9px] text-black/40 text-right pr-2">
                  {h}:00
                </td>
                {DAYS.map(d => {
                  const id = `${d}-${h}`;
                  const isBusy = busySlots.includes(id);
                  return (
                    <td key={id} className="p-0">
                      <button 
                        onClick={() => toggleSlot(id)}
                        className={`w-full h-8 rounded-lg border-2 transition-all ${
                          isBusy 
                          ? 'bg-[#FF5F5F] border-black shadow-[2px_2px_0px_black]' 
                          : 'bg-gray-100 border-black/5 hover:border-black/20'
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button 
        onClick={saveAvailability} 
        className="w-full mt-6 bg-[#2D2D2D] text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#06D6A0] hover:translate-y-0.5 active:shadow-none transition-all"
      >
        {saving ? "Syncing..." : "Update My Schedule"}
      </button>
    </div>
  );
}