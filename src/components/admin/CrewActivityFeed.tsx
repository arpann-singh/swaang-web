"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Activity } from "lucide-react";

export default function CrewActivityFeed() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(10));
    return onSnapshot(
      q,
      (snap) => setLogs(snap.docs.map((d) => d.data())),
      (err) => console.warn("Audit log warning:", err)
    );
  }, []);

  return (
    <div className="adm-card overflow-hidden">
      <div className="px-5 py-4 border-b border-adm-line bg-adm-surface-2 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2.5">
          <Activity size={16} className="text-adm-accent-text shrink-0" />
          <h3 className="adm-h3">Live Audit Stream</h3>
        </div>
        <span className="adm-badge adm-badge-success">
          <span className="w-1.5 h-1.5 bg-adm-success rounded-full animate-pulse" />
          <span>Telemetry Active</span>
        </span>
      </div>

      <div className="divide-y divide-adm-line">
        {logs.length === 0 ? (
          <div className="p-8 text-center adm-muted">
            No audit events logged in this session yet.
          </div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="px-5 py-3.5 hover:bg-adm-surface-2 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-left"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs font-semibold uppercase text-adm-accent-text mr-2.5">
                  {log.user || "ADMIN"}
                </span>
                <span className="text-sm text-adm-fg-2 break-words">
                  {log.action}
                </span>
              </div>
              <span className="font-mono text-xs text-adm-fg-3 shrink-0">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Recent"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}