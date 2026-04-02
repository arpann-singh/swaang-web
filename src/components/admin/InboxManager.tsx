"use client";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function InboxManager({ messages }: { messages: any[] }) {
  
  const markAsRead = async (id: string) => {
    try {
      // 🔥 FIXED: Now updating the correct "messages" collection
      await updateDoc(doc(db, "messages", id), { read: true });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    if (confirm("Permanently delete this message?")) {
      try {
        // 🔥 FIXED: Now deleting from the correct "messages" collection
        await deleteDoc(doc(db, "messages", id));
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  if (!messages || messages.length === 0) {
    return <div className="p-12 text-center font-black uppercase text-gray-400 border-4 border-dashed border-gray-300 rounded-[2rem]">Inbox is Empty. 📨</div>;
  }

  return (
    <div className="space-y-8">
      <header className="border-b-8 border-black pb-6 mb-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter">Global Inbox</h1>
        <p className="text-[#FF5F5F] font-bold uppercase text-[10px] tracking-[0.4em]">Direct Transmissions</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={msg.id} 
            className={`border-4 border-black p-6 md:p-8 rounded-[2rem] transition-all ${msg.read ? 'bg-gray-50 opacity-70' : 'bg-white shadow-[8px_8px_0px_#2D2D2D]'}`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-black uppercase flex items-center gap-3">
                  {msg.name} 
                  {!msg.read && <span className="bg-[#FF5F5F] text-white text-[9px] px-2 py-1 rounded-full tracking-widest">NEW</span>}
                </h3>
                <p className="font-mono text-xs font-bold text-gray-500">{msg.email}</p>
              </div>
              <div className="flex gap-2">
                {!msg.read && (
                  <button onClick={() => markAsRead(msg.id)} className="bg-[#06D6A0] text-black border-2 border-black px-4 py-2 font-black uppercase text-[10px] rounded-xl hover:bg-[#05b586] transition-colors shadow-[2px_2px_0px_black]">
                    Mark Read
                  </button>
                )}
                <button onClick={() => deleteMessage(msg.id)} className="bg-[#FF5F5F] text-white border-2 border-black px-4 py-2 font-black uppercase text-[10px] rounded-xl hover:bg-red-600 transition-colors shadow-[2px_2px_0px_black]">
                  Delete
                </button>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl border-2 border-black/10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Subject: {msg.subject || "No Subject"}</p>
              <p className="font-bold text-sm">{msg.message}</p>
            </div>
            
            <p className="text-right text-[9px] font-black uppercase tracking-widest opacity-40 mt-4">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "Unknown Date"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
