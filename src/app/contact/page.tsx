"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // 🔥 Hits your secure server tunnel instead of Firebase client
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Transmission failed");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

    } catch (error: any) {
      console.error("Form Error:", error);
      setErrorMessage(error.message);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#FFF9F0] pt-32 pb-20 px-6 text-[#2D2D2D] flex justify-center items-center">
      <div className="max-w-2xl w-full">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-[#FFD166] border-4 border-[#2D2D2D] px-6 py-2 rounded-full mb-6 shadow-[4px_4px_0px_#2D2D2D]">
            <span className="font-black uppercase tracking-[0.2em] text-[10px]">Global Connect</span>
          </div>
          <h1 className="font-cinzel text-5xl md:text-7xl font-black uppercase tracking-tighter">
            Reach The <br/> <span className="text-[#FF5F5F] italic">Directorate</span>
          </h1>
        </motion.div>

        {status === "success" ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-4 border-[#06D6A0] rounded-3xl p-10 text-center shadow-[12px_12px_0px_#06D6A0]"
          >
            <h2 className="text-3xl font-black uppercase text-[#2D2D2D] mb-4">Message Received! 📨</h2>
            <p className="font-bold text-[#2D2D2D]/70 mb-8">
              Your transmission has been safely delivered to the Master Hub. The Swaang team will reach out shortly.
            </p>
            <Link href="/" className="inline-block bg-[#06D6A0] border-4 border-[#2D2D2D] text-[#2D2D2D] font-black uppercase px-8 py-3 rounded-full shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
              Return to Stage
            </Link>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="bg-white border-4 border-[#2D2D2D] p-8 md:p-12 rounded-[2rem] shadow-[12px_12px_0px_#2D2D2D] space-y-6"
          >
            {status === "error" && (
              <div className="bg-[#FF5F5F] border-4 border-[#2D2D2D] text-white p-4 rounded-xl text-center font-black text-sm uppercase shadow-[4px_4px_0px_#2D2D2D]">
                ⚠️ {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-4 border-[#2D2D2D] rounded-xl p-4 text-[#2D2D2D] focus:border-[#FF5F5F] focus:outline-none transition-colors font-bold" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 border-4 border-[#2D2D2D] rounded-xl p-4 text-[#2D2D2D] focus:border-[#FF5F5F] focus:outline-none transition-colors font-bold" placeholder="you@sstc.ac.in" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Subject</label>
              <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-gray-50 border-4 border-[#2D2D2D] rounded-xl p-4 text-[#2D2D2D] focus:border-[#FF5F5F] focus:outline-none transition-colors font-bold" placeholder="What is this regarding?" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Message</label>
              <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-gray-50 border-4 border-[#2D2D2D] rounded-xl p-4 text-[#2D2D2D] focus:border-[#FF5F5F] focus:outline-none transition-colors font-bold h-32 resize-none" placeholder="Type your message here..." />
            </div>

            <button 
              type="submit" 
              disabled={status === "loading"}
              className="w-full bg-[#FF5F5F] border-4 border-[#2D2D2D] text-white font-black uppercase tracking-widest p-5 rounded-xl shadow-[6px_6px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50 mt-4 flex justify-center items-center"
            >
              {status === "loading" ? <span className="animate-pulse">Transmitting...</span> : "Send Message"}
            </button>
          </motion.form>
        )}
      </div>
    </main>
  );
}
