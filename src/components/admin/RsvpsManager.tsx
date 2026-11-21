"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Search, Trash2, Check, ClipboardList, Loader2 } from "lucide-react";

const RsvpsManager = () => {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "rsvps"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRsvps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

  const filteredRsvps = rsvps.filter(
    (r) =>
      r.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="adm-card p-12 flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-adm-accent-text" />
        <span className="adm-muted">Loading Guest List...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Manage Event Ticketing</p>
          <h1 className="adm-title mt-1">Guest List (RSVPs)</h1>
          <p className="adm-muted mt-1">
            Track audience ticket reservations and perform real-time door check-in at the auditorium.
          </p>
        </div>

        <div className="w-full md:w-80 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Name or Event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="adm-input pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRsvps.map((rsvp) => (
          <div key={rsvp.id} className="adm-card p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-start gap-2 mb-3">
                <span className="adm-badge adm-badge-accent truncate">
                  {rsvp.eventName || "Show Event"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Remove this RSVP?")) deleteDoc(doc(db, "rsvps", rsvp.id));
                  }}
                  className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm shrink-0"
                  title="Delete RSVP"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <h3 className="font-display font-bold text-lg text-adm-fg">{rsvp.userName}</h3>
              <p className="text-xs text-adm-fg-3 mt-1 break-all">
                {rsvp.userEmail} {rsvp.userPhone ? `• ${rsvp.userPhone}` : ""}
              </p>
            </div>

            <div className="pt-3 border-t border-adm-line flex justify-between items-center gap-2">
              <span className="adm-badge adm-badge-neutral">
                {rsvp.userBranch || "Guest"}
              </span>
              <button
                type="button"
                onClick={() => toggleCheckIn(rsvp.id, rsvp.isCheckedIn)}
                className={`adm-btn adm-btn-sm ${
                  rsvp.isCheckedIn ? "adm-btn-success" : "adm-btn-secondary"
                }`}
              >
                {rsvp.isCheckedIn ? (
                  <>
                    <Check size={13} />
                    <span>Checked In</span>
                  </>
                ) : (
                  <span>Admit Guest</span>
                )}
              </button>
            </div>
          </div>
        ))}
        {filteredRsvps.length === 0 && (
          <div className="col-span-full py-16 adm-card p-8 text-center">
            <ClipboardList size={36} className="mx-auto text-adm-fg-3 mb-2" />
            <p className="adm-h3">No RSVPs Found</p>
            <p className="adm-muted mt-1">Audience reservations will appear here when guests RSVP to events.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RsvpsManager;
