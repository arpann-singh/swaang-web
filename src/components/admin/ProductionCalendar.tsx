"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Calendar as CalIcon, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const TRACKS = [
  { id: "cast", label: "Cast Rehearsal", dot: "bg-adm-danger", badge: "adm-badge-danger" },
  { id: "prop", label: "Prop Making", dot: "bg-adm-success", badge: "adm-badge-success" },
  { id: "tech", label: "Technical Run", dot: "bg-adm-accent", badge: "adm-badge-accent" },
];

export default function ProductionCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const q = query(collection(db, "production_schedule"));
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
      date: newDateStr,
    });

    await addDoc(collection(db, "callboard"), {
      title: "📅 Schedule Update",
      message: `A production block has been rescheduled to ${new Date(
        newDateStr
      ).toLocaleDateString()}. Please check the Hub.`,
      priority: "normal",
      author: "System Bot",
      createdAt: Date.now(),
    });
  };

  const addBlock = async (dateStr: string) => {
    const title = window.prompt("Enter Rehearsal/Task Title:");
    if (!title) return;
    const track = window.prompt("Enter Track (cast, prop, tech):") || "cast";

    await addDoc(collection(db, "production_schedule"), {
      title,
      date: dateStr,
      track: TRACKS.some((t) => t.id === track) ? track : "cast",
      createdAt: serverTimestamp(),
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6 text-left w-full">
      {/* 🗓️ HEADER */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalIcon size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">Drag & Drop Multi-Track Scheduling</span>
          </div>
          <h2 className="adm-title">Production Calendar</h2>
          <p className="adm-muted mt-1">
            Schedule daily rehearsal blocks and drag tasks across days to automatically notify the Crew Callboard.
          </p>
        </div>

        <div className="adm-panel p-1.5 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
            }
            className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold text-sm text-adm-fg min-w-[140px] text-center">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
            }
            className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 🏁 TRACK LEGEND */}
      <div className="flex flex-wrap gap-2.5">
        {TRACKS.map((t) => (
          <div key={t.id} className="adm-card px-3.5 py-2 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
            <span className="text-xs font-semibold text-adm-fg">{t.label}</span>
          </div>
        ))}
      </div>

      {/* 🧱 CALENDAR GRID */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {days.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const dayEvents = events.filter((e) => e.date === dateStr);

            return (
              <Droppable droppableId={dateStr} key={dateStr}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[175px] p-3.5 adm-card transition-all ${
                      snapshot.isDraggingOver ? "border-adm-accent bg-adm-accent/10" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="font-display font-bold text-lg text-adm-fg">
                          {day.getDate()}
                        </span>
                        <span className="text-[11px] text-adm-fg-3 ml-1.5">
                          {day.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addBlock(dateStr)}
                        className="adm-btn adm-btn-secondary adm-btn-icon adm-btn-sm"
                        title="Add Rehearsal Block"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {dayEvents.map((ev, index) => {
                        const trackObj = TRACKS.find((t) => t.id === ev.track) || TRACKS[0];
                        return (
                          <Draggable key={ev.id} draggableId={ev.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="adm-panel p-2.5 flex items-start justify-between gap-2 group"
                              >
                                <div className="min-w-0">
                                  <span className={`inline-block w-2 h-2 rounded-full ${trackObj.dot} mr-1.5`} />
                                  <span className="text-xs font-medium text-adm-fg break-words">
                                    {ev.title}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => deleteDoc(doc(db, "production_schedule", ev.id))}
                                  className="text-adm-fg-3 hover:text-adm-danger shrink-0 p-0.5"
                                  title="Delete block"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
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