"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import SectionHeader from "@/components/SectionHeader";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await addDoc(collection(db, "messages"), { ...form, timestamp: serverTimestamp() });
    setStatus("SENT");
  };

  return (
    <main className="bg-[#FFF9F0] pt-40 pb-20 min-h-screen">
      <SectionHeader title="Contact Us" subtitle="Get in Touch" emoji="✉️" color="#FFD166" />
      <div className="container mx-auto px-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white border-4 border-[#2D2D2D] p-10 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D] space-y-6">
          <input type="text" placeholder="Your Name" required className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] transition-colors" onChange={e => setForm({...form, name: e.target.value})} />
          <input type="email" placeholder="Your Email" required className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl outline-none focus:bg-[#FFF9F0] transition-colors" onChange={e => setForm({...form, email: e.target.value})} />
          <textarea placeholder="How can we help?" required className="w-full border-2 border-[#2D2D2D] p-4 rounded-2xl h-40 outline-none focus:bg-[#FFF9F0] transition-colors" onChange={e => setForm({...form, message: e.target.value})} />
          <button className="w-full bg-[#FF5F5F] text-white border-4 border-[#2D2D2D] py-5 rounded-2xl font-black uppercase text-sm shadow-[6px_6px_0px_#2D2D2D] active:translate-y-1 active:shadow-none transition-all">
            {status === "SENT" ? "Message Received! ✨" : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
