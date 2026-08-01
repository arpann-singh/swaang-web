"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Users, Lightbulb, Download } from "lucide-react";

export default function AuditionResources() {
  const [data, setData] = useState<any>({ monologues: [], breakdowns: [], tips: [] });
  const [loading, setLoading] = useState(true);
  const [inputKey, setInputKey] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const docSnap = await getDoc(doc(db, "settings", "audition_resources"));
      if (docSnap.exists()) {
        const d = docSnap.data();
        setData(d);
        if (!d.passkey || d.passkey.trim() === "") {
          setIsUnlocked(true);
        } else if (sessionStorage.getItem("swaang_resource_key") === d.passkey) {
          setIsUnlocked(true);
        }
      } else {
        setIsUnlocked(true);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const { monologues = [], breakdowns = [], tips = [] } = data;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.toLowerCase() === data.passkey?.toLowerCase()) {
      setIsUnlocked(true);
      sessionStorage.setItem("swaang_resource_key", data.passkey);
    } else {
      alert("Incorrect Access Passkey. Please check your audition instructions.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-black uppercase tracking-widest text-[var(--text-primary)]">Loading Resources...</div>;

  if (!isUnlocked) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-[var(--bg-primary)] py-40 px-6 flex items-center justify-center">
          <div className="bg-white border-4 border-[var(--border-primary)] p-10 md:p-14 rounded-[3rem] shadow-[20px_20px_0px_var(--border-primary)] max-w-md w-full text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h1 className="font-cinzel text-3xl font-black uppercase text-[var(--text-primary)] mb-2 tracking-tighter">Secured Portal</h1>
            <p className="font-bold text-[var(--text-primary)]/60 text-sm mb-8">
              This area is restricted to enrolled candidates. Enter your access passkey.
            </p>
            <form onSubmit={handleUnlock} className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter Passkey" 
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                className="w-full border-4 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] text-[var(--text-primary)] font-black uppercase text-center text-xl tracking-widest"
              />
              <button type="submit" className="w-full bg-[#06D6A0] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-4 rounded-2xl font-black uppercase text-xs shadow-[5px_5px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">
                Unlock Resources
              </button>
            </form>
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-[var(--bg-primary)] py-40 px-6 text-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-16 text-center">
            <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter">
              Resource <span className="text-transparent" style={{ WebkitTextStroke: '2px #2D2D2D' }}>Portal</span>
            </h1>
            <p className="text-[#FF5F5F] font-black uppercase tracking-[0.4em] text-xs mt-4">Prepare for the Mainstage</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📜 MONOLOGUES */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border-4 border-[var(--border-primary)] p-8 md:p-10 rounded-[3rem] shadow-[15px_15px_0px_#FFD166]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#FFD166] rounded-2xl border-2 border-[var(--border-primary)]">
                    <FileText size={28} className="text-[var(--text-primary)]" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Sample Monologues</h2>
                </div>
                
                <div className="space-y-6">
                  {monologues.map((mono: any, idx: number) => (
                    <div key={idx} className="border-2 border-[var(--border-primary)]/20 p-6 rounded-3xl hover:border-[var(--border-primary)] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold uppercase">{mono.title}</h3>
                        <div className="flex items-center gap-2">
                          {mono.pdfUrl && (
                            <a href={mono.pdfUrl} target="_blank" rel="noreferrer" className="bg-[#06D6A0] text-[var(--text-primary)] p-1.5 rounded-lg border-2 border-[var(--border-primary)] hover:scale-105 transition-transform" title="Download PDF">
                              <Download size={16} />
                            </a>
                          )}
                          {mono.genre && <span className="bg-[#2D2D2D] text-white px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest">{mono.genre}</span>}
                        </div>
                      </div>
                      {mono.text && <p className="text-[var(--text-primary)]/80 italic leading-relaxed">"{mono.text}"</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 👥 CHARACTER BREAKDOWNS */}
              <div className="bg-white border-4 border-[var(--border-primary)] p-8 md:p-10 rounded-[3rem] shadow-[15px_15px_0px_#06D6A0]">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#06D6A0] rounded-2xl border-2 border-[var(--border-primary)]">
                    <Users size={28} className="text-[var(--text-primary)]" />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Character Breakdowns</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {breakdowns.map((role: any, idx: number) => (
                    <div key={idx} className="bg-[var(--bg-primary)] border-2 border-[var(--border-primary)] p-5 rounded-2xl shadow-[4px_4px_0px_var(--border-primary)]">
                      <h3 className="font-black uppercase text-lg mb-2">{role.role}</h3>
                      <p className="text-sm text-[var(--text-primary)]/70 font-medium">{role.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 💡 SIDEBAR: TIPS & ACTIONS */}
            <div className="space-y-8">
              
              <div className="bg-[#2D2D2D] text-[#FFF9F0] border-4 border-[var(--border-primary)] p-8 rounded-[3rem] shadow-[15px_15px_0px_#FF5F5F]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#FF5F5F] rounded-2xl border-2 border-[#FFF9F0]">
                    <Lightbulb size={24} className="text-[#FFF9F0]" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Director's Tips</h2>
                </div>
                <ul className="space-y-4">
                  {tips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm font-medium">
                      <span className="text-[#FF5F5F] font-black">{'->'}</span>
                      <span className="opacity-90">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FFD166] border-4 border-[var(--border-primary)] p-8 rounded-[3rem] shadow-[10px_10px_0px_var(--border-primary)] flex flex-col items-center text-center">
                <h3 className="font-black uppercase text-xl mb-2">Ready to Audition?</h3>
                <p className="text-xs font-bold opacity-70 mb-6">Applications are currently open for our upcoming production.</p>
                <Link href="/auditions" className="w-full bg-[#06D6A0] text-[var(--text-primary)] border-4 border-[var(--border-primary)] py-4 rounded-2xl font-black uppercase text-xs shadow-[5px_5px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                  Apply Now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}
