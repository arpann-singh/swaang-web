"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import { UserCheck, List, Search, Download, MessageSquare, Phone, Mail, ExternalLink, Star, Award, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AuditionsManager({ auditions }: { auditions: any[] }) {
  const [isLive, setIsLive] = useState(false);
  const [viewMode, setViewMode] = useState<"roster" | "judging">("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected candidate for Live Judging Matrix
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Live Rubric Scoring State (Voice, Acting, Confidence, Improv - 0-10)
  const [scores, setScores] = useState({
    voice: 5,
    acting: 5,
    confidence: 5,
    improv: 5,
  });
  const [directorNotes, setDirectorNotes] = useState("");
  const [isSavingScore, setIsSavingScore] = useState(false);

  // Sync Form Live state
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "auditions"), (docSnap) => {
      if (docSnap.exists()) {
        setIsLive(docSnap.data().isLive || false);
      }
    });
    return () => unsub();
  }, []);

  // Update selected candidate rubric when selection changes
  useEffect(() => {
    if (!selectedCandidateId) {
      if (auditions.length > 0) {
        setSelectedCandidateId(auditions[0].id);
      }
      return;
    }

    const current = auditions.find((a) => a.id === selectedCandidateId);
    if (current) {
      if (current.evaluation) {
        setScores({
          voice: current.evaluation.voice ?? 5,
          acting: current.evaluation.acting ?? 5,
          confidence: current.evaluation.confidence ?? 5,
          improv: current.evaluation.improv ?? 5,
        });
        setDirectorNotes(current.evaluation.notes || "");
      } else if (current.scores) {
        setScores({
          voice: current.scores.voice ?? 5,
          acting: current.scores.acting ?? 5,
          confidence: current.scores.confidence ?? 5,
          improv: current.scores.improv ?? 5,
        });
        setDirectorNotes(current.notes || "");
      } else {
        setScores({ voice: 5, acting: 5, confidence: 5, improv: 5 });
        setDirectorNotes("");
      }
    }
  }, [selectedCandidateId, auditions]);

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

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "auditions", id), { status: newStatus });
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const deleteAudition = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this audition record?")) return;
    try {
      await deleteDoc(doc(db, "auditions", id));
      if (selectedCandidateId === id) setSelectedCandidateId(null);
    } catch (err: any) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const saveEvaluation = async (statusOverride?: string) => {
    if (!selectedCandidateId) return;
    setIsSavingScore(true);
    const totalScore = scores.voice + scores.acting + scores.confidence + scores.improv;
    try {
      const updatePayload: Record<string, any> = {
        evaluation: {
          ...scores,
          totalScore,
          notes: directorNotes,
          evaluatedAt: new Date().toISOString(),
        },
        // Total backward compatibility for legacy score views
        scores: {
          ...scores,
          total: totalScore,
        },
      };

      if (statusOverride) {
        updatePayload.status = statusOverride;
      }

      await updateDoc(doc(db, "auditions", selectedCandidateId), updatePayload);
    } catch (err: any) {
      alert("Failed to save evaluation: " + err.message);
    } finally {
      setIsSavingScore(false);
    }
  };

  // WhatsApp helper
  const openWhatsApp = (name: string, rawPhone: string) => {
    if (!rawPhone) return;
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${name}! Greetings from SWAANG - The Dramatic Society.\n\nWe have reviewed your audition profile. Please access the official candidate resources and scripts here:\nhttps://swaang.club/auditions/resources\n\nSee you on stage!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

  // CSV Export
  const exportToCSV = () => {
    if (!auditions || auditions.length === 0) {
      alert("No auditions to export yet!");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Total Score (/40)",
      "Voice (/10)",
      "Acting (/10)",
      "Confidence (/10)",
      "Improv (/10)",
      "Status",
      "Director Notes",
      "Portfolio/Experience",
      "Motivation",
      "Submitted Date",
    ];

    const rows = auditions.map((a) => {
      const date = a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "Unknown";
      const totalScore = a.evaluation?.totalScore ?? (a.scores?.total || 0);
      return [
        `"${(a.name || "").replace(/"/g, '""')}"`,
        `"${(a.email || "").replace(/"/g, '""')}"`,
        `"${(a.phone || "").replace(/"/g, '""')}"`,
        `"${(a.role || "General").replace(/"/g, '""')}"`,
        totalScore,
        a.evaluation?.voice ?? a.scores?.voice ?? 0,
        a.evaluation?.acting ?? a.scores?.acting ?? 0,
        a.evaluation?.confidence ?? a.scores?.confidence ?? 0,
        a.evaluation?.improv ?? a.scores?.improv ?? 0,
        `"${(a.status || "pending").replace(/"/g, '""')}"`,
        `"${(a.evaluation?.notes || a.notes || "").replace(/"/g, '""')}"`,
        `"${(a.portfolio || a.experience || "None").replace(/"/g, '""')}"`,
        `"${(a.motivation || a.message || "").replace(/"/g, '""')}"`,
        `"${date}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Swaang_Auditions_Export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered auditions
  const filteredAuditions = auditions.filter((a) => {
    const matchesSearch =
      (a.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.role || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (!a.status || a.status === "pending")) ||
      (a.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const selectedCandidate = auditions.find((a) => a.id === selectedCandidateId);
  const totalScoreCalc = scores.voice + scores.acting + scores.confidence + scores.improv;

  // Ranked Leaderboard
  const rankedAuditions = [...auditions]
    .filter((a) => (a.evaluation?.totalScore || a.scores?.total || 0) > 0)
    .sort((a, b) => {
      const scoreA = a.evaluation?.totalScore ?? a.scores?.total ?? 0;
      const scoreB = b.evaluation?.totalScore ?? b.scores?.total ?? 0;
      return scoreB - scoreA;
    });

  return (
    <div className="space-y-8 text-left pb-16 w-full">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b-8 border-black pb-6 gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-cinzel font-black uppercase tracking-tighter text-black">
            Casting Desk
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-mono font-black uppercase tracking-[0.2em] bg-black text-[#FFD166] text-[10px] px-2 py-1 border-2 border-black">
              SYS.AUDITIONS_CONTROL
            </span>
            <span className="text-[10px] font-mono font-bold uppercase text-black/60 bg-white px-2 py-1 border-2 border-black">
              Total Candidates: {auditions.length}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* VIEW SWITCHER */}
          <div className="flex border-4 border-black bg-white shadow-[4px_4px_0px_black] p-1">
            <button
              onClick={() => setViewMode("roster")}
              className={`flex items-center gap-2 px-4 py-2 font-mono font-black text-xs uppercase transition-all ${
                viewMode === "roster" ? "bg-black text-[#FFD166]" : "text-black hover:bg-gray-100"
              }`}
            >
              <List size={14} strokeWidth={3} />
              Roster View
            </button>
            <button
              onClick={() => setViewMode("judging")}
              className={`flex items-center gap-2 px-4 py-2 font-mono font-black text-xs uppercase transition-all ${
                viewMode === "judging" ? "bg-[#FF5F5F] text-white" : "text-black hover:bg-gray-100"
              }`}
            >
              <Award size={14} strokeWidth={3} />
              Judging Matrix
            </button>
          </div>

          {/* FORM LIVE TOGGLE */}
          <button
            onClick={toggleFormLive}
            className={`flex items-center gap-2 border-4 border-black px-5 py-3 font-mono font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${
              isLive ? "bg-[#06D6A0] text-black" : "bg-gray-200 text-gray-500"
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full border border-black ${isLive ? "bg-black animate-pulse" : "bg-gray-400"}`} />
            {isLive ? "PORTAL LIVE" : "PORTAL CLOSED"}
          </button>

          {/* CSV EXPORT */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-[#FFD166] text-black border-4 border-black px-5 py-3 font-mono font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <Download size={14} strokeWidth={3} />
            EXPORT CSV
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: CANDIDATE ROSTER & CONTACT HUB                          */}
      {/* ============================================================== */}
      {viewMode === "roster" && (
        <div className="space-y-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#FFF9F0] border-4 border-black p-4 shadow-[6px_6px_0px_black]">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                type="text"
                placeholder="Search name, phone, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black font-mono text-xs font-bold uppercase placeholder:normal-case outline-none focus:border-[#FF5F5F]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: "all", label: "ALL" },
                { id: "pending", label: "PENDING" },
                { id: "Round 1 Cleared", label: "ROUND 1" },
                { id: "Shortlisted", label: "SHORTLISTED" },
                { id: "accepted", label: "ACCEPTED" },
                { id: "rejected", label: "REJECTED" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 font-mono font-black text-[10px] uppercase border-2 border-black transition-all ${
                    statusFilter === f.id ? "bg-black text-[#06D6A0] shadow-[2px_2px_0px_#06D6A0]" : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* GRID OF APPLICANTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuditions.length === 0 ? (
              <div className="col-span-full py-20 text-center border-4 border-dashed border-black/30 bg-white/50 p-8">
                <p className="font-mono font-black uppercase text-gray-500 text-lg">
                  No applicant profiles found matching current filters.
                </p>
              </div>
            ) : (
              filteredAuditions.map((a) => {
                const totalScore = a.evaluation?.totalScore ?? a.scores?.total ?? null;
                return (
                  <div
                    key={a.id}
                    className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_black] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_black] transition-all"
                  >
                    <div>
                      {/* TOP BADGES */}
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div>
                          <h3 className="font-cinzel font-black text-2xl uppercase leading-none tracking-tight">
                            {a.name}
                          </h3>
                          <span className="inline-block bg-black text-[#FFD166] px-2 py-0.5 text-[9px] font-mono font-black uppercase tracking-wider mt-2 border border-black">
                            {a.role || "General Acting"}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-mono font-black uppercase px-2.5 py-1 border-2 border-black shrink-0 ${
                            a.status === "accepted"
                              ? "bg-[#06D6A0] text-black"
                              : a.status === "Shortlisted"
                              ? "bg-[#FFD166] text-black"
                              : a.status === "Round 1 Cleared"
                              ? "bg-[#06D6A0]/80 text-black"
                              : a.status === "rejected"
                              ? "bg-[#FF5F5F] text-white"
                              : "bg-gray-100 text-black"
                          }`}
                        >
                          {a.status || "Pending"}
                        </span>
                      </div>

                      {/* SCORE PILL */}
                      {totalScore !== null && (
                        <div className="mb-4 bg-[#FFD166]/30 border-2 border-black p-2 flex items-center justify-between font-mono text-xs font-black">
                          <span className="flex items-center gap-1">
                            <Star size={14} className="fill-black" />
                            PANEL SCORE
                          </span>
                          <span className="bg-black text-[#FFD166] px-2 py-0.5 text-xs">
                            {totalScore} / 40
                          </span>
                        </div>
                      )}

                      {/* CONTACT CHANNELS */}
                      <div className="grid grid-cols-2 gap-2 mb-4 font-mono">
                        {a.phone && (
                          <button
                            onClick={() => openWhatsApp(a.name, a.phone)}
                            className="bg-[#25D366] text-black border-2 border-black py-1.5 px-2 text-[10px] font-black uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all"
                            title="Send WhatsApp message"
                          >
                            <MessageSquare size={12} strokeWidth={3} />
                            WhatsApp
                          </button>
                        )}
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="bg-[#FFD166] text-black border-2 border-black py-1.5 px-2 text-[10px] font-black uppercase flex items-center justify-center gap-1 shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-y-0.5 transition-all"
                          >
                            <Phone size={12} strokeWidth={3} />
                            Call
                          </a>
                        )}
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="col-span-2 bg-[#FFF9F0] text-black border-2 border-black py-1 px-2 text-[10px] font-bold lowercase truncate flex items-center gap-1.5 shadow-[2px_2px_0px_black]"
                          >
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{a.email}</span>
                          </a>
                        )}
                      </div>

                      {/* LINKS */}
                      <div className="flex gap-2 mb-4">
                        {a.photoLink && (
                          <a
                            href={a.photoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-pink-100 text-black border-2 border-black p-1.5 text-[9px] font-mono font-black uppercase flex items-center justify-center gap-1 hover:bg-pink-200"
                          >
                            Headshot ⤾
                          </a>
                        )}
                        {(a.portfolio || a.experience) && (
                          <a
                            href={a.portfolio || a.experience}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-blue-100 text-black border-2 border-black p-1.5 text-[9px] font-mono font-black uppercase flex items-center justify-center gap-1 hover:bg-blue-200"
                          >
                            Portfolio ⤾
                          </a>
                        )}
                      </div>

                      {/* MOTIVATION / REMARKS */}
                      <div className="bg-gray-50 border-2 border-black/10 p-3 text-xs italic text-black/80 max-h-24 overflow-y-auto mb-4 font-serif">
                        "{a.motivation || a.message || "No motivation statement provided."}"
                      </div>
                    </div>

                    {/* STATUS ACTION BUTTONS */}
                    <div className="pt-3 border-t-2 border-black/10 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => updateStatus(a.id, "Round 1 Cleared")}
                          className="bg-[#06D6A0] text-black border-2 border-black py-1.5 font-mono font-black text-[9px] uppercase hover:bg-green-400"
                        >
                          R1 Pass
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, "Shortlisted")}
                          className="bg-[#FFD166] text-black border-2 border-black py-1.5 font-mono font-black text-[9px] uppercase hover:bg-yellow-400"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, "rejected")}
                          className="bg-gray-200 text-black border-2 border-black py-1.5 font-mono font-black text-[9px] uppercase hover:bg-[#FF5F5F] hover:text-white"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-1">
                        <button
                          onClick={() => {
                            setSelectedCandidateId(a.id);
                            setViewMode("judging");
                          }}
                          className="text-[10px] font-mono font-black uppercase underline hover:text-[#FF5F5F]"
                        >
                          Open in Judge Matrix ➔
                        </button>
                        <button
                          onClick={() => deleteAudition(a.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: LIVE AUDITION JUDGING MATRIX & LEADERBOARD              */}
      {/* ============================================================== */}
      {viewMode === "judging" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CANDIDATE SELECTOR LIST (COL 1-4) */}
          <div className="lg:col-span-4 bg-white border-8 border-black p-6 shadow-[12px_12px_0px_black] max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="border-b-4 border-black pb-3 mb-4">
              <h3 className="font-cinzel font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <UserCheck className="text-[#06D6A0]" />
                Audition Queue
              </h3>
              <p className="font-mono text-[10px] text-black/60 uppercase">
                Select candidate to evaluate
              </p>
            </div>

            <div className="space-y-2 flex-1">
              {auditions.map((a) => {
                const isSelected = a.id === selectedCandidateId;
                const totalScore = a.evaluation?.totalScore ?? a.scores?.total ?? null;
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedCandidateId(a.id)}
                    className={`w-full text-left p-3.5 border-4 border-black transition-all ${
                      isSelected
                        ? "bg-[#2D2D2D] text-white shadow-[4px_4px_0px_#06D6A0] translate-x-1"
                        : "bg-white text-black hover:bg-[#FFD166] shadow-[2px_2px_0px_black]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-cinzel font-black text-base uppercase leading-tight">
                          {a.name}
                        </h4>
                        <p className={`font-mono text-[9px] uppercase mt-0.5 ${isSelected ? "text-[#06D6A0]" : "text-black/60"}`}>
                          {a.role || "General"}
                        </p>
                      </div>
                      <div className="text-right">
                        {totalScore !== null ? (
                          <span className="font-mono font-black text-xs bg-[#FFD166] text-black px-2 py-0.5 border border-black inline-block">
                            {totalScore}/40
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] uppercase text-gray-400">UNSCORED</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE JUDGING RUBRIC & SLIDERS (COL 5-8) */}
          <div className="lg:col-span-5 bg-[#FFF9F0] border-8 border-black p-6 md:p-8 shadow-[12px_12px_0px_#FFD166]">
            {selectedCandidate ? (
              <div className="space-y-6">
                <div className="border-b-4 border-black pb-4 flex justify-between items-start">
                  <div>
                    <span className="bg-black text-[#FFD166] px-2 py-0.5 font-mono text-[10px] font-black uppercase border border-black">
                      ACTIVE CANDIDATE
                    </span>
                    <h3 className="font-cinzel text-3xl md:text-4xl font-black uppercase tracking-tight mt-2">
                      {selectedCandidate.name}
                    </h3>
                    <p className="font-mono text-xs text-black/70">
                      Applied For: <strong>{selectedCandidate.role || "General Acting"}</strong>
                    </p>
                  </div>

                  <div className="bg-black text-[#06D6A0] p-3 border-4 border-black text-center shadow-[4px_4px_0px_white]">
                    <span className="block font-mono text-[9px] text-white uppercase">TOTAL</span>
                    <span className="font-mono text-3xl font-black leading-none">{totalScoreCalc}</span>
                    <span className="block font-mono text-[9px] text-white/50">/40</span>
                  </div>
                </div>

                {/* SLIDERS MATRIX */}
                <div className="space-y-4">
                  {[
                    { id: "voice", label: "Voice & Diction", desc: "Clarity, projection, pitch modulation" },
                    { id: "acting", label: "Acting & Emotional Range", desc: "Character depth, conviction, realism" },
                    { id: "confidence", label: "Confidence & Presence", desc: "Stage awareness, posture, eye contact" },
                    { id: "improv", label: "Improvisation & Adaptability", desc: "Response to cues, spontaneity" },
                  ].map((metric) => (
                    <div key={metric.id} className="bg-white border-4 border-black p-3.5 shadow-[4px_4px_0px_black]">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <label className="font-mono font-black text-xs uppercase tracking-tight text-black block">
                            {metric.label}
                          </label>
                          <span className="font-mono text-[9px] text-black/50">{metric.desc}</span>
                        </div>
                        <span className="font-mono font-black text-base text-[#FF5F5F] bg-[#FFF9F0] px-2.5 py-0.5 border-2 border-black">
                          {scores[metric.id as keyof typeof scores]} / 10
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={scores[metric.id as keyof typeof scores]}
                        onChange={(e) =>
                          setScores({ ...scores, [metric.id]: parseInt(e.target.value) })
                        }
                        className="w-full h-3 bg-gray-200 border-2 border-black appearance-none cursor-pointer accent-[#2D2D2D] mt-2"
                      />
                    </div>
                  ))}
                </div>

                {/* DIRECTOR'S NOTES */}
                <div>
                  <label className="text-[10px] font-mono font-black uppercase tracking-widest text-black block mb-1">
                    Director / Panel Remarks
                  </label>
                  <textarea
                    placeholder="e.g. Exceptional vocal strength; consider for Main Lead antagonist in Street Play..."
                    value={directorNotes}
                    onChange={(e) => setDirectorNotes(e.target.value)}
                    className="w-full bg-white border-4 border-black p-3 font-mono text-xs h-24 resize-none outline-none focus:border-[#FF5F5F]"
                  />
                </div>

                {/* SAVE & STATUS BUTTONS */}
                <div className="space-y-3 pt-2 border-t-4 border-black">
                  <button
                    onClick={() => saveEvaluation()}
                    disabled={isSavingScore}
                    className="w-full bg-[#06D6A0] text-black border-4 border-black py-3 font-mono font-black text-sm uppercase shadow-[4px_4px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                  >
                    {isSavingScore ? "SAVING..." : "COMMIT EVALUATION SCORE"}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => saveEvaluation("Round 1 Cleared")}
                      className="bg-[#FFD166] text-black border-2 border-black py-2 font-mono font-black text-[10px] uppercase hover:bg-yellow-400"
                    >
                      + Pass Round 1
                    </button>
                    <button
                      onClick={() => saveEvaluation("Shortlisted")}
                      className="bg-black text-[#06D6A0] border-2 border-black py-2 font-mono font-black text-[10px] uppercase hover:bg-gray-800"
                    >
                      + Shortlist
                    </button>
                    <button
                      onClick={() => saveEvaluation("rejected")}
                      className="bg-[#FF5F5F] text-white border-2 border-black py-2 font-mono font-black text-[10px] uppercase hover:bg-red-600"
                    >
                      + Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center font-mono font-bold text-gray-500 uppercase">
                Select a candidate from the queue to start grading
              </div>
            )}
          </div>

          {/* REALTIME RANKED LEADERBOARD (COL 9-12) */}
          <div className="lg:col-span-3 bg-white border-8 border-black p-6 shadow-[12px_12px_0px_black]">
            <div className="border-b-4 border-black pb-3 mb-4">
              <h3 className="font-cinzel font-black text-lg uppercase tracking-tight flex items-center gap-2">
                <Award className="text-[#FFD166]" />
                Live Standings
              </h3>
              <p className="font-mono text-[9px] text-black/60 uppercase">Ranked by composite score</p>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {rankedAuditions.length === 0 ? (
                <p className="font-mono text-xs text-gray-400 italic py-6 text-center">
                  No candidates scored yet.
                </p>
              ) : (
                rankedAuditions.map((candidate, idx) => {
                  const score = candidate.evaluation?.totalScore ?? candidate.scores?.total ?? 0;
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`p-2.5 border-2 border-black flex items-center justify-between cursor-pointer transition-all ${
                        candidate.id === selectedCandidateId
                          ? "bg-[#FFD166] shadow-[2px_2px_0px_black]"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-5 h-5 flex items-center justify-center font-mono font-black text-[10px] border border-black ${
                          idx === 0 ? "bg-[#FFD166] text-black" : idx === 1 ? "bg-gray-300 text-black" : idx === 2 ? "bg-amber-600 text-white" : "bg-black text-white"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-mono font-black text-xs uppercase truncate leading-tight">
                            {candidate.name}
                          </p>
                          <p className="font-mono text-[8px] text-black/50 uppercase">
                            {candidate.status || "Pending"}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-black text-xs shrink-0 bg-black text-white px-2 py-0.5 border border-black ml-2">
                        {score}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}