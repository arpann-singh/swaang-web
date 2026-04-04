"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function InboxManager({ messages: initialMessages }: { messages?: any[] }) {
  // 🧠 State to hold the live messages
  const [messages, setMessages] = useState<any[]>(initialMessages || []);

  useEffect(() => {
    // 🔌 LIVE WIRE: Watch the messages collection in real-time
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      // Fallback in case the Firebase index hasn't been built yet
      console.warn("Falling back to JS sorting", error);
      const fallbackUnsub = onSnapshot(collection(db, "messages"), (fallbackSnap) => {
        let fetched = fallbackSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setMessages(fetched);
      });
    });

    return () => unsub();
  }, []);

  const markAsRead = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'unread' ? 'read' : 'unread';
      await updateDoc(doc(db, "messages", id), { status: newStatus });
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 border-b-8 border-[#2D2D2D] pb-4">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Communications</h2>
        <p className="font-black uppercase tracking-[0.3em] text-[#06D6A0] text-[10px] mt-1">Direct Messages</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {messages.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-[#2D2D2D]/20 rounded-[2rem]">
            <p className="font-black uppercase text-gray-400 text-xl">The inbox is empty.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`bg-white border-4 border-[#2D2D2D] rounded-[2rem] p-6 sm:p-8 flex flex-col transition-all duration-300 ${msg.status === 'unread' ? 'shadow-[8px_8px_0px_#FF5F5F]' : 'shadow-[8px_8px_0px_#2D2D2D] opacity-80'}`}>
              
              {/* Header: Name, Date, Status */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-4 border-[#2D2D2D]/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter leading-none">{msg.name}</h3>
                    {msg.status === 'unread' && <span className="w-3 h-3 bg-[#FF5F5F] rounded-full animate-pulse"></span>}
                  </div>
                  <p className="font-bold text-[10px] uppercase tracking-widest text-gray-400 mt-2">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Unknown Date'}
                  </p>
                </div>
                
                <button 
                  onClick={() => markAsRead(msg.id, msg.status)}
                  className={`px-4 py-2 border-2 border-[#2D2D2D] rounded-lg font-black text-[9px] uppercase tracking-widest hover:-translate-y-0.5 transition-all ${msg.status === 'unread' ? 'bg-[#FF5F5F] text-white shadow-[2px_2px_0px_#2D2D2D]' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {msg.status === 'unread' ? 'Mark as Read' : 'Mark Unread'}
                </button>
              </div>

              {/* Subject */}
              <h4 className="font-black text-lg text-[#06D6A0] uppercase mb-4 tracking-tight border-l-4 border-[#06D6A0] pl-3">
                {msg.subject}
              </h4>

              {/* 📞 CONTACT BUTTONS (Neo-Brutalist Action Blocks) */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Email is always required by the form */}
                <a href={`mailto:${msg.email}`} className="flex-1 flex items-center justify-between bg-blue-100 border-2 border-[#2D2D2D] py-2.5 px-4 rounded-xl hover:bg-blue-200 transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none group overflow-hidden">
                  <span className="font-black text-[10px] uppercase flex items-center gap-2 shrink-0">✉️ Email</span>
                  <span className="font-bold text-[11px] lowercase truncate ml-2">{msg.email}</span>
                </a>
                
                {/* Phone is optional, only shows if they provided it */}
                {msg.phone && (
                  <a href={`tel:${msg.phone}`} className="flex-1 flex items-center justify-between bg-[#FFD166] border-2 border-[#2D2D2D] py-2.5 px-4 rounded-xl hover:bg-yellow-400 transition-colors shadow-[2px_2px_0px_#2D2D2D] hover:translate-y-0.5 hover:shadow-none group">
                    <span className="font-black text-[10px] uppercase flex items-center gap-2">📞 Call</span>
                    <span className="font-bold text-[12px] tracking-widest">{msg.phone}</span>
                  </a>
                )}
              </div>

              {/* The Message Body */}
              <div className="bg-gray-50 p-6 rounded-2xl border-2 border-[#2D2D2D]/10 mb-6 flex-1 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                {msg.message}
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex justify-end">
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="bg-white text-red-500 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-colors"
                >
                  Delete Permanently
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
