"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarX, Users, X } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8);

export default function ConflictMapper() {
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [activeDetail, setActiveDetail] = useState<{
    day: string;
    hour: number;
    busyNames: string[];
  } | null>(null);

  useEffect(() => {
    return onSnapshot(collection(db, "availability"), (s) => {
      setAllSchedules(s.docs.map((d) => d.data()));
    });
  }, []);

  const getSlotData = (day: string, hour: number) => {
    const id = `${day}-${hour}`;
    const targetSchedules =
      selectedCrew.length > 0
        ? allSchedules.filter((s) => selectedCrew.includes(s.userId))
        : allSchedules;

    const busyPeople = targetSchedules.filter((s) => s.slots?.includes(id));
    const busyNames = busyPeople.map((p) => p.userName);
    const ratio = targetSchedules.length > 0 ? busyPeople.length / targetSchedules.length : 0;

    return { ratio, busyNames, totalChecked: targetSchedules.length };
  };

  const getHeatColor = (ratio: number) => {
    if (ratio === 0)
      return "bg-adm-success/20 border-adm-success/40 text-adm-success hover:bg-adm-success/30";
    if (ratio < 0.3)
      return "bg-adm-success/10 border-adm-success/25 text-adm-fg-2 hover:bg-adm-success/20";
    if (ratio < 0.6)
      return "bg-adm-accent/20 border-adm-accent/40 text-adm-accent-text hover:bg-adm-accent/30";
    return "bg-adm-danger/20 border-adm-danger/40 text-adm-danger hover:bg-adm-danger/30";
  };

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Cast Availability Audit</p>
          <h2 className="adm-title mt-1">Conflict Mapper</h2>
          <p className="adm-muted mt-1">
            Click any day/hour slot on the heatmap to see which ensemble members are busy or free for rehearsal.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="adm-badge adm-badge-success">0% Busy (Free)</span>
          <span className="adm-badge adm-badge-accent">&lt;60% Busy</span>
          <span className="adm-badge adm-badge-danger">High Conflict</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* 👥 CREW SELECTOR */}
        <div className="xl:col-span-3 adm-card p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-adm-line">
            <h3 className="adm-h3 flex items-center gap-2">
              <Users size={16} className="text-adm-accent-text" />
              <span>Filter by Cast</span>
            </h3>
            {selectedCrew.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCrew([])}
                className="adm-link text-xs"
              >
                Clear ({selectedCrew.length})
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {allSchedules.length === 0 ? (
              <p className="adm-muted py-6 text-center">No crew availability schedules submitted yet.</p>
            ) : (
              allSchedules.map((s) => {
                const isSelected = selectedCrew.includes(s.userId);
                return (
                  <button
                    key={s.userId}
                    type="button"
                    onClick={() =>
                      setSelectedCrew((prev) =>
                        prev.includes(s.userId)
                          ? prev.filter((id) => id !== s.userId)
                          : [...prev, s.userId]
                      )
                    }
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-adm-accent/15 text-adm-fg border-adm-accent/45 font-semibold"
                        : "bg-adm-surface-2 text-adm-fg-2 border-adm-line hover:text-adm-fg"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isSelected ? "bg-adm-accent" : "bg-adm-fg-3"
                      }`}
                    />
                    <span className="text-xs truncate">{s.userName}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 🗺️ MASTER HEATMAP */}
        <div className="xl:col-span-9 adm-card p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1.5 min-w-[460px]">
              <thead>
                <tr>
                  <th className="p-2 w-16 text-right text-xs font-semibold text-adm-fg-3">Hour</th>
                  {DAYS.map((d) => (
                    <th
                      key={d}
                      className="p-2 text-center font-mono text-xs font-bold uppercase text-adm-fg"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((h) => (
                  <tr key={h}>
                    <td className="p-2 font-mono text-xs text-adm-fg-3 text-right whitespace-nowrap">
                      {h}:00
                    </td>
                    {DAYS.map((d) => {
                      const { ratio, busyNames } = getSlotData(d, h);
                      return (
                        <td key={d} className="p-0">
                          <button
                            type="button"
                            onClick={() => setActiveDetail({ day: d, hour: h, busyNames })}
                            className={`w-full h-10 rounded-lg border transition-all flex items-center justify-center relative ${getHeatColor(
                              ratio
                            )}`}
                          >
                            {busyNames.length > 0 && (
                              <span className="text-[11px] font-mono font-bold">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetail(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 12 }}
              className="adm-card p-6 sm:p-8 relative z-10 w-full max-w-md space-y-5"
              style={{ boxShadow: "var(--adm-shadow-lg)" }}
            >
              <div className="flex items-start justify-between border-b border-adm-line pb-4">
                <div>
                  <p className="adm-eyebrow">Conflict Breakdown</p>
                  <h4 className="font-display text-2xl font-bold text-adm-fg mt-0.5">
                    {activeDetail.day} @ {activeDetail.hour}:00
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetail(null)}
                  className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-adm-fg-2">
                  Students Busy ({activeDetail.busyNames.length}):
                </p>
                {activeDetail.busyNames.length === 0 ? (
                  <div className="p-6 rounded-xl bg-adm-success/12 border border-adm-success/30 text-adm-success font-semibold text-center text-sm">
                    🌟 All Clear! Everyone is available to rehearse.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1">
                    {activeDetail.busyNames.map((name, i) => (
                      <div key={i} className="adm-panel p-3 text-sm font-medium text-adm-fg">
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveDetail(null)}
                className="adm-btn adm-btn-primary w-full"
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