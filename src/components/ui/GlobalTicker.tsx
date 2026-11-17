"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Radio } from "lucide-react";

export default function GlobalTicker() {
  const [notices, setNotices] = useState<any[]>([]);
  const [broadcast, setBroadcast] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Listen for emergency broadcast
    const unsubBroadcast = onSnapshot(
      doc(db, "settings", "broadcast"),
      (d) => {
        if (d.exists() && d.data()?.enabled && d.data()?.message) {
          setBroadcast(d.data());
        } else {
          setBroadcast(null);
        }
      },
      (err) => console.warn("Broadcast listener warning:", err)
    );

    // 2. Listen for active public notices
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const unsubNotices = onSnapshot(
      q,
      (s) => setNotices(s.docs.map(d => d.data()).filter((n: any) => n.isActive)),
      (err) => console.warn("GlobalTicker notices listener warning:", err)
    );

    return () => {
      unsubBroadcast();
      unsubNotices();
    };
  }, []);

  const hasContent = (broadcast && broadcast.enabled) || notices.length > 0;

  useEffect(() => {
    if (hasContent) {
      document.body.style.setProperty('--ticker-height', '48px');
    } else {
      document.body.style.setProperty('--ticker-height', '0px');
    }
  }, [hasContent]);

  if (!hasContent) return null;

  // 🚨 PRIORITY 1: Emergency Broadcast Active
  if (broadcast && broadcast.enabled && broadcast.message) {
    const bannerBg =
      broadcast.type === "alert"
        ? "bg-[#FF5F5F] text-white"
        : broadcast.type === "success"
        ? "bg-[#06D6A0] text-black"
        : "bg-[#FFD166] text-black";

    return (
      <div className={`fixed top-0 left-0 w-full ${bannerBg} border-b-8 border-black z-[5000] h-12 flex items-center justify-between px-4 sm:px-8 font-mono overflow-hidden`}>
        <div className="flex items-center gap-3 truncate">
          <span className="flex items-center gap-1.5 bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 border border-black shrink-0">
            <Radio size={12} className="animate-pulse text-[#FF5F5F]" />
            BROADCAST
          </span>
          <span className="font-black text-xs uppercase tracking-wide truncate">
            {broadcast.message}
          </span>
        </div>

        {broadcast.linkUrl && (
          <Link
            href={broadcast.linkUrl}
            className="shrink-0 bg-black text-white hover:bg-white hover:text-black border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-wider ml-4 transition-colors shadow-[2px_2px_0px_black]"
          >
            {broadcast.linkText || "LEARN MORE ➔"}
          </Link>
        )}
      </div>
    );
  }

  // 📢 PRIORITY 2: Regular Notices Marquee
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
