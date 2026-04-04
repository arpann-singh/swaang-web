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
    return <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-[#2D2D2D]">Loading Stage Door...</div>;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-white border-4 border-[#2D2D2D] p-12 rounded-[3rem] shadow-[20px_20px_0px_#2D2D2D] max-w-lg"
        >
          <h1 className="font-cinzel text-4xl font-black text-[#2D2D2D] mb-4">BREAK A LEG! 🎭</h1>
          <p className="font-bold text-[#FF5F5F] uppercase tracking-widest text-sm mb-8">Your application has been staged.</p>
          <button onClick={() => window.location.href = "/"} className="bg-[#06D6A0] border-4 border-[#2D2D2D] px-8 py-3 rounded-full font-black uppercase text-xs shadow-[5px_5px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">Back to Mainstage</button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-[#FFF9F0] py-40 px-6">
        <div className="max-w-3xl mx-auto">
          
          {!isLive ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border-4 border-[#2D2D2D] rounded-[3rem] p-12 text-center shadow-[20px_20px_0px_#2D2D2D] mt-10"
            >
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="font-cinzel text-4xl font-black uppercase text-[#2D2D2D] mb-4 tracking-tighter">Auditions are Closed</h2>
              <p className="font-bold text-[#2D2D2D]/70 mb-8 max-w-md mx-auto">
                We are not currently accepting new cast or crew applications. Keep an eye on our social media for future casting calls!
              </p>
              <Link href="/" className="inline-block bg-[#FFD166] border-4 border-[#2D2D2D] text-[#2D2D2D] font-black uppercase px-8 py-3 rounded-xl shadow-[5px_5px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all">
                Return to Mainstage
              </Link>
            </motion.div>
          ) : (
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-12 text-center">
                <h1 className="font-cinzel text-5xl md:text-7xl font-black text-[#2D2D2D] uppercase tracking-tighter">Join the Ensemble</h1>
                <p className="text-[#FF5F5F] font-black uppercase tracking-[0.4em] text-xs mt-4">Auditions are Currently Open</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-8 md:p-12 rounded-[3rem] shadow-[20px_20px_0px_#2D2D2D] space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Branch & Year</label>
                    <div className="flex gap-2">
                      <input required type="text" placeholder="IT" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} 
                        className="w-1/2 border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                      <input required type="text" placeholder="3rd" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} 
                        className="w-1/2 border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none bg-white focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold cursor-pointer">
                      <option>Actor</option>
                      <option>Director</option>
                      <option>PR & Marketing</option>
                      <option>Stage Decor</option>
                      <option>Technical/IT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Previous Experience / Why Swaang?</label>
                  <textarea required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} 
                    className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl h-32 outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-medium resize-none" />
                </div>

                {/* 🔥 NEW: Photo and Portfolio Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Photo Link (Required)</label>
                    <input required type="url" placeholder="Drive or OneDrive link to your photo" value={formData.photoLink} onChange={e => setFormData({...formData, photoLink: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                    <p className="text-[8px] font-black uppercase text-gray-400 mt-1">*Make sure link access is set to "Anyone with link"</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Portfolio Link (Optional)</label>
                    <input type="url" placeholder="Drive or Instagram link" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} 
                      className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] text-[#2D2D2D] font-bold" />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="w-full bg-[#06D6A0] text-[#2D2D2D] border-4 border-[#2D2D2D] py-6 rounded-2xl font-black uppercase shadow-[8px_8px_0px_#2D2D2D] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50">
                  {loading ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
