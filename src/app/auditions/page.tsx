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
    return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-black">Loading Stage Door...</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background Masks */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
          <svg className="absolute top-[20%] left-[10%] w-32 h-32 -rotate-12" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
        </div>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-8 border-black p-12 shadow-[16px_16px_0px_#06D6A0] max-w-lg relative z-10"
        >
          <div className="absolute top-4 left-4 border-2 border-black px-2 py-1 bg-[#06D6A0] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_black]">
            STATUS: STAGED
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-black mb-4 mt-8 uppercase tracking-tighter leading-none" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
            BREAK A <span className="text-black" style={{ WebkitTextStroke: 'none' }}>LEG!</span>
          </h1>
          <p className="font-mono font-bold text-black bg-[#06D6A0]/20 border-4 border-[#06D6A0] p-4 uppercase tracking-widest text-sm mb-8">
            Your application ticket has been successfully stamped and filed.
          </p>
          <button onClick={() => window.location.href = "/"} className="w-full bg-black text-white border-4 border-black px-8 py-4 font-black uppercase tracking-widest hover:bg-[#FFD166] hover:text-black hover:shadow-[6px_6px_0px_black] transition-all">Back to Mainstage</button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#FFF9F0] py-32 md:py-40 px-4 md:px-8 relative overflow-hidden">
        
        {/* 🎭 SCATTERED THEATRE MASKS BACKGROUND */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
          <svg className="absolute top-[10%] left-[5%] w-24 h-24 -rotate-12" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
          <svg className="absolute top-[60%] right-[10%] w-32 h-32 rotate-12" viewBox="0 0 24 24" fill="black"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm4-7.5c-.83 0-1.5-.67-1.5-1.5S13.17 6 14 6s1.5.67 1.5 1.5S14.83 8.5 14 8.5zM10 8.5c-.83 0-1.5-.67-1.5-1.5S9.17 6 10 6s1.5.67 1.5 1.5S10.83 8.5 10 8.5z"/></svg>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          {!isLive ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border-8 border-black p-12 text-center shadow-[16px_16px_0px_#FF5F5F] mt-10 relative overflow-hidden"
            >
              {/* Caution Tape Pattern */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#FFD166,#FFD166_10px,black_10px,black_20px)]" />
              
              <div className="text-6xl mb-6 mt-4">🔒</div>
              <h2 className="text-5xl font-black uppercase text-black mb-4 tracking-tighter leading-none" style={{ WebkitTextStroke: '2px black', color: 'transparent' }}>
                AUDITIONS <span className="text-black" style={{ WebkitTextStroke: 'none' }}>CLOSED</span>
              </h2>
              <p className="font-mono font-bold text-black bg-black/5 border-4 border-black p-4 mb-8 max-w-md mx-auto uppercase tracking-widest text-sm">
                The stage door is currently chained. Keep an eye on our comms for future casting calls!
              </p>
              <Link href="/" className="inline-block bg-black text-white border-4 border-black font-black uppercase px-8 py-4 shadow-[6px_6px_0px_black] hover:bg-[#FF5F5F] transition-all tracking-widest">
                Return to Mainstage
              </Link>
            </motion.div>
          ) : (
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-12">
                <span className="bg-black text-[#FFD166] px-4 py-2 border-2 border-black font-mono font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#FF5F5F] mb-4 inline-block">
                  OFFICIAL FORM NO. 04
                </span>
                <h1 className="text-6xl md:text-8xl font-black text-black uppercase tracking-tighter leading-[0.85] mt-2">
                  CASTING <br/> <span className="text-transparent" style={{ WebkitTextStroke: '3px black' }}>CALL</span>
                </h1>
                <p className="text-black font-mono font-black uppercase tracking-[0.2em] text-sm mt-6 border-l-4 border-[#FF5F5F] pl-4">
                  The stage awaits. Submit your ticket below.
                </p>
              </div>

              <motion.form 
                onSubmit={handleSubmit} 
                className="bg-white border-8 border-black p-6 md:p-12 shadow-[16px_16px_0px_black] space-y-8 relative"
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
                {/* 🔖 Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 pointer-events-none opacity-5 text-black text-8xl font-black uppercase tracking-tighter whitespace-nowrap z-0">
                  APPLICATION TICKET
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; FULL_NAME
                    </label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20 uppercase" placeholder="JOHN DOE" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; EMAIL_ADDR
                    </label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20" placeholder="YOU@SSTC.AC.IN" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; CONTACT_NO
                    </label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20" placeholder="+91 XXXX XXXX" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; BRANCH_&_YR
                    </label>
                    <div className="flex gap-2">
                      <input required type="text" placeholder="IT" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} 
                        className="w-1/2 border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20 uppercase" />
                      <input required type="text" placeholder="3rd" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} 
                        className="w-1/2 border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20 uppercase" />
                    </div>
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; ROLE_PREF
                    </label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-black uppercase cursor-pointer transition-all appearance-none rounded-none">
                      <option>ACTOR</option>
                      <option>DIRECTOR</option>
                      <option>PR & MARKETING</option>
                      <option>STAGE DECOR</option>
                      <option>TECHNICAL / IT</option>
                    </select>
                  </motion.div>
                </div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group relative z-10">
                  <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                    &gt; WHY_SWAANG? (OR PAST EXP)
                  </label>
                  <textarea required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} 
                    className="w-full border-4 border-black bg-white p-4 h-32 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold resize-none transition-all placeholder:text-black/20 uppercase" placeholder="ENTER YOUR STORY..." />
                </motion.div>

                {/* 🔥 Photo and Portfolio Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; ID_PHOTO_LINK (REQ)
                    </label>
                    <input required type="url" placeholder="G-DRIVE LINK (ANYONE WITH LINK)" value={formData.photoLink} onChange={e => setFormData({...formData, photoLink: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20 uppercase" />
                  </motion.div>
                  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="space-y-2 group">
                    <label className="text-xs font-mono font-black uppercase tracking-widest text-black/60 transition-colors group-focus-within:text-[#FF5F5F]">
                      &gt; PORTFOLIO_LINK (OPT)
                    </label>
                    <input type="url" placeholder="INSTAGRAM / DRIVE" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} 
                      className="w-full border-4 border-black bg-white p-4 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] focus:-translate-y-1 focus:-translate-x-1 text-black font-bold transition-all placeholder:text-black/20 uppercase" />
                  </motion.div>
                </div>

                <div className="pt-6 relative z-10">
                  <motion.button variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} disabled={loading} type="submit" 
                    className="w-full bg-black text-white border-4 border-black py-6 font-black uppercase tracking-[0.3em] text-lg hover:bg-[#06D6A0] hover:text-black hover:shadow-[12px_12px_0px_black] hover:-translate-y-2 hover:-translate-x-2 transition-all disabled:opacity-50 flex items-center justify-center gap-4">
                    {loading ? (
                      <span className="animate-pulse">[ TRANSMITTING_DATA ]</span>
                    ) : (
                      <>
                        <span>[ STAMP_APPLICATION ]</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
