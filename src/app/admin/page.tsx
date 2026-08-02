"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { useRouter } from "next/navigation";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err) {
      setError("ERROR: INVALID CREDENTIALS. ACCESS DENIED.");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#2D2D2D] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] flex items-center justify-center p-6 text-black">
        <div className="max-w-md w-full bg-white border-8 border-black shadow-[16px_16px_0px_black] overflow-hidden">
          
          <div className="bg-[#FFD166] border-b-8 border-black p-4 flex items-center justify-between">
            <h1 className="font-mono font-black text-xl uppercase tracking-widest">Sys.Auth</h1>
            <span className="bg-black text-[#FFD166] text-[10px] font-black uppercase px-2 py-1">Restricted Area</span>
          </div>

          <div className="p-8">
            <h2 className="font-cinzel text-3xl font-black uppercase tracking-tighter mb-6 leading-none">Security<br/>Clearance</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-mono font-black uppercase tracking-widest mb-2">Email Identity</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-4 border-black p-4 font-mono font-black outline-none focus:bg-[#06D6A0]/10 focus:border-black transition-colors shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1"
                  placeholder="admin@swaang.club"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-black uppercase tracking-widest mb-2">Access Code (Password)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-4 border-black p-4 font-mono font-black outline-none focus:bg-[#06D6A0]/10 focus:border-black transition-colors shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <div className="bg-[#FF5F5F] border-4 border-black p-3 animate-pulse">
                   <p className="text-white text-[10px] font-mono font-black uppercase text-center">{error}</p>
                </div>
              )}
              
              <button type="submit" className="w-full py-4 bg-black text-[#06D6A0] font-black uppercase tracking-widest text-xs border-4 border-black hover:bg-[#06D6A0] hover:text-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[6px_6px_0px_#06D6A0] transition-all mt-4">
                Initialize Session
              </button>
            </form>

          </div>
          
          <div className="border-t-8 border-black p-4 bg-gray-100 flex justify-center">
            <Link href="/" className="font-mono font-black text-[10px] uppercase tracking-widest text-black hover:text-[#FF5F5F] underline decoration-2 underline-offset-4">
              &lt; Abort / Return to Public Site
            </Link>
          </div>
          
        </div>
      </div>
    </PageTransition>
  );
}
