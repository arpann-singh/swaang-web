"use client";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

const InboxManager = ({ messages }: { messages: any[] }) => {
  const deleteMsg = async (id: string) => {
    if (confirm("Permanently delete this message?")) {
      await deleteDoc(doc(db, "messages", id));
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white border-4 border-dashed border-[#2D2D2D] p-20 rounded-[3rem] text-center">
        <p className="font-black uppercase tracking-widest text-gray-400">The Inbox is empty. ✉️</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className="bg-white border-4 border-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[8px_8px_0px_#2D2D2D] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:-translate-y-1 transition-transform"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-[#FF5F5F] rounded-full border-2 border-[#2D2D2D]" />
              <h4 className="font-black text-xl text-[#2D2D2D] tracking-tighter uppercase">
                {msg.name}
              </h4>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {msg.email} • {msg.timestamp?.toDate().toLocaleString() || "Recent"}
            </p>
            <div className="bg-[#FFF9F0] border-2 border-[#2D2D2D] p-4 rounded-2xl mt-4">
              <p className="text-sm font-medium italic text-[#2D2D2D]">
                "{msg.message}"
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            {/* NEW CONTACT BUTTON */}
            <a 
              href={`mailto:${msg.email}?subject=Regarding your message to Swaang`}
              className="flex-1 bg-[#06D6A0] text-[#2D2D2D] border-2 border-[#2D2D2D] px-6 py-3 rounded-xl text-center text-[10px] font-black uppercase shadow-[4px_4px_0px_#2D2D2D] active:shadow-none transition-all"
            >
              Reply / Contact
            </a>
            
            <button 
              onClick={() => deleteMsg(msg.id)} 
              className="flex-1 bg-white text-red-500 border-2 border-red-500 px-6 py-3 rounded-xl text-[9px] font-black uppercase hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InboxManager;
