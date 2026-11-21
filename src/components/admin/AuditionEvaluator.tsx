"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Star, CheckCircle, XCircle, UserCheck } from "lucide-react";

export default function AuditionEvaluator() {
  const [auditions, setAuditions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [scores, setScores] = useState({ voice: 5, acting: 5, confidence: 5, improv: 5 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "auditions"), (snap) => {
      setAuditions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const selectedAudition = auditions.find((a) => a.id === selectedId);

  const saveEvaluation = async (status: string) => {
    if (!selectedId) return;
    const totalScore = scores.voice + scores.acting + scores.confidence + scores.improv;
    await updateDoc(doc(db, "auditions", selectedId), {
      status,
      evaluation: {
        ...scores,
        totalScore,
        evaluatedAt: new Date().toISOString(),
      },
    });
    setSelectedId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">
      <div className="xl:col-span-1 adm-card p-5 max-h-[80vh] overflow-y-auto">
        <h2 className="adm-h2 mb-4 flex items-center gap-2">
          <UserCheck size={18} className="text-adm-accent-text" />
          <span>Evaluator</span>
        </h2>
        <div className="flex flex-col gap-2">
          {auditions.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelectedId(a.id)}
              className={`text-left p-3.5 rounded-xl border transition-all ${
                selectedId === a.id
                  ? "bg-adm-accent/15 border-adm-accent/45 text-adm-fg"
                  : "bg-adm-surface-2 border-adm-line text-adm-fg-2 hover:text-adm-fg"
              }`}
            >
              <h3 className="font-semibold text-sm text-adm-fg">{a.name}</h3>
              <p className="text-xs text-adm-fg-3 mt-0.5">{a.status || "Pending Review"}</p>
              {a.evaluation && (
                <p className="text-xs font-mono font-bold text-adm-accent-text mt-1.5">
                  Score: {a.evaluation.totalScore}/40
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="xl:col-span-2 adm-card p-6">
        {selectedAudition ? (
          <div className="space-y-6">
            <div>
              <h3 className="adm-title text-2xl">{selectedAudition.name}</h3>
              <p className="adm-muted">Role: {selectedAudition.role || "General"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(scores).map((key) => (
                <div key={key} className="adm-panel p-4">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase text-adm-fg">{key}</span>
                    <span className="adm-badge adm-badge-accent font-mono">
                      {scores[key as keyof typeof scores]}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={scores[key as keyof typeof scores]}
                    onChange={(e) =>
                      setScores({ ...scores, [key]: parseInt(e.target.value) })
                    }
                    className="adm-range"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => saveEvaluation("Round 1 Cleared")}
                className="adm-btn adm-btn-success"
              >
                <CheckCircle size={15} />
                <span>Pass Round 1</span>
              </button>
              <button
                type="button"
                onClick={() => saveEvaluation("Shortlisted")}
                className="adm-btn adm-btn-primary"
              >
                <Star size={15} />
                <span>Shortlist</span>
              </button>
              <button
                type="button"
                onClick={() => saveEvaluation("Rejected")}
                className="adm-btn adm-btn-danger"
              >
                <XCircle size={15} />
                <span>Reject</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center adm-muted">
            Select an applicant from the queue to begin evaluation.
          </div>
        )}
      </div>
    </div>
  );
}
