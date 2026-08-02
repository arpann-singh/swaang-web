"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function GlobalTicker() {
  const [notices, setNotices] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setNotices(s.docs.map(d => d.data()).filter((n: any) => n.isActive)));
  }, []);

  useEffect(() => {
    if (notices.length > 0) {
      document.body.style.setProperty('--ticker-height', '48px');
    } else {
      document.body.style.setProperty('--ticker-height', '0px');
    }
  }, [notices]);

  if (notices.length === 0) return null;

  return (
    <div 
      onClick={() => router.push('/#call-board')}
      className="fixed top-0 left-0 w-full bg-[#FF5F5F] border-b-8 border-black z-[5000] h-12 flex items-center overflow-hidden cursor-pointer active:bg-black group transition-colors duration-300"
    >
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { display: flex; width: max-content; animation: marquee 120s linear infinite; white-space: nowrap; }
        .ticker-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="ticker-track group-active:text-[#FF5F5F]">
        {[...notices, ...notices, ...notices].map((n, i) => (
          <div key={i} className="flex items-center px-10">
            <span className="bg-white text-black border-4 border-black shadow-[4px_4px_0px_black] px-3 py-1 font-mono font-black text-[10px] uppercase mr-6 group-active:bg-[#06D6A0]">
              LATEST
            </span>
            <span className="text-black font-mono font-black uppercase text-sm tracking-widest group-active:text-white transition-colors">{n.title}: {n.content}</span>
            <span className="text-black ml-10 font-black tracking-[0.3em] group-active:text-[#06D6A0] transition-colors">//</span>
          </div>
        ))}
      </div>
    </div>
  );
}
