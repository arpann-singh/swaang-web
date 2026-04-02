"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export default function IdentityHub() {
  const [data, setData] = useState<any>({ styles: {} });

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "homepage"), (d) => {
      setData(d.data() || { styles: {} });
    });
  }, []);

  const syncData = async () => {
    await updateDoc(doc(db, "settings", "homepage"), data);
    alert("Directorate Identity Synced!");
  };

  const HubCard = ({ title, prefix, color }: any) => (
    <div className="bg-white border-4 border-black rounded-[2.5rem] p-8 shadow-[8px_8px_0px_black] space-y-6">
      <div className="flex items-center gap-4">
        <div className={`w-4 h-10 ${color} border-2 border-black rounded-full`}></div>
        <h3 className="text-2xl font-black uppercase tracking-tighter">{title}</h3>
      </div>

      <div className="space-y-4">
        <input 
          className="w-full border-2 border-black rounded-xl p-3 font-bold"
          placeholder="Name"
          value={data[`${prefix}Name`] || ""}
          onChange={e => setData({...data, [`${prefix}Name`]: e.target.value})}
        />
        <textarea 
          className="w-full border-2 border-black rounded-xl p-3 font-bold h-32"
          placeholder="Stage Message"
          value={data[`${prefix}Note`] || ""}
          onChange={e => setData({...data, [`${prefix}Note`]: e.target.value})}
        />
        <input 
          className="w-full border-2 border-black rounded-xl p-3 font-mono text-xs"
          placeholder="Photo URL (ImgBB)"
          value={data[`${prefix}Image`] || ""}
          onChange={e => setData({...data, [`${prefix}Image`]: e.target.value})}
        />
      </div>

      <button 
        onClick={syncData}
        className={`w-full py-4 border-4 border-black rounded-2xl font-black uppercase ${color} shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all`}
      >
        Sync {title}
      </button>
    </div>
  );

  return (
    <div className="p-8 space-y-12">
      <div className="border-b-4 border-black pb-6">
        <h1 className="text-6xl font-black uppercase italic tracking-tighter">Identity Hub</h1>
        <p className="text-[#FF5F5F] font-bold uppercase text-xs tracking-[0.3em] mt-2">The Face of Swaang</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <HubCard title="Main Founder" prefix="founder" color="bg-[#FFD166]" />
        <HubCard title="Co-Founder 1" prefix="coFounder1" color="bg-[#06D6A0]" />
        <HubCard title="Co-Founder 2" prefix="coFounder2" color="bg-[#FF5F5F]" />
      </div>
    </div>
  );
}
