"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Team from "@/components/Team";
import Header from "@/components/Header";
import Footer from "@/components/ui/Footer";
import FacultyHero from "@/components/team/FacultyHero"; // 🔥 New Import

export default function TeamPage() {
  const [facultyData, setFacultyData] = useState<any>(null);

  useEffect(() => {
    // 🔥 Fetching from settings/faculty
    const unsub = onSnapshot(doc(db, "settings", "faculty"), (d) => {
      if (d.exists()) setFacultyData(d.data());
    });
    return () => unsub();
  }, []);

  return (
    <main className="bg-[#FFF9F0] min-h-screen">
      <Header />
      
      {/* 🔥 NEW: Dynamic Faculty Hero at the top */}
      <div className="pt-32 md:pt-40">
        <FacultyHero data={facultyData} />
      </div>

      <div className="pt-10">
        <Team />
      </div>
    </main>
  );
}