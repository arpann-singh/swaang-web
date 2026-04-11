"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, onSnapshot, query, addDoc, doc, updateDoc, deleteDoc, serverTimestamp 
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const TRACKS = [
  { id: "cast", label: "Cast Rehearsal", color: "bg-[#FF5F5F]" },
  { id: "prop", label: "Prop Making", color: "bg-[#06D6A0]" },
  { id: "tech", label: "Technical Run", color: "bg-[#FFD166]" }
];

export default function ProductionCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, "production_schedule"));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newDateStr = destination.droppableId;

    await updateDoc(doc(db, "production_schedule", draggableId), {
      date: newDateStr
    });

    // 🔥 AUTO-CALLBOARD SYNC: Alerts the Crew Hub automatically
    await addDoc(collection(db, "callboard"), {
      title: "📅 Schedule Update",
      message: `A production block has been rescheduled to ${new Date(newDateStr).toLocaleDateString()}. Please check the Hub.`,
      priority: "normal",
      author: "System Bot",
      createdAt: Date.now()
    });
  };

  const addBlock = async (dateStr: string) => {
    const title = window.prompt("Enter Rehearsal/Task Title:");
    if (!title) return;
    const track = window.prompt("Enter Track (cast, prop, tech):") || "cast";
    
    await addDoc(collection(db, "production_schedule"), {
      title,
      date: dateStr,
      track: TRACKS.some(t => t.id === track) ? track : "cast",
      createdAt: serverTimestamp()
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-8 pb-20 text-left">
      {/* 🗓️ NEUBRUTALIST HEADER */}
      <div className="bg-[#2D2D2D] p-8 rounded-[2.5rem] shadow-[10px_10px_0px_#FF5F5F] text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
            <CalIcon size={40} className="text-[#FFD166]" /> Production Calendar
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#06D6A0] mt-1">Drag & Drop Multi-Track Scheduling</p>
        </div>
        <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl border-2 border-white/20">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white/20 rounded-lg"><ChevronLeft /></button>
          <span className="font-black uppercase text-sm tracking-widest min-w-[150px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white/20 rounded-lg"><ChevronRight /></button>
        </div>
      </div>

      {/* 🏁 TRACK LEGEND */}
      <div className="flex flex-wrap gap-4">
        {TRACKS.map(t => (
          <div key={t.id} className="flex items-center gap-2 bg-white border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_black]">
            <div className={`w-3 h-3 rounded-full ${t.color}`} />
            <span className="font-black uppercase text-[10px]">{t.label}</span>
          </div>
        ))}
      </div>

      {/* 🧱 CALENDAR GRID */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {days.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <Droppable droppableId={dateStr} key={dateStr}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] p-4 rounded-[2rem] border-4 border-black transition-all ${
                      snapshot.isDraggingOver ? 'bg-[#FFD166]/20' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-black text-2xl opacity-20">{day.getDate()}</span>
                      <button 
                        onClick={() => addBlock(dateStr)} 
                        className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {dayEvents.map((ev, index) => (
                        <Draggable key={ev.id} draggableId={ev.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${
                                TRACKS.find(t => t.id === ev.track)?.color
                              } border-2 border-black p-2 rounded-xl shadow-[3px_3px_0px_black] group relative`}
                            >
                              <p className="font-black uppercase text-[9px] leading-tight pr-4">{ev.title}</p>
                              <button 
                                onClick={() => deleteDoc(doc(db, "production_schedule", ev.id))}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}