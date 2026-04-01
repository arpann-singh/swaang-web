"use client";
import { db } from "@/lib/firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";

const AuditionsManager = ({ auditions }: { auditions: any[] }) => {
  const deleteApp = async (id: string) => {
    if (confirm("Reject and delete this application?")) await deleteDoc(doc(db, "audition_submissions", id));
  };

  const toggleShortlist = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "audition_submissions", id), {
        shortlisted: !currentStatus
      });
    } catch (error) {
      console.error("Error updating shortlist:", error);
    }
  };

  if (auditions.length === 0) {
    return (
      <div className="bg-white border-4 border-dashed border-[#2D2D2D] p-20 rounded-[3rem] text-center">
        <p className="font-black uppercase tracking-widest text-gray-400">No applications received yet. 🎭</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {auditions.map(app => (
        <div 
          key={app.id} 
          className={`bg-white border-4 border-[#2D2D2D] p-10 rounded-[3rem] shadow-[12px_12px_0px_#2D2D2D] grid grid-cols-1 md:grid-cols-3 gap-8 transition-all ${app.shortlisted ? "border-[#FFD166] ring-4 ring-[#FFD166]/20" : ""}`}
        >
          <div className="space-y-4 relative">
            {app.shortlisted && (
              <div className="absolute -top-6 -left-6 bg-[#FFD166] border-2 border-[#2D2D2D] px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-[2px_2px_0px_#2D2D2D] animate-bounce">
                Shortlisted ⭐
              </div>
            )}
            <h3 className="text-2xl font-black uppercase tracking-tighter text-[#2D2D2D]">{app.name || "Anonymous Artist"}</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-[#FFD166] border-2 border-[#2D2D2D] px-4 py-1 rounded-full text-[10px] font-black uppercase">{app.role || "Performer"}</span>
              <span className="bg-[#06D6A0]/20 border-2 border-[#2D2D2D] px-4 py-1 rounded-full text-[10px] font-black uppercase">{app.branch}</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year {app.year} • {app.phone}</p>
          </div>
          
          <div className="border-x-2 border-[#2D2D2D]/10 px-8 flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Experience & Portfolio</p>
            <p className="text-sm font-medium italic text-[#2D2D2D] line-clamp-4">
              "{app.experience || "No experience details provided."}"
            </p>
            {app.portfolio && (
              <a href={app.portfolio} target="_blank" className="text-[#FF5F5F] font-black text-[10px] uppercase underline mt-3">View Portfolio ↗</a>
            )}
          </div>

          <div className="flex flex-col gap-3 justify-center">
            {/* NEW SHORTLIST BUTTON */}
            <button 
              onClick={() => toggleShortlist(app.id, app.shortlisted)}
              className={`border-2 border-[#2D2D2D] py-3 rounded-xl text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:shadow-none transition-all ${app.shortlisted ? "bg-[#FFD166] text-[#2D2D2D]" : "bg-white text-[#2D2D2D] hover:bg-gray-50"}`}
            >
              {app.shortlisted ? "Remove from Shortlist" : "Shortlist Candidate"}
            </button>

            <a href={`mailto:${app.email}`} className="bg-[#06D6A0] text-[#2D2D2D] border-2 border-[#2D2D2D] py-3 rounded-xl text-center text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:shadow-none transition-all">
              Contact Artist
            </a>
            
            <button onClick={() => deleteApp(app.id)} className="text-[#FF5F5F] font-black text-[9px] uppercase underline hover:text-red-700 transition-colors mt-2">
              Archive Application
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditionsManager;
