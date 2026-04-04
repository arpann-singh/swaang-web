"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";

export default function AuditionsManager({ auditions }: { auditions: any[] }) {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "auditions"), (docSnap) => {
      if (docSnap.exists()) {
        setIsLive(docSnap.data().isLive || false);
      }
    });
    return () => unsub();
  }, []);

  const toggleFormLive = async () => {
    const targetState = !isLive;
    setIsLive(targetState); 
    try {
      await setDoc(doc(db, "settings", "auditions"), { isLive: targetState }, { merge: true });
    } catch (err: any) {
      setIsLive(!targetState);
      console.error("Firebase Toggle Error:", err);
      alert("Failed to change status: " + err.message);
    }
  };
  
  const exportToCSV = () => {
    if (!auditions || auditions.length === 0) {
      alert("No auditions to export yet!");
      return;
    }

    // 🔥 NEW: Added "Photo Link" to CSV Headers
    const headers = ["Name", "Email", "Phone", "Role", "Photo Link", "Experience/Portfolio", "Motivation", "Status", "Date Submitted"];

    const rows = auditions.map(a => {
      const date = a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "Unknown";
      return [
        `"${(a.name || "").replace(/"/g, '""')}"`,
        `"${(a.email || "").replace(/"/g, '""')}"`,
        `"${(a.phone || "").replace(/"/g, '""')}"`,
        `"${(a.role || "").replace(/"/g, '""')}"`,
        `"${(a.photoLink || "None").replace(/"/g, '""')}"`, // 🔥 NEW: Adding photo data to CSV
        `"${(a.portfolio || a.experience || "None").replace(/"/g, '""')}"`,
        `"${(a.motivation || a.message || "").replace(/"/g, '""')}"`,
        `"${(a.status || "pending").replace(/"/g, '""')}"`,
        `"${date}"`
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Swaang_Auditions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "auditions", id), { status: newStatus });
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const deleteAudition = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this audition?")) return;
    try {
      await deleteDoc(doc(db, "auditions", id));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 border-b-8 border-[#2D2D2D] pb-4 gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Cast Desk</h2>
          <p className="font-black uppercase tracking-[0.3em] text-[#FFD166] text-[10px] mt-1">Audition Processing</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={toggleFormLive}
            className={`flex items-center gap-3 border-4 border-[#2D2D2D] px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all ${isLive ? 'bg-[#06D6A0] text-[#2D2D2D]' : 'bg-gray-200 text-gray-400'}`}
          >
            <div className={`w-3 h-3 rounded-full border-2 border-[#2D2D2D] ${isLive ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            {isLive ? 'Form is LIVE' : 'Form CLOSED'}
          </button>

          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-[#FFD166] text-[#2D2D2D] border-4 border-[#2D2D2D] px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#2D2D2D] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export to CSV
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auditions.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-[#2D2D2D]/20 rounded-[2rem]">
            <p className="font-black uppercase text-gray-400 text-xl">The waiting room is empty.</p>
          </div>
        ) : (
          auditions.map((a) => (
            <div key={a.id} className="bg-white border-4 border-[#2D2D2D] rounded-[2rem] p-6 shadow-[8px_8px_0px_#2D2D2D] flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-xl uppercase leading-tight">{a.name}</h3>
                  <span className="inline-block bg-[#2D2D2D] text-white px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full mt-2">
                    {a.role || "General"}
                  </span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border-2 border-[#2D2D2D] ${
                  a.status === 'accepted' ? 'bg-[#06D6A0]' : 
                  a.status === 'rejected' ? 'bg-[#FF5F5F] text-white' : 
                  'bg-[#FFD166]'
                }`}>
                  {a.status || 'Pending'}
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {a.phone && (
                  <a href={`tel:${a.phone}`} className="flex items-center justify-between w-full bg-[#FFD166] border-2 border-[#2D2D2D] py-2 px-3 rounded-lg hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none group">
                    <span className="font-black text-[10px] uppercase flex items-center gap-2">📞 Call</span>
                    <span className="font-bold text-[11px] tracking-widest">{a.phone}</span>
                  </a>
                )}
                
                {a.email && (
                  <a href={`mailto:${a.email}`} className="flex items-center justify-between w-full bg-blue-100 border-2 border-[#2D2D2D] py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none group overflow-hidden">
                    <span className="font-black text-[10px] uppercase flex items-center gap-2 shrink-0">✉️ Email</span>
                    <span className="font-bold text-[10px] lowercase truncate ml-2">{a.email}</span>
                  </a>
                )}

                {/* 🔥 NEW: The Photo Link Button */}
                {a.photoLink && (
                  <a href={a.photoLink} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full bg-pink-100 border-2 border-[#2D2D2D] py-2 px-3 rounded-lg hover:bg-pink-200 transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none group">
                    <span className="font-black text-[10px] uppercase flex items-center gap-2 text-[#2D2D2D]">📸 Photo</span>
                    <span className="font-bold text-[9px] text-[#FF5F5F] uppercase tracking-widest">Open Link ⤾</span>
                  </a>
                )}

                {(a.portfolio || a.experience) && (
                  <a href={a.portfolio || a.experience} target="_blank" rel="noreferrer" className="flex items-center justify-between w-full bg-[#2D2D2D] text-white border-2 border-[#2D2D2D] py-2 px-3 rounded-lg hover:bg-black transition-colors shadow-[2px_2px_0px_#FF5F5F] hover:translate-y-0.5 hover:shadow-none group">
                    <span className="font-black text-[10px] uppercase flex items-center gap-2">🔗 Portfolio</span>
                    <span className="font-bold text-[9px] text-[#FF5F5F] uppercase tracking-widest">Open Link ⤾</span>
                  </a>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border-2 border-[#2D2D2D]/10 mb-6 flex-1 overflow-y-auto max-h-32 text-sm font-medium italic opacity-80">
                "{a.motivation || a.message || "No motivation provided."}"
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                <button 
                  onClick={() => updateStatus(a.id, 'accepted')}
                  className="bg-[#06D6A0] border-2 border-[#2D2D2D] py-2 rounded-lg font-black text-[10px] uppercase hover:bg-green-400 transition-colors"
                >
                  Accept
                </button>
                <button 
                  onClick={() => updateStatus(a.id, 'rejected')}
                  className="bg-gray-200 border-2 border-[#2D2D2D] py-2 rounded-lg font-black text-[10px] uppercase hover:bg-[#FF5F5F] hover:text-white transition-colors"
                >
                  Reject
                </button>
                <button 
                  onClick={() => deleteAudition(a.id)}
                  className="col-span-2 bg-red-50 text-red-500 border-2 border-[#2D2D2D] py-2 rounded-lg font-black text-[10px] uppercase mt-2 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Delete Record
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
