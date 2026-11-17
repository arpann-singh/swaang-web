"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Activity } from "lucide-react";

export default function CrewActivityFeed() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(10));
    return onSnapshot(q, (snap) => setLogs(snap.docs.map(d => d.data())), (err) => console.warn("Audit log warning:", err));
  }, []);

  return (
    <div className="bg-[#16161A] border border-white/10 rounded-3xl shadow-lg overflow-hidden text-zinc-100">
      <div className="px-6 py-4 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          <h3 className="font-cinzel font-bold text-sm text-[#FFF9F0] tracking-wide">Live Audit Stream</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Telemetry Active</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {logs.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-zinc-500 italic">
            No audit events logged in this session yet.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="px-6 py-3.5 hover:bg-white/[0.02] transition-colors flex justify-between items-center text-left">
              <div>
                <span className="font-mono text-amber-400 text-[11px] font-bold uppercase mr-2.5">
                  {log.user || "ADMIN"}
                </span>
                <span className="font-mono text-xs text-zinc-300">
                  {log.action}
                </span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Recent"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}