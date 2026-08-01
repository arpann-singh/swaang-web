"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Auditions() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    role: "Actor",
    experience: "",
    portfolio: "",
    photoLink: "" // 🔥 NEW: Added photo link to the form state!
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isLive, setIsLive] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "auditions"), (docSnap) => {
      if (docSnap.exists()) {
        setIsLive(docSnap.data().isLive || false);
      } else {
        setIsLive(false); 
      }
      setLoadingInitial(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "auditions"), {
        ...formData,
        motivation: formData.experience, 
        status: "pending",               
        submittedAt: Date.now(),
        timestamp: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Something went wrong. Please check your connection!");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitial) {
    return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center font-black uppercase tracking-widest text-[var(--text-primary)]">Loading Stage Door...</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-4 border-[var(--border-primary)] p-12 rounded-[3rem] shadow-[20px_20px_0px_var(--border-primary)] max-w-lg"
        >
          <h1 className="font-cinzel text-4xl font-black text-[var(--text-primary)] mb-4">BREAK A LEG! 🎭</h1>
          <p className="font-bold text-[#FF5F5F] uppercase tracking-widest text-sm mb-8">Your application has been staged.</p>
          <button onClick={() => window.location.href = "/"} className="bg-[#06D6A0] border-4 border-[var(--border-primary)] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[5px_5px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">Back to Mainstage</button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-[var(--bg-primary)] py-40 px-6">
        <div className="max-w-3xl mx-auto">
          
          {!isLive ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border-4 border-[var(--border-primary)] rounded-[3rem] p-12 text-center shadow-[20px_20px_0px_var(--border-primary)] mt-10"
            >
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="font-cinzel text-4xl font-black uppercase text-[var(--text-primary)] mb-4 tracking-tighter">Auditions are Closed</h2>
              <p className="font-bold text-[var(--text-primary)]/70 mb-8 max-w-md mx-auto">
                We are not currently accepting new cast or crew applications. Keep an eye on our social media for future casting calls!
              </p>
              <Link href="/" className="inline-block bg-[#FFD166] border-4 border-[var(--border-primary)] text-[var(--text-primary)] font-black uppercase px-8 py-3 rounded-xl shadow-[5px_5px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all">
                Return to Mainstage
              </Link>
            </motion.div>
          ) : (
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-12 text-center">
                <h1 className="font-cinzel text-5xl md:text-7xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Join the Ensemble</h1>
                <p className="text-[#FF5F5F] font-black uppercase tracking-[0.4em] text-xs mt-4">Auditions are Currently Open</p>
              </div>

              <motion.form 
                onSubmit={handleSubmit} 
                className="bg-[var(--card-primary)] border-4 border-[var(--border-primary)] p-8 md:p-12 rounded-[3rem] shadow-[20px_20px_0px_var(--border-primary)] space-y-8"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                initial="hidden"
                animate="show"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Branch & Year</label>
                    <div className="flex gap-2">
                      <input required type="text" placeholder="IT" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} 
                        className="w-1/2 border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                      <input required type="text" placeholder="3rd" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} 
                        className="w-1/2 border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                    </div>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none bg-[var(--card-primary)] focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold cursor-pointer transition-all">
                      <option>Actor</option>
                      <option>Director</option>
                      <option>PR & Marketing</option>
                      <option>Stage Decor</option>
                      <option>Technical/IT</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Previous Experience / Why Swaang?</label>
                  <textarea required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} 
                    className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl h-32 outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-medium resize-none transition-all" />
                </motion.div>

                {/* 🔥 Photo and Portfolio Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Photo Link (Required)</label>
                    <input required type="url" placeholder="Drive or OneDrive link to your photo" value={formData.photoLink} onChange={e => setFormData({...formData, photoLink: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                    <p className="text-[8px] font-black uppercase text-gray-400 mt-1">*Make sure link access is set to "Anyone with link"</p>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-[#FF5F5F]">Portfolio Link (Optional)</label>
                    <input type="url" placeholder="Drive or Instagram link" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} 
                      className="w-full border-2 border-[var(--border-primary)] p-4 rounded-2xl outline-none focus:bg-[var(--bg-primary)] focus:border-[#FF5F5F] text-[var(--text-primary)] font-bold transition-all" />
                  </motion.div>
                </div>

                <motion.button variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} disabled={loading} type="submit" className="w-full bg-[#06D6A0] text-[var(--border-primary)] border-4 border-[var(--border-primary)] py-6 rounded-2xl font-black uppercase shadow-[8px_8px_0px_var(--border-primary)] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Application"}
                </motion.button>
              </motion.form>
            </motion.div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
