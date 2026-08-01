"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

export default function CrewActivityFeed() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(10));
    return onSnapshot(q, (snap) => setLogs(snap.docs.map(d => d.data())));
  }, []);

  return (
    <div className="bg-white border-4 border-[var(--border-primary)] rounded-[3rem] shadow-[12px_12px_0px_var(--border-primary)] overflow-hidden">
      <div className="p-6 border-b-4 border-[var(--border-primary)] bg-gray-50 flex justify-between items-center">
        <h3 className="font-black uppercase tracking-widest text-xs italic">Live Audit Log</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase opacity-40">System Active</span>
        </div>
      </div>
      <div className="divide-y-2 divide-gray-100">
        {logs.map((log, i) => (
          <div key={i} className="p-4 hover:bg-[var(--bg-primary)] transition-colors flex justify-between items-center text-left">
            <div>
              <span className="font-black text-[#FF5F5F] uppercase text-[10px] mr-2">{log.user}</span>
              <span className="font-bold text-xs uppercase tracking-tight text-[var(--text-primary)]">{log.action}</span>
            </div>
            <span className="text-[9px] font-black opacity-30">{new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}