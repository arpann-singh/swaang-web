"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

export default function GlobalTicker() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setNotices(s.docs.map(d => d.data()).filter((n: any) => n.isActive)));
  }, []);

  if (notices.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-4 border-[#2D2D2D] z-[5000] h-10 flex items-center overflow-hidden">
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { display: flex; width: max-content; animation: marquee 30s linear infinite; white-space: nowrap; }
      `}</style>
      <div className="ticker-track">
        {[...notices, ...notices, ...notices].map((n, i) => (
          <div key={i} className="flex items-center px-10">
            <span className="bg-white text-[#FF5F5F] px-2 py-0.5 rounded font-black text-[10px] mr-4">LATEST</span>
            <span className="text-white font-black uppercase text-[12px]">{n.title}: {n.content}</span>
            <span className="text-white/40 ml-10 font-black">!!!!!</span>
          </div>
        ))}
      </div>
    </div>
  );
}
