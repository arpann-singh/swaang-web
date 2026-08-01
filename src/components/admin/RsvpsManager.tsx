"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";

const RsvpsManager = () => {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "rsvps"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRsvps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleCheckIn = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "rsvps", id), { isCheckedIn: !currentStatus });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredRsvps = rsvps.filter(r => 
    r.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 font-black opacity-20 uppercase">Loading Guest List...</div>;

  return (
    <div className="space-y-12 bg-[var(--bg-primary)] p-4 md:p-8 min-h-screen">
      <div className="border-b-8 border-[var(--border-primary)] pb-6 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl font-black uppercase text-[var(--text-primary)]">Guest List (RSVPs)</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF5F5F] mt-2 text-left">Manage Event Ticketing</p>
        </div>

        <div className="w-full md:w-80 relative">
          <input 
            type="text" 
            placeholder="Search Name or Event..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-4 border-[var(--border-primary)] p-3 rounded-xl font-black uppercase text-[10px] shadow-[4px_4px_0px_var(--border-primary)] outline-none focus:translate-y-1 focus:shadow-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRsvps.map((rsvp) => (
          <div key={rsvp.id} className="bg-white border-4 border-[var(--border-primary)] p-6 rounded-[2rem] shadow-[8px_8px_0px_var(--border-primary)] flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-[#FFD166] border-2 border-[var(--border-primary)] px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {rsvp.eventName}
              </span>
              <button 
                onClick={() => { if(confirm('Remove this RSVP?')) deleteDoc(doc(db, "rsvps", rsvp.id)) }} 
                className="text-[#FF5F5F] font-black uppercase hover:scale-110 transition-transform"
                title="Delete RSVP"
              >
                ✕
              </button>
            </div>
            <h3 className="font-black text-xl uppercase mb-1">{rsvp.userName}</h3>
            <p className="text-xs font-bold text-gray-500 mb-4">{rsvp.userEmail} | {rsvp.userPhone}</p>
            <div className="mt-auto pt-4 border-t-2 border-[var(--border-primary)]/10 flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {rsvp.userBranch}
              </p>
              <button 
                onClick={() => toggleCheckIn(rsvp.id, rsvp.isCheckedIn)}
                className={`px-3 py-1.5 border-2 border-[var(--border-primary)] rounded-xl text-[9px] font-black uppercase shadow-[2px_2px_0px_var(--border-primary)] active:translate-y-0.5 active:shadow-none transition-all ${rsvp.isCheckedIn ? 'bg-[#06D6A0] text-[var(--text-primary)]' : 'bg-white text-[var(--text-primary)] hover:bg-gray-50'}`}
              >
                {rsvp.isCheckedIn ? '✓ IN' : 'Admit'}
              </button>
            </div>
          </div>
        ))}
        {filteredRsvps.length === 0 && (
          <div className="col-span-full p-20 border-4 border-dashed border-[var(--border-primary)]/20 rounded-[3rem] text-center opacity-40 font-black uppercase italic tracking-widest">
            No RSVPs Found
          </div>
        )}
      </div>
    </div>
  );
};

export default RsvpsManager;
