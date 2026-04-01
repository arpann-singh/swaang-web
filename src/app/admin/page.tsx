"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("Invalid credentials. Access denied.");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-md">
          <h1 className="font-playfair text-3xl text-white mb-2 text-center">Backstage Access</h1>
          <p className="text-gray-500 text-[10px] text-center mb-8 uppercase tracking-[0.3em] font-inter">Swaang Admin Portal</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold font-inter">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 outline-none transition-all font-inter"
                placeholder="admin@swaang.club"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold font-inter">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:border-white/30 outline-none transition-all font-inter"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center font-inter">{error}</p>}
            <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs font-inter">
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
