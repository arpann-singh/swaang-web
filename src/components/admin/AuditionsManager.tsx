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

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const [scores, setScores] = useState({
    voice: 5,
    acting: 5,
    confidence: 5,
    improv: 5,
  });
  const [directorNotes, setDirectorNotes] = useState("");
  const [isSavingScore, setIsSavingScore] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "auditions"), (docSnap) => {
      if (docSnap.exists()) {
        setIsLive(docSnap.data().isLive || false);
      }
    });
    return () => unsub();
  }, []);

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

  const openWhatsApp = (name: string, rawPhone: string) => {
    if (!rawPhone) return;
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${name}! Greetings from SWAANG - The Dramatic Society.\n\nWe have reviewed your audition profile. Please access the official candidate resources and scripts here:\nhttps://swaang.club/auditions/resources\n\nSee you on stage!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank");
  };

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

  const rankedAuditions = [...auditions]
    .filter((a) => (a.evaluation?.totalScore || a.scores?.total || 0) > 0)
    .sort((a, b) => {
      const scoreA = a.evaluation?.totalScore ?? a.scores?.total ?? 0;
      const scoreB = b.evaluation?.totalScore ?? b.scores?.total ?? 0;
      return scoreB - scoreA;
    });

  return (
    <div className="space-y-8 text-left pb-16 w-full text-zinc-100">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end border-b border-white/10 pb-6 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold tracking-tight text-[#FFF9F0]">
            Casting Desk
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              AUDITION OPERATIONS
            </span>
            <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
              Total Candidates: {auditions.length}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* VIEW SWITCHER */}
          <div className="flex p-1 bg-white/[0.04] border border-white/10 rounded-xl">
            <button
              onClick={() => setViewMode("roster")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs transition-all ${
                viewMode === "roster" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <List size={14} />
              Roster
            </button>
            <button
              onClick={() => setViewMode("judging")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-xs transition-all ${
                viewMode === "judging" ? "bg-amber-500 text-black font-bold shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Award size={14} />
              Judging Matrix
            </button>
          </div>

          {/* FORM LIVE TOGGLE */}
          <button
            onClick={toggleFormLive}
            className={`flex items-center gap-2 border px-4 py-2.5 rounded-xl font-mono text-xs font-medium transition-all ${
              isLive ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-white/[0.04] text-zinc-400 border-white/10"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
            {isLive ? "PORTAL OPEN" : "PORTAL CLOSED"}
          </button>

          {/* CSV EXPORT */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/15 px-4 py-2.5 rounded-xl font-mono text-xs transition-all shadow-sm"
          >
            <Download size={14} className="text-amber-400" />
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#16161A] border border-white/10 p-4 rounded-2xl shadow-sm">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search name, phone, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl font-mono text-xs text-white placeholder:text-zinc-500 outline-none focus:border-amber-400/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
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
                  className={`px-3 py-1.5 font-mono text-[11px] rounded-lg transition-all ${
                    statusFilter === f.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                      : "text-zinc-400 hover:text-white bg-white/[0.02]"
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
              <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-3xl bg-[#16161A]/50 p-8">
                <p className="font-mono text-zinc-500 text-sm">
                  No applicant profiles found matching the current filters.
                </p>
              </div>
            ) : (
              filteredAuditions.map((a) => {
                const totalScore = a.evaluation?.totalScore ?? a.scores?.total ?? null;
                return (
                  <div
                    key={a.id}
                    className="bg-[#16161A] border border-white/10 rounded-3xl p-6 shadow-md hover:border-amber-500/30 flex flex-col justify-between transition-all group"
                  >
                    <div>
                      {/* TOP BADGES */}
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <div>
                          <h3 className="font-cinzel font-bold text-2xl text-white leading-tight">
                            {a.name}
                          </h3>
                          <span className="inline-block bg-white/[0.05] text-amber-300 px-2.5 py-0.5 text-[10px] font-mono rounded-md mt-1.5 border border-amber-500/20">
                            {a.role || "General Acting"}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${
                            a.status === "accepted"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : a.status === "Shortlisted"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : a.status === "Round 1 Cleared"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : a.status === "rejected"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : "bg-white/[0.04] text-zinc-400 border-white/10"
                          }`}
                        >
                          {a.status || "Pending"}
                        </span>
                      </div>

                      {/* SCORE PILL */}
                      {totalScore !== null && (
                        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between font-mono text-xs">
                          <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            PANEL SCORE
                          </span>
                          <span className="bg-amber-400 text-black px-2 py-0.5 rounded font-bold text-xs">
                            {totalScore} / 40
                          </span>
                        </div>
                      )}

                      {/* CONTACT CHANNELS */}
                      <div className="grid grid-cols-2 gap-2 mb-4 font-mono">
                        {a.phone && (
                          <button
                            onClick={() => openWhatsApp(a.name, a.phone)}
                            className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 py-2 px-2.5 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                            title="Send WhatsApp message"
                          >
                            <MessageSquare size={13} />
                            WhatsApp
                          </button>
                        )}
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 py-2 px-2.5 rounded-xl text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Phone size={13} />
                            Call
                          </a>
                        )}
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="col-span-2 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/10 py-1.5 px-3 rounded-xl text-xs truncate flex items-center gap-2 transition-colors"
                          >
                            <Mail size={12} className="shrink-0 text-zinc-500" />
                            <span className="truncate">{a.email}</span>
                          </a>
                        )}
                      </div>

                      {/* LINKS */}
                      <div className="flex gap-2 mb-4 font-mono text-xs">
                        {a.photoLink && (
                          <a
                            href={a.photoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10 py-1.5 rounded-xl text-center transition-colors"
                          >
                            Headshot ⤾
                          </a>
                        )}
                        {(a.portfolio || a.experience) && (
                          <a
                            href={a.portfolio || a.experience}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/10 py-1.5 rounded-xl text-center transition-colors"
                          >
                            Portfolio ⤾
                          </a>
                        )}
                      </div>

                      {/* MOTIVATION / STATEMENT */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-xs italic text-zinc-400 max-h-24 overflow-y-auto mb-4 font-serif">
                        "{a.motivation || a.message || "No motivation statement provided."}"
                      </div>
                    </div>

                    {/* STATUS ACTION BUTTONS */}
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                        <button
                          onClick={() => updateStatus(a.id, "Round 1 Cleared")}
                          className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 py-1.5 rounded-lg font-bold transition-colors"
                        >
                          Pass R1
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, "Shortlisted")}
                          className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 py-1.5 rounded-lg font-bold transition-colors"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateStatus(a.id, "rejected")}
                          className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 py-1.5 rounded-lg font-bold transition-colors"
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
                          className="text-xs font-mono text-amber-400 hover:text-amber-300 underline"
                        >
                          Judge in Matrix ➔
                        </button>
                        <button
                          onClick={() => deleteAudition(a.id)}
                          className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
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
          <div className="lg:col-span-4 bg-[#16161A] border border-white/10 rounded-3xl p-6 shadow-md max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="border-b border-white/10 pb-3 mb-4">
              <h3 className="font-cinzel font-bold text-xl text-[#FFF9F0] flex items-center gap-2">
                <UserCheck className="text-amber-400" />
                Audition Queue
              </h3>
              <p className="font-mono text-[10px] text-zinc-400">
                Select applicant to score in real time
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
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                        : "bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-cinzel font-bold text-base text-white leading-tight">
                          {a.name}
                        </h4>
                        <p className={`font-mono text-[10px] mt-0.5 ${isSelected ? "text-amber-400" : "text-zinc-500"}`}>
                          {a.role || "General"}
                        </p>
                      </div>
                      <div className="text-right">
                        {totalScore !== null ? (
                          <span className="font-mono font-bold text-xs bg-amber-400 text-black px-2 py-0.5 rounded">
                            {totalScore}/40
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-zinc-500">UNSCORED</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE JUDGING RUBRIC & SLIDERS (COL 5-8) */}
          <div className="lg:col-span-5 bg-[#16161A] border border-white/10 rounded-3xl p-6 md:p-8 shadow-md">
            {selectedCandidate ? (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4 flex justify-between items-start">
                  <div>
                    <span className="bg-amber-500/15 text-amber-300 px-2.5 py-0.5 font-mono text-[10px] rounded-full border border-amber-500/30">
                      CURRENT APPLICANT
                    </span>
                    <h3 className="font-cinzel text-3xl font-bold text-[#FFF9F0] mt-2">
                      {selectedCandidate.name}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400">
                      Role Target: <strong className="text-zinc-200">{selectedCandidate.role || "General Acting"}</strong>
                    </p>
                  </div>

                  <div className="bg-[#121215] border border-amber-500/30 rounded-2xl p-3 text-center shadow-md">
                    <span className="block font-mono text-[9px] text-zinc-400 uppercase">SCORE</span>
                    <span className="font-mono text-3xl font-bold text-amber-400 leading-none">{totalScoreCalc}</span>
                    <span className="block font-mono text-[9px] text-zinc-500">/40</span>
                  </div>
                </div>

                {/* SLIDERS MATRIX */}
                <div className="space-y-3.5">
                  {[
                    { id: "voice", label: "Voice & Diction", desc: "Clarity, projection, pitch modulation" },
                    { id: "acting", label: "Acting & Emotional Range", desc: "Character depth, conviction, realism" },
                    { id: "confidence", label: "Confidence & Presence", desc: "Stage awareness, posture, eye contact" },
                    { id: "improv", label: "Improvisation & Adaptability", desc: "Response to cues, spontaneity" },
                  ].map((metric) => (
                    <div key={metric.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <label className="font-mono text-xs font-bold text-zinc-200 block">
                            {metric.label}
                          </label>
                          <span className="font-mono text-[10px] text-zinc-500">{metric.desc}</span>
                        </div>
                        <span className="font-mono font-bold text-sm text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
                      />
                    </div>
                  ))}
                </div>

                {/* DIRECTOR'S NOTES */}
                <div>
                  <label className="text-xs font-mono font-medium text-zinc-300 block mb-1.5">
                    Director / Panel Observations
                  </label>
                  <textarea
                    placeholder="e.g. Exceptional vocal range; consider for Main Lead in Street Play..."
                    value={directorNotes}
                    onChange={(e) => setDirectorNotes(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 font-mono text-xs text-white h-24 resize-none outline-none focus:border-amber-400/50"
                  />
                </div>

                {/* SAVE & STATUS BUTTONS */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => saveEvaluation()}
                    disabled={isSavingScore}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                  >
                    {isSavingScore ? "SAVING..." : "COMMIT EVALUATION SCORE"}
                  </button>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                    <button
                      onClick={() => saveEvaluation("Round 1 Cleared")}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 py-2 rounded-lg font-bold transition-colors"
                    >
                      + Pass Round 1
                    </button>
                    <button
                      onClick={() => saveEvaluation("Shortlisted")}
                      className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 py-2 rounded-lg font-bold transition-colors"
                    >
                      + Shortlist
                    </button>
                    <button
                      onClick={() => saveEvaluation("rejected")}
                      className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 py-2 rounded-lg font-bold transition-colors"
                    >
                      + Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center font-mono text-zinc-500 text-sm">
                Select an applicant from the queue to start grading
              </div>
            )}
          </div>

          {/* REALTIME RANKED LEADERBOARD (COL 9-12) */}
          <div className="lg:col-span-3 bg-[#16161A] border border-white/10 rounded-3xl p-6 shadow-md">
            <div className="border-b border-white/10 pb-3 mb-4">
              <h3 className="font-cinzel font-bold text-lg text-[#FFF9F0] flex items-center gap-2">
                <Award className="text-amber-400" />
                Live Standings
              </h3>
              <p className="font-mono text-[9px] text-zinc-400 uppercase">Ranked by panel score</p>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {rankedAuditions.length === 0 ? (
                <p className="font-mono text-xs text-zinc-500 italic py-6 text-center">
                  No applicants scored yet.
                </p>
              ) : (
                rankedAuditions.map((candidate, idx) => {
                  const score = candidate.evaluation?.totalScore ?? candidate.scores?.total ?? 0;
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                        candidate.id === selectedCandidateId
                          ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm"
                          : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                          idx === 0 ? "bg-amber-400 text-black" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-zinc-300"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-mono font-bold text-xs text-white truncate leading-tight">
                            {candidate.name}
                          </p>
                          <p className="font-mono text-[9px] text-zinc-400">
                            {candidate.status || "Pending"}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 ml-2 shrink-0">
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