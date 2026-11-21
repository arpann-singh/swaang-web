"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import {
  UserCheck,
  List,
  Search,
  Download,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Award,
  Trash2,
} from "lucide-react";

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

  const getStatusBadge = (status?: string) => {
    if (status === "accepted") return "adm-badge-success";
    if (status === "Shortlisted") return "adm-badge-accent";
    if (status === "Round 1 Cleared") return "adm-badge-info";
    if (status === "rejected") return "adm-badge-danger";
    return "adm-badge-neutral";
  };

  return (
    <div className="space-y-6 text-left w-full">
      {/* HEADER */}
      <div className="adm-card p-5 sm:p-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <p className="adm-eyebrow">Audition Operations</p>
          <h2 className="adm-title mt-1">Casting Desk</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="adm-badge adm-badge-neutral">Total Candidates: {auditions.length}</span>
            <span className={`adm-badge ${isLive ? "adm-badge-success" : "adm-badge-neutral"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-adm-success animate-pulse" : "bg-adm-fg-3"}`} />
              <span>{isLive ? "Portal Live" : "Portal Closed"}</span>
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          {/* VIEW SWITCHER */}
          <div className="adm-seg">
            <button
              type="button"
              onClick={() => setViewMode("roster")}
              data-active={viewMode === "roster" ? "true" : "false"}
              className="adm-seg-item"
            >
              <List size={14} />
              <span>Roster</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("judging")}
              data-active={viewMode === "judging" ? "true" : "false"}
              className="adm-seg-item"
            >
              <Award size={14} />
              <span>Judging Matrix</span>
            </button>
          </div>

          {/* FORM LIVE TOGGLE */}
          <button
            type="button"
            onClick={toggleFormLive}
            className={`adm-btn ${isLive ? "adm-btn-success" : "adm-btn-secondary"}`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-adm-success animate-pulse" : "bg-adm-fg-3"}`} />
            <span>{isLive ? "Portal Open" : "Portal Closed"}</span>
          </button>

          {/* CSV EXPORT */}
          <button
            type="button"
            onClick={exportToCSV}
            className="adm-btn adm-btn-secondary"
          >
            <Download size={14} className="text-adm-accent-text" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: CANDIDATE ROSTER & CONTACT HUB                          */}
      {/* ============================================================== */}
      {viewMode === "roster" && (
        <div className="space-y-5">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="adm-card p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-adm-fg-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, phone, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="adm-input pl-9"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto adm-scroll-x">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "Round 1 Cleared", label: "Round 1" },
                { id: "Shortlisted", label: "Shortlisted" },
                { id: "accepted", label: "Accepted" },
                { id: "rejected", label: "Rejected" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  data-active={statusFilter === f.id ? "true" : "false"}
                  className="adm-chip"
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* GRID OF APPLICANTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAuditions.length === 0 ? (
              <div className="col-span-full py-16 text-center adm-card p-8">
                <p className="adm-h3">No applicant profiles found</p>
                <p className="adm-muted mt-1">Adjust your search query or status filter above.</p>
              </div>
            ) : (
              filteredAuditions.map((a) => {
                const totalScore = a.evaluation?.totalScore ?? a.scores?.total ?? null;
                return (
                  <div
                    key={a.id}
                    className="adm-card p-5 flex flex-col justify-between gap-4 hover:border-adm-line-strong transition-all"
                  >
                    <div>
                      {/* TOP BADGES */}
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="min-w-0">
                          <h3 className="font-display font-bold text-xl text-adm-fg leading-tight truncate">
                            {a.name}
                          </h3>
                          <span className="adm-badge adm-badge-accent mt-1.5">
                            {a.role || "General Acting"}
                          </span>
                        </div>
                        <span className={`adm-badge ${getStatusBadge(a.status)} shrink-0`}>
                          {a.status || "Pending"}
                        </span>
                      </div>

                      {/* SCORE PILL */}
                      {totalScore !== null && (
                        <div className="mb-3 adm-panel p-2.5 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-adm-accent-text font-semibold">
                            <Star size={13} className="fill-current" />
                            <span>Panel Score</span>
                          </span>
                          <span className="adm-badge adm-badge-accent font-mono">
                            {totalScore} / 40
                          </span>
                        </div>
                      )}

                      {/* CONTACT CHANNELS */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {a.phone && (
                          <button
                            type="button"
                            onClick={() => openWhatsApp(a.name, a.phone)}
                            className="adm-btn adm-btn-success adm-btn-sm"
                            title="Send WhatsApp message"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp</span>
                          </button>
                        )}
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="adm-btn adm-btn-secondary adm-btn-sm"
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>
                        )}
                        {a.email && (
                          <a
                            href={`mailto:${a.email}`}
                            className="col-span-2 adm-panel px-3 py-2 text-xs text-adm-fg-2 hover:text-adm-fg truncate flex items-center gap-2 transition-colors"
                          >
                            <Mail size={12} className="shrink-0 text-adm-fg-3" />
                            <span className="truncate">{a.email}</span>
                          </a>
                        )}
                      </div>

                      {/* LINKS */}
                      {(a.photoLink || a.portfolio || a.experience) && (
                        <div className="flex gap-2 mb-3">
                          {a.photoLink && (
                            <a
                              href={a.photoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="adm-btn adm-btn-secondary adm-btn-sm flex-1"
                            >
                              Headshot ⤾
                            </a>
                          )}
                          {(a.portfolio || a.experience) && (
                            <a
                              href={a.portfolio || a.experience}
                              target="_blank"
                              rel="noreferrer"
                              className="adm-btn adm-btn-secondary adm-btn-sm flex-1"
                            >
                              Portfolio ⤾
                            </a>
                          )}
                        </div>
                      )}

                      {/* MOTIVATION / STATEMENT */}
                      <div className="adm-panel p-3 text-xs italic text-adm-fg-2 max-h-24 overflow-y-auto">
                        "{a.motivation || a.message || "No motivation statement provided."}"
                      </div>
                    </div>

                    {/* STATUS ACTION BUTTONS */}
                    <div className="pt-3 border-t border-adm-line flex flex-col gap-2.5">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, "Round 1 Cleared")}
                          className="adm-btn adm-btn-success adm-btn-sm px-2 text-xs"
                        >
                          Pass R1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, "Shortlisted")}
                          className="adm-btn adm-btn-secondary adm-btn-sm px-2 text-xs"
                        >
                          Shortlist
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(a.id, "rejected")}
                          className="adm-btn adm-btn-danger adm-btn-sm px-2 text-xs"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidateId(a.id);
                            setViewMode("judging");
                          }}
                          className="adm-link text-xs"
                        >
                          Judge in Matrix ➔
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteAudition(a.id)}
                          className="adm-btn adm-btn-ghost adm-btn-icon adm-btn-sm text-adm-fg-3 hover:text-adm-danger"
                          title="Delete record"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CANDIDATE SELECTOR LIST (COL 1-4) */}
          <div className="lg:col-span-4 adm-card p-5 max-h-[82vh] overflow-y-auto flex flex-col">
            <div className="border-b border-adm-line pb-3 mb-3">
              <h3 className="adm-h2 flex items-center gap-2">
                <UserCheck size={18} className="text-adm-accent-text" />
                <span>Audition Queue</span>
              </h3>
              <p className="adm-muted">Select applicant to score in real time</p>
            </div>

            <div className="space-y-1.5 flex-1">
              {auditions.map((a) => {
                const isSelected = a.id === selectedCandidateId;
                const totalScore = a.evaluation?.totalScore ?? a.scores?.total ?? null;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedCandidateId(a.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-adm-accent/15 border-adm-accent/45 text-adm-fg"
                        : "bg-adm-surface-2 border-adm-line text-adm-fg-2 hover:text-adm-fg"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-adm-fg truncate">
                          {a.name}
                        </h4>
                        <p className="text-xs text-adm-fg-3 truncate mt-0.5">
                          {a.role || "General"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        {totalScore !== null ? (
                          <span className="adm-badge adm-badge-accent font-mono">
                            {totalScore}/40
                          </span>
                        ) : (
                          <span className="adm-badge adm-badge-neutral text-[10px]">Unscored</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE JUDGING RUBRIC & SLIDERS (COL 5-8) */}
          <div className="lg:col-span-5 adm-card p-5 sm:p-7">
            {selectedCandidate ? (
              <div className="space-y-5">
                <div className="border-b border-adm-line pb-4 flex justify-between items-start gap-3">
                  <div>
                    <span className="adm-badge adm-badge-accent">Current Applicant</span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-adm-fg mt-2">
                      {selectedCandidate.name}
                    </h3>
                    <p className="adm-muted mt-0.5">
                      Role Target: <strong className="text-adm-fg">{selectedCandidate.role || "General Acting"}</strong>
                    </p>
                  </div>

                  <div className="adm-panel px-4 py-2.5 text-center shrink-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-adm-fg-3">
                      Score
                    </span>
                    <span className="font-display text-3xl font-bold text-adm-accent-text leading-none">
                      {totalScoreCalc}
                    </span>
                    <span className="block text-[10px] font-mono text-adm-fg-3">/40</span>
                  </div>
                </div>

                {/* SLIDERS MATRIX */}
                <div className="space-y-3">
                  {[
                    { id: "voice", label: "Voice & Diction", desc: "Clarity, projection, pitch modulation" },
                    { id: "acting", label: "Acting & Emotional Range", desc: "Character depth, conviction, realism" },
                    { id: "confidence", label: "Confidence & Presence", desc: "Stage awareness, posture, eye contact" },
                    { id: "improv", label: "Improvisation & Adaptability", desc: "Response to cues, spontaneity" },
                  ].map((metric) => (
                    <div key={metric.id} className="adm-panel p-3.5">
                      <div className="flex justify-between items-center mb-1.5">
                        <div>
                          <label className="text-xs font-semibold text-adm-fg block">
                            {metric.label}
                          </label>
                          <span className="text-[11px] text-adm-fg-3">{metric.desc}</span>
                        </div>
                        <span className="adm-badge adm-badge-accent font-mono">
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
                        className="adm-range mt-1"
                      />
                    </div>
                  ))}
                </div>

                {/* DIRECTOR'S NOTES */}
                <div>
                  <label className="adm-label">Director / Panel Observations</label>
                  <textarea
                    placeholder="e.g. Exceptional vocal range; consider for Main Lead in Street Play..."
                    value={directorNotes}
                    onChange={(e) => setDirectorNotes(e.target.value)}
                    className="adm-input"
                  />
                </div>

                {/* SAVE & STATUS BUTTONS */}
                <div className="space-y-2.5 pt-2 border-t border-adm-line">
                  <button
                    type="button"
                    onClick={() => saveEvaluation()}
                    disabled={isSavingScore}
                    className="adm-btn adm-btn-primary w-full"
                  >
                    {isSavingScore ? "Saving..." : "Commit Evaluation Score"}
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => saveEvaluation("Round 1 Cleared")}
                      className="adm-btn adm-btn-success adm-btn-sm text-xs"
                    >
                      + Pass Round 1
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEvaluation("Shortlisted")}
                      className="adm-btn adm-btn-secondary adm-btn-sm text-xs"
                    >
                      + Shortlist
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEvaluation("rejected")}
                      className="adm-btn adm-btn-danger adm-btn-sm text-xs"
                    >
                      + Reject
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center adm-muted">
                Select an applicant from the queue to start grading
              </div>
            )}
          </div>

          {/* REALTIME RANKED LEADERBOARD (COL 9-12) */}
          <div className="lg:col-span-3 adm-card p-5">
            <div className="border-b border-adm-line pb-3 mb-3">
              <h3 className="adm-h2 flex items-center gap-2">
                <Award size={18} className="text-adm-accent-text" />
                <span>Live Standings</span>
              </h3>
              <p className="adm-muted">Ranked by panel score</p>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {rankedAuditions.length === 0 ? (
                <p className="adm-muted italic py-6 text-center">
                  No applicants scored yet.
                </p>
              ) : (
                rankedAuditions.map((candidate, idx) => {
                  const score = candidate.evaluation?.totalScore ?? candidate.scores?.total ?? 0;
                  const isSelected = candidate.id === selectedCandidateId;
                  return (
                    <div
                      key={candidate.id}
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? "bg-adm-accent/15 border-adm-accent/45 text-adm-fg"
                          : "bg-adm-surface-2 border-adm-line hover:border-adm-line-strong"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                            idx === 0
                              ? "bg-adm-accent text-adm-accent-fg"
                              : "bg-adm-surface text-adm-fg-2 border border-adm-line"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-adm-fg truncate leading-tight">
                            {candidate.name}
                          </p>
                          <p className="text-[11px] text-adm-fg-3">
                            {candidate.status || "Pending"}
                          </p>
                        </div>
                      </div>
                      <span className="adm-badge adm-badge-accent font-mono ml-2 shrink-0">
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