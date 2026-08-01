"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Star, CheckCircle, XCircle, UserCheck } from "lucide-react";

export default function AuditionEvaluator() {
  const [auditions, setAuditions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Matrix Scores
  const [scores, setScores] = useState({ voice: 5, acting: 5, confidence: 5, improv: 5 });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "auditions"), (snap) => {
      setAuditions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const selectedAudition = auditions.find(a => a.id === selectedId);

  const saveEvaluation = async (status: string) => {
    if (!selectedId) return;
    const totalScore = scores.voice + scores.acting + scores.confidence + scores.improv;
    await updateDoc(doc(db, "auditions", selectedId), {
      status: status, // "Round 1 Cleared", "Shortlisted", "Rejected"
      evaluation: {
        ...scores,
        totalScore,
        evaluatedAt: new Date().toISOString()
      }
    });
    setSelectedId(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* List */}
      <div className="xl:col-span-1 bg-white border-4 border-[var(--border-primary)] rounded-[2rem] p-6 shadow-[8px_8px_0px_var(--border-primary)] h-[80vh] overflow-y-auto no-scrollbar">
        <h2 className="text-2xl font-black uppercase tracking-tighter text-[var(--text-primary)] mb-6 flex items-center gap-2">
          <UserCheck className="text-[#06D6A0]" /> Evaluator
        </h2>
        <div className="flex flex-col gap-3">
          {auditions.map(a => (
            <button 
              key={a.id} 
              onClick={() => setSelectedId(a.id)}
              className={`text-left p-4 border-4 border-[var(--border-primary)] rounded-xl transition-all ${selectedId === a.id ? 'bg-[#2D2D2D] text-white translate-x-2' : 'bg-gray-50 hover:bg-[#FFD166]'}`}
            >
              <h3 className="font-black uppercase text-sm">{a.name}</h3>
              <p className={`text-[10px] font-bold uppercase mt-1 ${selectedId === a.id ? 'text-gray-300' : 'text-[#FF5F5F]'}`}>
                {a.status || 'Pending Review'}
              </p>
              {a.evaluation && (
                <p className="text-xs font-black mt-2">Score: {a.evaluation.totalScore}/40</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix */}
      <div className="xl:col-span-2 bg-white border-4 border-[var(--border-primary)] rounded-[2rem] p-8 shadow-[8px_8px_0px_var(--border-primary)]">
        {!selectedAudition ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <Star className="w-20 h-20 mb-4" />
            <h2 className="text-2xl font-black uppercase tracking-widest">Select Candidate</h2>
          </div>
        ) : (
          <div>
            <div className="border-b-4 border-[var(--border-primary)] pb-6 mb-6">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-primary)]">{selectedAudition.name}</h2>
              <p className="font-bold uppercase text-xs tracking-widest text-[#FF5F5F] mt-1">{selectedAudition.phone} • {selectedAudition.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              {Object.keys(scores).map((metric) => (
                <div key={metric} className="bg-gray-50 p-4 border-4 border-[var(--border-primary)] rounded-2xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black uppercase text-sm tracking-widest">{metric}</span>
                    <span className="font-black text-2xl text-[#06D6A0]">{(scores as any)[metric]}</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    value={(scores as any)[metric]} 
                    onChange={(e) => setScores({...scores, [metric]: parseInt(e.target.value)})}
                    className="w-full accent-[#2D2D2D]" 
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => saveEvaluation("Shortlisted")} className="flex-1 bg-[#06D6A0] text-[var(--text-primary)] py-4 border-4 border-[var(--border-primary)] rounded-xl font-black uppercase flex justify-center items-center gap-2 shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                <CheckCircle /> Shortlist Candidate
              </button>
              <button onClick={() => saveEvaluation("Rejected")} className="bg-[#FF5F5F] text-[var(--text-primary)] py-4 px-6 border-4 border-[var(--border-primary)] rounded-xl font-black uppercase flex justify-center items-center gap-2 shadow-[4px_4px_0px_var(--border-primary)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                <XCircle /> Pass
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
