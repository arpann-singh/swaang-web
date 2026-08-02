"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, limit, deleteDoc, doc, getDocs } from "firebase/firestore";
import { generateSwaangLetter } from "@/lib/generateLetter";
import { FileText, Search, CheckSquare, Square, Zap, History, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LetterGenerator() {
  const [team, setTeam] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
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
    designation: "President",
    isUrgent: false
  });

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("joiningYear", "desc"));
    const unsubTeam = onSnapshot(q, (snap) => setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    const hQ = query(collection(db, "letters_history"), orderBy("createdAt", "desc"), limit(10));
    const unsubHistory = onSnapshot(hQ, (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    
    return () => { unsubTeam(); unsubHistory(); };
  }, []);

  const availableYears = Array.from(new Set(team.map(t => t.year).filter(Boolean))).sort();
  const availableBranches = Array.from(new Set(team.map(t => t.branch).filter(Boolean))).sort();

  const filteredTeam = team.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchYear = selectedYear === "ALL" || s.year === selectedYear;
    const matchBranch = selectedBranch === "ALL" || s.branch === selectedBranch;
    return matchSearch && matchYear && matchBranch;
  });

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

  const selectAllFiltered = () => {
    const newStudents = filteredTeam.map(s => ({
      name: s.name, 
      roll: s.roll || "N/A", 
      branch: `${s.branch || ""} ${s.year || ""}`.trim(), 
      id: s.id 
    }));
    
    // Merge without duplicates
    const merged = [...selectedStudents];
    newStudents.forEach(ns => {
      if (!merged.find(m => m.id === ns.id)) merged.push(ns);
    });
    setSelectedStudents(merged);
  };

  const clearSelection = () => setSelectedStudents([]);

  const applyPreset = (type: string) => {
    if (type === "REHEARSAL") {
      setFormData(prev => ({
        ...prev, 
        subject: "Permission for Late Night Rehearsal", 
        description: "As we approach the critical final stages of our upcoming production, it is imperative that the cast and crew engage in intensive, uninterrupted practice. We kindly request permission to utilize the specified venue for late-night rehearsal sessions. The designated core team members listed below will be present and will adhere strictly to all campus disciplinary and security guidelines during these hours. Your approval will greatly contribute to the success of our performance.", 
        isUrgent: true
      }));
    } else if (type === "ATTENDANCE") {
      setFormData(prev => ({
        ...prev, 
        subject: "Attendance Exemption for Core Team", 
        description: "The students listed in the attached roster have been officially selected to represent Swaang: The Dramatic Society and Shri Shankaracharya Technical Campus at the upcoming cultural event. In order to ensure full participation and adequate preparation, we kindly request you to grant them an official attendance exemption for the specified dates. Their dedication to bringing laurels to our institution makes this support invaluable.", 
        isUrgent: false
      }));
    } else if (type === "BUDGET") {
      setFormData(prev => ({
        ...prev, 
        recipient: "The Director", 
        subject: "Fund Request for Annual Production", 
        description: "In preparation for our flagship annual production, we have finalized the logistical, technical, and creative requirements. We respectfully submit this formal request for the release of the approved budget to facilitate the procurement of costumes, set materials, sound/lighting equipment, and transport. We request swift processing to ensure seamless execution of the event.", 
        isUrgent: true
      }));
    } else if (type === "EQUIPMENT") {
      setFormData(prev => ({
        ...prev, 
        recipient: "The Store In-Charge", 
        subject: "Requisition of Audio & Lighting Equipment", 
        description: "To ensure the technical execution of our scheduled event, we require the temporary issuance of audio and lighting equipment from the central store. The requested inventory includes microphones, amplifiers, and extension boards. The core team members listed below will assume full responsibility for the safe handling and timely return of all items in their original condition.", 
        isUrgent: false
      }));
    } else if (type === "HALL") {
      setFormData(prev => ({
        ...prev, 
        recipient: "The Estate Officer", 
        subject: "Requisition for Auditorium / Seminar Hall", 
        description: "Swaang: The Dramatic Society is organizing an official gathering and performance for the student body. We formally request the booking of the Auditorium / Seminar Hall for the specified date and time. We assure you that the venue will be maintained properly, and all technical setups will be coordinated with the estate staff to prevent any disruption.", 
        isUrgent: false
      }));
    }
  };

  const handleCompile = async () => {
    // 1. Generate PDF
    await generateSwaangLetter({ ...formData, students: selectedStudents });
    
    // 2. Log History
    try {
      await addDoc(collection(db, "letters_history"), {
        subject: formData.subject,
        recipient: formData.recipient,
        studentCount: selectedStudents.length,
        isUrgent: formData.isUrgent,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Failed to log letter history", error);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to completely clear the letter history? This cannot be undone.")) return;
    try {
      const snapshot = await getDocs(collection(db, "letters_history"));
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, "letters_history", d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear logs", error);
    }
  };

  return (
    <div className="space-y-12 pb-40">
      
      {/* HEADER STATUS */}
      <div className="border-b-8 border-black pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black bg-[#FF5F5F] px-6 py-3 border-4 border-black inline-block shadow-[8px_8px_0px_black]">Letter Engine V2</h2>
           <br/>
           <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black bg-white inline-block px-2 py-1 mt-4 border-2 border-black ml-2 shadow-[2px_2px_0px_black]">Official SSTC Documentation</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowHistory(!showHistory)} className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-black hover:text-[#06D6A0] transition-all flex items-center justify-center gap-2">
            <History size={24} strokeWidth={3} />
          </button>
          <div className="bg-[#FFF9F0] border-4 border-black p-4 text-center shadow-[4px_4px_0px_black] min-w-[120px]">
            <p className="text-[10px] font-mono font-black uppercase">Selected</p>
            <p className="text-4xl font-black text-[#06D6A0] [text-shadow:2px_2px_0px_black]">{selectedStudents.length}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-black border-4 border-black p-6 shadow-[8px_8px_0px_#06D6A0] mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-[#06D6A0] font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock size={16} /> Recent Archives
                </h3>
                {history.length > 0 && (
                  <button onClick={handleClearLogs} className="bg-[#FF5F5F] text-black border-2 border-black px-4 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5">
                    Clear Logs
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {history.length === 0 ? (
                  <p className="text-white/50 font-mono text-xs">NO LOGS FOUND.</p>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className="bg-white p-4 border-4 border-black flex flex-col justify-between">
                      <div>
                        {log.isUrgent && <span className="bg-[#FF5F5F] text-black text-[8px] font-black uppercase px-1 py-0.5 border border-black mr-2">URGENT</span>}
                        <p className="font-black text-black uppercase text-sm line-clamp-1">{log.subject}</p>
                        <p className="text-[10px] font-mono text-gray-600 mt-1 uppercase">TO: {log.recipient}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t-2 border-black/10 flex justify-between items-center text-[10px] font-mono font-black uppercase">
                        <span className="text-[#06D6A0]">{log.studentCount} Students</span>
                        <span>{log.createdAt?.toDate ? log.createdAt.toDate().toLocaleDateString() : 'Just Now'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRESETS ROW */}
      <div className="flex flex-wrap gap-4">
        <button onClick={() => applyPreset("REHEARSAL")} className="bg-[#FFD166] border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Zap size={16} /> Rehearsal
        </button>
        <button onClick={() => applyPreset("ATTENDANCE")} className="bg-[#06D6A0] border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Zap size={16} /> Exemption
        </button>
        <button onClick={() => applyPreset("BUDGET")} className="bg-white border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Zap size={16} /> Budget
        </button>
        <button onClick={() => applyPreset("EQUIPMENT")} className="bg-[#FF5F5F] text-white border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Zap size={16} /> Equipment
        </button>
        <button onClick={() => applyPreset("HALL")} className="bg-black text-[#06D6A0] border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_#06D6A0] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <Zap size={16} /> Hall Booking
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mt-8">
        {/* LEFT: CONTENT & SIGNATORY */}
        <div className="xl:col-span-7 space-y-16">
          
          <div className="bg-[#FFF9F0] border-8 border-black p-8 shadow-[12px_12px_0px_#FFD166] space-y-6 relative mt-4">
            <div className="absolute -top-6 left-6 bg-[#FFD166] border-4 border-black px-4 py-2 font-mono font-black uppercase text-sm shadow-[4px_4px_0px_black]">
              1. Letter Details
            </div>
            
            <div className="pt-4 space-y-4">
              <input type="text" placeholder="RECIPIENT" value={formData.recipient} onChange={e => setFormData({...formData, recipient: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              <input type="text" placeholder="SUBJECT" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
                <input type="text" placeholder="VENUE" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              </div>
              
              <textarea placeholder="DESCRIPTION" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-bold h-32 resize-none shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              
              <div className="flex items-center gap-4 p-4 bg-black text-white border-4 border-black shadow-[4px_4px_0px_black] mt-4 w-fit">
                <input type="checkbox" checked={formData.isUrgent} onChange={e => setFormData({...formData, isUrgent: e.target.checked})} className="w-6 h-6 accent-[#FF5F5F] cursor-pointer" />
                <label className="text-[10px] font-mono font-black uppercase tracking-widest text-[#FF5F5F]">Flag as Urgent / High Priority</label>
              </div>
            </div>
          </div>

          <div className="bg-[#06D6A0] border-8 border-black p-8 shadow-[12px_12px_0px_black] space-y-6 relative mt-12">
             <div className="absolute -top-6 left-6 bg-black text-white border-4 border-black px-4 py-2 font-mono font-black uppercase text-sm shadow-[4px_4px_0px_black]">
              2. Authorized Signatory
            </div>
            
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" placeholder="NAME" value={formData.signatoryName} onChange={e => setFormData({...formData, signatoryName: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
              <input type="text" placeholder="DESIGNATION" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full bg-white border-4 border-black p-4 font-black uppercase text-sm shadow-[4px_4px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* RIGHT: SEARCH & MEMBER LIST */}
        <div className="xl:col-span-5 flex flex-col border-8 border-black shadow-[12px_12px_0px_black] bg-[#FFF9F0]">
          
          <div className="bg-black p-4 flex flex-col gap-4 border-b-8 border-black">
             <div className="flex items-center gap-4">
               <Search size={24} className="text-[#06D6A0]" strokeWidth={3} />
               <input 
                 type="text" 
                 placeholder="SEARCH NAME OR BRANCH..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-transparent text-white font-black uppercase text-lg placeholder:text-white/30 outline-none"
               />
             </div>

             {/* 🔥 DYNAMIC FILTERS */}
             <div className="flex gap-2">
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="flex-1 bg-white border-4 border-black font-black uppercase text-xs p-2 outline-none shadow-[2px_2px_0px_black]">
                  <option value="ALL">ALL YEARS</option>
                  {availableYears.map(y => <option key={y as string} value={y as string}>{y} YEAR</option>)}
                </select>
                <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} className="flex-1 bg-white border-4 border-black font-black uppercase text-xs p-2 outline-none shadow-[2px_2px_0px_black]">
                  <option value="ALL">ALL BRANCHES</option>
                  {availableBranches.map(b => <option key={b as string} value={b as string}>{b}</option>)}
                </select>
             </div>
             
             <div className="flex gap-2 mt-2">
               <button onClick={selectAllFiltered} className="flex-1 bg-[#06D6A0] text-black border-2 border-black py-2 font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all">
                 SELECT FILTERED
               </button>
               <button onClick={clearSelection} className="flex-1 bg-[#FF5F5F] text-white border-2 border-black py-2 font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">
                 CLEAR
               </button>
             </div>
          </div>
          
          <div className="h-[650px] overflow-y-auto custom-scrollbar p-6 space-y-4">
              {filteredTeam.map(s => {
                const isSelected = selectedStudents.some(x => x.id === s.id);
                return (
                  <button 
                    key={s.id} 
                    onClick={() => toggleStudent(s)}
                    className={`w-full flex justify-between items-center p-4 border-4 border-black transition-all ${
                      isSelected
                      ? 'bg-[#06D6A0] translate-x-1 translate-y-1 shadow-none' 
                      : 'bg-white shadow-[4px_4px_0px_black] hover:bg-gray-100 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_black]'
                    }`}
                  >
                    <div className="text-left flex-1 truncate mr-4">
                      <p className="font-black uppercase text-sm leading-none truncate text-black">{s.name}</p>
                      <p className="text-[10px] font-mono mt-2 uppercase font-black text-gray-700 truncate">{s.branch} {s.year}</p>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? <CheckSquare size={24} className="text-black" strokeWidth={3} /> : <Square size={24} className="text-black" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      <button 
        onClick={handleCompile}
        className="w-full mt-12 bg-black text-[#FF5F5F] border-8 border-black py-8 font-black uppercase tracking-[0.2em] text-xl md:text-3xl shadow-[16px_16px_0px_#FF5F5F] hover:translate-y-2 hover:translate-x-2 hover:shadow-none transition-all flex flex-wrap items-center justify-center gap-4 group"
      >
        <FileText size={40} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> COMPILE & DOWNLOAD PDF
      </button>
    </div>
  );
}