"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function AuditionPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", role: "", reason: "", portfolio: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // 🧠 State for the Master Toggle
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // 📡 Real-time listener for the Admin Toggle
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "site_config"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().auditionsOpen !== undefined) {
        setIsFormOpen(docSnap.data().auditionsOpen);
      }
      setIsConfigLoaded(true);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/audition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Submission failed");

      setStatus("success");
      setFormData({ name: "", email: "", phone: "", role: "", reason: "", portfolio: "" }); 
    } catch (error: any) {
      console.error("Form Error:", error);
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  // ⏳ Show nothing until we know the Admin's setting
  if (!isConfigLoaded) {
    return <main className="min-h-screen bg-[#1A1A1A] flex justify-center items-center font-black uppercase text-[#06D6A0] animate-pulse">Prepping the Stage...</main>;
  }

  return (
    <main className="min-h-screen bg-[#1A1A1A] pt-32 pb-20 px-6 text-[#FFF9F0] flex justify-center items-center">
      <div className="max-w-2xl w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Step Into <br/> <span className="text-[#FF5F5F]">The Light</span>
          </h1>
          <p className="mt-4 font-bold uppercase tracking-[0.3em] text-[#FFF9F0]/60 text-xs md:text-sm">
            Official Swaang Audition Form
          </p>
        </motion.div>

        {/* 🛑 IF ADMIN HAS PAUSED AUDITIONS */}
        {!isFormOpen ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 border-2 border-white/10 rounded-[2rem] p-10 text-center backdrop-blur-sm"
          >
            <h2 className="text-3xl font-black uppercase text-[#FF5F5F] mb-4">The Curtain is Drawn</h2>
            <p className="font-bold text-[#FFF9F0]/80 mb-8 leading-relaxed">
              We are not accepting new auditions at this exact moment. The casting team is currently reviewing submissions. 
              <br/><br/>
              Keep an eye on the stage notices for our next opening!
            </p>
            <Link href="/" className="inline-block bg-[#FFF9F0] text-[#1A1A1A] font-black uppercase px-8 py-3 rounded-full hover:scale-105 transition-transform tracking-widest text-[10px]">
              Return to Homepage
            </Link>
          </motion.div>
        ) : 

        /* ✅ IF AUDITIONS ARE OPEN */
        status === "success" ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/5 border border-[#06D6A0] rounded-3xl p-10 text-center backdrop-blur-sm"
          >
            <h2 className="text-3xl font-black uppercase text-[#06D6A0] mb-4">Break a Leg! 🎭</h2>
            <p className="font-bold text-[#FFF9F0]/80 mb-8">
              Your audition profile has been securely sent to the Director's desk. We will contact you shortly with your time slot.
            </p>
            <Link href="/" className="inline-block bg-[#06D6A0] text-[#1A1A1A] font-black uppercase px-8 py-3 rounded-full hover:scale-105 transition-transform tracking-widest text-[10px]">
              Return to Stage
            </Link>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-sm space-y-6"
          >
            {status === "error" && (
              <div className="bg-[#FF5F5F]/20 border border-[#FF5F5F] text-[#FF5F5F] p-4 rounded-xl text-center font-bold text-sm">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold" placeholder="Actor Name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold" placeholder="actor@sstc.ac.in" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Phone</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold" placeholder="+91" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Primary Interest</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold appearance-none">
                  <option value="" disabled>Select your role...</option>
                  <option value="Acting">Acting / Performance</option>
                  <option value="Writing">Script Writing</option>
                  <option value="Directing">Directing</option>
                  <option value="Technical">Stage / Tech Crew</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Portfolio / Work (Optional)</label>
                <input type="url" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold" placeholder="Link (Instagram, Drive, etc.)" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Why do you want to join Swaang?</label>
              <textarea required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-[#FFF9F0] focus:border-[#06D6A0] focus:outline-none transition-colors font-bold h-24 resize-none" placeholder="Tell us what drives you..." />
            </div>

            <button type="submit" disabled={status === "loading"} className="w-full bg-[#FF5F5F] text-white font-black uppercase tracking-widest p-5 rounded-xl hover:bg-[#ff4444] active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex justify-center items-center">
              {status === "loading" ? <span className="animate-pulse">Transmitting...</span> : "Submit Audition"}
            </button>
          </motion.form>
        )}
      </div>
    </main>
  );
}
