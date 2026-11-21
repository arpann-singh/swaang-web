"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  limit,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { generateSwaangLetter } from "@/lib/generateLetter";
import { FileText, Search, CheckSquare, Square, Zap, History, Clock, Trash2 } from "lucide-react";
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
    isUrgent: false,
  });

  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "team"), orderBy("joiningYear", "desc"));
    const unsubTeam = onSnapshot(q, (snap) =>
      setTeam(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const hQ = query(collection(db, "letters_history"), orderBy("createdAt", "desc"), limit(10));
    const unsubHistory = onSnapshot(hQ, (snap) =>
      setHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubTeam();
      unsubHistory();
    };
  }, []);

  const availableYears = Array.from(new Set(team.map((t) => t.year).filter(Boolean))).sort();
  const availableBranches = Array.from(new Set(team.map((t) => t.branch).filter(Boolean))).sort();

  const filteredTeam = team.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.branch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchYear = selectedYear === "ALL" || s.year === selectedYear;
    const matchBranch = selectedBranch === "ALL" || s.branch === selectedBranch;
    return matchSearch && matchYear && matchBranch;
  });

  const toggleStudent = (s: any) => {
    if (selectedStudents.find((curr) => curr.id === s.id)) {
      setSelectedStudents(selectedStudents.filter((curr) => curr.id !== s.id));
    } else {
      setSelectedStudents([
        ...selectedStudents,
        {
          name: s.name,
          roll: s.roll || "N/A",
          branch: `${s.branch || ""} ${s.year || ""}`.trim(),
          id: s.id,
        },
      ]);
    }
  };

  const selectAllFiltered = () => {
    const newStudents = filteredTeam.map((s) => ({
      name: s.name,
      roll: s.roll || "N/A",
      branch: `${s.branch || ""} ${s.year || ""}`.trim(),
      id: s.id,
    }));

    const merged = [...selectedStudents];
    newStudents.forEach((ns) => {
      if (!merged.find((m) => m.id === ns.id)) merged.push(ns);
    });
    setSelectedStudents(merged);
  };

  const clearSelection = () => setSelectedStudents([]);

  const applyPreset = (type: string) => {
    if (type === "REHEARSAL") {
      setFormData((prev) => ({
        ...prev,
        subject: "Permission for Late Night Rehearsal",
        description:
          "As we approach the critical final stages of our upcoming production, it is imperative that the cast and crew engage in intensive, uninterrupted practice. We kindly request permission to utilize the specified venue for late-night rehearsal sessions. The designated core team members listed below will be present and will adhere strictly to all campus disciplinary and security guidelines during these hours. Your approval will greatly contribute to the success of our performance.",
        isUrgent: true,
      }));
    } else if (type === "ATTENDANCE") {
      setFormData((prev) => ({
        ...prev,
        subject: "Attendance Exemption for Core Team",
        description:
          "The students listed in the attached roster have been officially selected to represent Swaang: The Dramatic Society and Shri Shankaracharya Technical Campus at the upcoming cultural event. In order to ensure full participation and adequate preparation, we kindly request you to grant them an official attendance exemption for the specified dates. Their dedication to bringing laurels to our institution makes this support invaluable.",
        isUrgent: false,
      }));
    } else if (type === "BUDGET") {
      setFormData((prev) => ({
        ...prev,
        recipient: "The Director",
        subject: "Fund Request for Annual Production",
        description:
          "In preparation for our flagship annual production, we have finalized the logistical, technical, and creative requirements. We respectfully submit this formal request for the release of the approved budget to facilitate the procurement of costumes, set materials, sound/lighting equipment, and transport. We request swift processing to ensure seamless execution of the event.",
        isUrgent: true,
      }));
    } else if (type === "EQUIPMENT") {
      setFormData((prev) => ({
        ...prev,
        recipient: "The Store In-Charge",
        subject: "Requisition of Audio & Lighting Equipment",
        description:
          "To ensure the technical execution of our scheduled event, we require the temporary issuance of audio and lighting equipment from the central store. The requested inventory includes microphones, amplifiers, and extension boards. The core team members listed below will assume full responsibility for the safe handling and timely return of all items in their original condition.",
        isUrgent: false,
      }));
    } else if (type === "HALL") {
      setFormData((prev) => ({
        ...prev,
        recipient: "The Estate Officer",
        subject: "Requisition for Auditorium / Seminar Hall",
        description:
          "Swaang: The Dramatic Society is organizing an official gathering and performance for the student body. We formally request the booking of the Auditorium / Seminar Hall for the specified date and time. We assure you that the venue will be maintained properly, and all technical setups will be coordinated with the estate staff to prevent any disruption.",
        isUrgent: false,
      }));
    }
  };

  const handleCompile = async () => {
    await generateSwaangLetter({ ...formData, students: selectedStudents });

    try {
      await addDoc(collection(db, "letters_history"), {
        subject: formData.subject,
        recipient: formData.recipient,
        studentCount: selectedStudents.length,
        isUrgent: formData.isUrgent,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to log letter history", error);
    }
  };

  const handleClearLogs = async () => {
    if (
      !window.confirm(
        "Are you sure you want to completely clear the letter history? This cannot be undone."
      )
    )
      return;
    try {
      const snapshot = await getDocs(collection(db, "letters_history"));
      const deletePromises = snapshot.docs.map((d) =>
        deleteDoc(doc(db, "letters_history", d.id))
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Failed to clear logs", error);
    }
  };

  return (
    <div className="space-y-6 text-left w-full">
      {/* HEADER STATUS */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Official SSTC Documentation</p>
          <h2 className="adm-title mt-1">Official Letterhead Engine</h2>
          <p className="adm-muted mt-1">
            Generate official permission letters, attendance exemptions, and requisitions with attached student rosters.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="adm-btn adm-btn-secondary"
          >
            <History size={16} />
            <span>{showHistory ? "Hide History" : "History"}</span>
          </button>
          <div className="adm-panel px-4 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-adm-fg-3">
              Selected
            </p>
            <p className="font-display text-2xl font-bold text-adm-accent-text leading-none mt-0.5">
              {selectedStudents.length}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="adm-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-adm-line pb-3">
                <h3 className="adm-h3 flex items-center gap-2">
                  <Clock size={16} className="text-adm-accent-text" />
                  <span>Recent Letter Archives</span>
                </h3>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearLogs}
                    className="adm-btn adm-btn-danger adm-btn-sm"
                  >
                    <Trash2 size={13} />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {history.length === 0 ? (
                  <p className="adm-muted col-span-full py-4 text-center">No logs found.</p>
                ) : (
                  history.map((log) => (
                    <div key={log.id} className="adm-panel p-4 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {log.isUrgent && (
                            <span className="adm-badge adm-badge-danger text-[10px]">Urgent</span>
                          )}
                          <p className="font-semibold text-sm text-adm-fg line-clamp-1">
                            {log.subject}
                          </p>
                        </div>
                        <p className="text-xs text-adm-fg-3">To: {log.recipient}</p>
                      </div>
                      <div className="pt-2.5 border-t border-adm-line flex justify-between items-center text-xs">
                        <span className="text-adm-success font-semibold">
                          {log.studentCount} Students
                        </span>
                        <span className="text-adm-fg-3">
                          {log.createdAt?.toDate
                            ? log.createdAt.toDate().toLocaleDateString()
                            : "Just Now"}
                        </span>
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
      <div className="adm-card p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-adm-fg-3 mr-1">Quick Templates:</span>
        {[
          { id: "REHEARSAL", label: "Rehearsal Permission" },
          { id: "ATTENDANCE", label: "Attendance Exemption" },
          { id: "BUDGET", label: "Budget Requisition" },
          { id: "EQUIPMENT", label: "Audio/Light Equipment" },
          { id: "HALL", label: "Auditorium Booking" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => applyPreset(p.id)}
            className="adm-btn adm-btn-secondary adm-btn-sm"
          >
            <Zap size={13} className="text-adm-accent-text" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT: CONTENT & SIGNATORY */}
        <div className="xl:col-span-7 space-y-6">
          <div className="adm-card p-5 sm:p-7 space-y-4">
            <div className="border-b border-adm-line pb-3">
              <span className="adm-badge adm-badge-accent mb-1">Step 1</span>
              <h3 className="adm-h2">Letter Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="adm-label">Recipient</label>
                <input
                  type="text"
                  placeholder="RECIPIENT"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="adm-label">Subject Line</label>
                <input
                  type="text"
                  placeholder="SUBJECT"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="adm-input font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="adm-label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="adm-input"
                  />
                </div>
                <div>
                  <label className="adm-label">Venue</label>
                  <input
                    type="text"
                    placeholder="VENUE"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="adm-input"
                  />
                </div>
              </div>

              <div>
                <label className="adm-label">Body / Description</label>
                <textarea
                  placeholder="DESCRIPTION"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="adm-input min-h-36"
                />
              </div>

              <label className="adm-panel p-3.5 inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="adm-check"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-adm-danger">
                  Flag as Urgent / High Priority
                </span>
              </label>
            </div>
          </div>

          <div className="adm-card p-5 sm:p-7 space-y-4">
            <div className="border-b border-adm-line pb-3">
              <span className="adm-badge adm-badge-success mb-1">Step 2</span>
              <h3 className="adm-h2">Authorized Signatory</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="adm-label">Signatory Name</label>
                <input
                  type="text"
                  placeholder="NAME"
                  value={formData.signatoryName}
                  onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                  className="adm-input"
                />
              </div>
              <div>
                <label className="adm-label">Designation</label>
                <input
                  type="text"
                  placeholder="DESIGNATION"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="adm-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SEARCH & MEMBER LIST */}
        <div className="xl:col-span-5 adm-card overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 bg-adm-surface-2 border-b border-adm-line space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="adm-h3">Attach Crew Roster</h3>
              <span className="adm-badge adm-badge-accent">
                {selectedStudents.length} Selected
              </span>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="adm-input pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="adm-input py-1.5 text-xs"
              >
                <option value="ALL">All Years</option>
                {availableYears.map((y) => (
                  <option key={y as string} value={y as string}>
                    {y} Year
                  </option>
                ))}
              </select>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="adm-input py-1.5 text-xs"
              >
                <option value="ALL">All Branches</option>
                {availableBranches.map((b) => (
                  <option key={b as string} value={b as string}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="adm-btn adm-btn-secondary adm-btn-sm"
              >
                Select Filtered ({filteredTeam.length})
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="adm-btn adm-btn-danger adm-btn-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-[480px] overflow-y-auto p-4 space-y-2">
            {filteredTeam.map((s) => {
              const isSelected = selectedStudents.some((x) => x.id === s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStudent(s)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-adm-accent/15 border-adm-accent/45 text-adm-fg"
                      : "bg-adm-surface-2 border-adm-line text-adm-fg-2 hover:text-adm-fg"
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-sm text-adm-fg truncate">{s.name}</p>
                    <p className="text-xs text-adm-fg-3 truncate">
                      {s.branch} {s.year}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckSquare size={18} className="text-adm-accent-text" />
                    ) : (
                      <Square size={18} className="text-adm-fg-3" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCompile}
        className="adm-btn adm-btn-primary adm-btn-lg w-full py-4 text-base"
      >
        <FileText size={20} />
        <span>Compile & Download Official PDF</span>
      </button>
    </div>
  );
}