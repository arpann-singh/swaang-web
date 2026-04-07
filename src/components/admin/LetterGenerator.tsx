"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { generateSwaangLetter } from "@/lib/generateLetter";

export default function LetterGenerator() {
  const [team, setTeam] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    recipient: "The Dean Academics",
    subject: "Permission for Theatre Rehearsal",
    eventName: "Annual Production 2026",
    date: "", 
    time: "4:00 PM onwards",
    venue: "Main Auditorium / OAT",
    description: "The team is preparing for upcoming competitions.",
    signatoryName: "Arpan Singh",
    designation: "President"
  });

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("joiningYear", "desc"));
    return onSnapshot(q, (snap) => setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, []);

  const filteredTeam = team.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStudent = (s: any) => {
    if (selectedStudents.find(curr => curr.id === s.id)) {
      setSelectedStudents(selectedStudents.filter(curr => curr.id !== s.id));
    } else {
      setSelectedStudents([...selectedStudents, { 
        name: s.name, 
        roll: s.roll || "N/A", 
        branch: `${s.branch || ""} ${s.year || ""}`.trim(), 
        id: s.id 
      }]);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* HEADER STATUS */}
      <div className="bg-[#2D2D2D] p-8 rounded-[2.5rem] text-white shadow-[10px_10px_0px_#FF5F5F] flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Letter Engine v2</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06D6A0]">Official SSTC Documentation</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black opacity-40 uppercase">Student Count</p>
          <p className="text-3xl font-black text-[#FFD166]">{selectedStudents.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT: CONTENT & SIGNATORY */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border-4 border-black p-8 rounded-[2.5rem] shadow-[8px_8px_0px_black] space-y-4">
            <h3 className="font-black uppercase text-xs text-[#FF5F5F] mb-2 tracking-widest">1. Letter Details</h3>
            <input type="text" placeholder="Recipient" value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            <input type="text" placeholder="Subject" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border-2 border-black p-4 rounded-xl font-bold" />
              <input type="text" placeholder="Venue" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="border-2 border-black p-4 rounded-xl font-bold" />
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-medium h-24" />
          </div>

          <div className="bg-[#FFD166] border-4 border-black p-8 rounded-[2.5rem] shadow-[8px_8px_0px_black] space-y-4">
            <h3 className="font-black uppercase text-xs text-black mb-2 tracking-widest">2. Authorized Signatory</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={formData.signatoryName} onChange={e => setFormData({...formData, signatoryName: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-white" />
              <input type="text" placeholder="Designation" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-white" />
            </div>
          </div>
        </div>

        {/* RIGHT: SEARCH & MEMBER LIST */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="bg-[#2D2D2D] p-6 rounded-t-[2.5rem] border-x-4 border-t-4 border-black">
             <input 
               type="text" 
               placeholder="Search Name or Branch..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white/10 border-2 border-white/20 p-4 rounded-xl text-white font-bold placeholder:text-white/20 outline-none focus:border-[#06D6A0]"
             />
          </div>
          <div className="bg-white border-4 border-black p-4 h-[555px] overflow-y-auto custom-scrollbar rounded-b-[2.5rem] shadow-[8px_8px_0px_black]">
            <div className="space-y-2">
              {filteredTeam.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => toggleStudent(s)}
                  className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all ${
                    selectedStudents.find(x => x.id === s.id) 
                    ? 'bg-[#06D6A0] border-black shadow-[4px_4px_0px_black] -translate-y-1' 
                    : 'bg-gray-50 border-black/5 hover:border-black/20'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-black uppercase text-[10px] leading-none">{s.name}</p>
                    <p className="text-[8px] opacity-40 mt-1 uppercase font-bold">{s.branch} {s.year}</p>
                  </div>
                  {selectedStudents.find(x => x.id === s.id) && <span className="text-sm">✅</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => generateSwaangLetter({ ...formData, students: selectedStudents })}
        disabled={selectedStudents.length === 0}
        className="w-full bg-[#FF5F5F] text-white border-4 border-black py-8 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[12px_12px_0px_black] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-30 active:scale-[0.98]"
      >
        Compile & Download PDF 📄
      </button>
    </div>
  );
}