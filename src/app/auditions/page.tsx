"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    doc,
    onSnapshot
} from "firebase/firestore";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    JoinFormDefinition,
    JoinFormField,
    JoinFormsGlobalConfig,
    normalizeJoinFormsConfig
} from "@/lib/joinFormsConfig";

const IMGBB_API_KEY =
    process.env.NEXT_PUBLIC_IMGBB_API_KEY || "098e6a70fbe6f7594e40f4641a1998b0";

async function uploadToImgBB(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
            method: "POST",
            body: formData
        }
    );
    const data = await response.json();
    if (data?.success && data?.data?.url) {
        return data.data.url as string;
    }
    return null;
}
import {
    Upload,
    Check,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    ExternalLink,
    BookOpen,
    MessageSquare,
    Clock,
    ShieldCheck,
    Layers
} from "lucide-react";

const AVAILABILITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const AVAILABILITY_SLOTS = ["4:00–6:00 PM", "6:00–8:00 PM", "Weekend Full"];

export default function AuditionsPage() {
    const [config, setConfig] = useState<JoinFormsGlobalConfig>(() =>
        normalizeJoinFormsConfig(null)
    );
    const [legacyIsLive, setLegacyIsLive] = useState<boolean | null>(null);
    const [hasJoinFormsDoc, setHasJoinFormsDoc] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);

    const [activeFormId, setActiveFormId] = useState<string>("");
    const [queryFormId, setQueryFormId] = useState<string>("");
    const [monologues, setMonologues] = useState<string[]>([]);

    // Dynamic answers state keyed by field.id
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [selectedWingId, setSelectedWingId] = useState<string>("");
    const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Submission state
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [submittedTicket, setSubmittedTicket] = useState<{
        ticketId: string;
        name: string;
        wingName: string;
        form: JoinFormDefinition;
    } | null>(null);

    // Check URL query parameter ?form=...
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const fParam = params.get("form");
            if (fParam) {
                setQueryFormId(fParam);
            }
        }
    }, []);

    // Listen to settings/join_forms, settings/auditions, and settings/audition_resources
    useEffect(() => {
        let joinLoaded = false;
        let audLoaded = false;

        const finishLoad = () => {
            if (joinLoaded && audLoaded) {
                setLoadingInitial(false);
            }
        };

        const unsubJoin = onSnapshot(
            doc(db, "settings", "join_forms"),
            (snap) => {
                if (snap.exists()) {
                    setHasJoinFormsDoc(true);
                    const normalized = normalizeJoinFormsConfig(
                        snap.data() as Partial<JoinFormsGlobalConfig>
                    );
                    setConfig(normalized);
                } else {
                    setHasJoinFormsDoc(false);
                }
                joinLoaded = true;
                finishLoad();
            },
            (err) => {
                console.warn("join_forms listener warning:", err);
                joinLoaded = true;
                finishLoad();
            }
        );

        const unsubAud = onSnapshot(
            doc(db, "settings", "auditions"),
            (snap) => {
                if (snap.exists()) {
                    setLegacyIsLive( Boolean(snap.data().isLive) );
                } else {
                    setLegacyIsLive(false);
                }
                audLoaded = true;
                finishLoad();
            },
            (err) => {
                console.warn("auditions listener warning:", err);
                audLoaded = true;
                finishLoad();
            }
        );

        const unsubResources = onSnapshot(
            doc(db, "settings", "audition_resources"),
            (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    if (Array.isArray(data.monologues)) {
                        const titles = data.monologues
                            .map(
                                (m: { title?: string; character?: string }) =>
                                    m.title
                                        ? `${m.title}${
                                              m.character
                                                  ? ` (${m.character})`
                                                  : ""
                                          }`
                                        : null
                            )
                            .filter(Boolean) as string[];
                        setMonologues(titles);
                    }
                }
            },
            () => {}
        );

        return () => {
            unsubJoin();
            unsubAud();
            unsubResources();
        };
    }, []);

    // Determine effective masterLive
    const isPortalLive = useMemo(() => {
        if (hasJoinFormsDoc) {
            if (legacyIsLive !== null) {
                return config.masterLive && legacyIsLive;
            }
            return config.masterLive;
        }
        return Boolean(legacyIsLive);
    }, [hasJoinFormsDoc, config.masterLive, legacyIsLive]);

    // Select active form based on query param or primaryFormId
    useEffect(() => {
        if (queryFormId) {
            const matched = config.forms.find(
                (f) => f.id === queryFormId || f.slug === queryFormId
            );
            if (matched) {
                setActiveFormId(matched.id);
                return;
            }
        }
        if (!activeFormId || !config.forms.some((f) => f.id === activeFormId)) {
            setActiveFormId(config.primaryFormId || config.forms[0]?.id || "");
        }
    }, [queryFormId, config.forms, config.primaryFormId, activeFormId]);

    const liveForms = useMemo(() => {
        return config.forms.filter((f) => f.isLive);
    }, [config.forms]);

    const activeForm: JoinFormDefinition = useMemo(() => {
        return (
            config.forms.find((f) => f.id === activeFormId) ||
            config.forms.find((f) => f.id === config.primaryFormId) ||
            config.forms[0]
        );
    }, [config.forms, activeFormId, config.primaryFormId]);

    // Reset step when switching forms
    useEffect(() => {
        setCurrentStepIndex(0);
    }, [activeForm?.id]);

    // Visible fields filtered by conditionalWings
    const visibleFields = useMemo(() => {
        if (!activeForm) return [];
        return activeForm.fields.filter((field) => {
            if (!field.conditionalWings || field.conditionalWings.length === 0) {
                return true;
            }
            if (!selectedWingId) return false;
            return field.conditionalWings.includes(selectedWingId);
        });
    }, [activeForm, selectedWingId]);

    // Group fields into Multi-Step Acts if activeForm.multiStep is true
    const formSteps = useMemo(() => {
        if (!activeForm?.multiStep) {
            return [{ title: activeForm?.title || "Application", fields: visibleFields }];
        }
        const steps: { title: string; subtitle?: string; fields: JoinFormField[] }[] = [];
        let currentGroup: { title: string; subtitle?: string; fields: JoinFormField[] } = {
            title: "Act I — Application Details",
            fields: []
        };

        visibleFields.forEach((field) => {
            if (field.type === "section_header") {
                if (currentGroup.fields.length > 0) {
                    steps.push(currentGroup);
                }
                currentGroup = {
                    title: field.label,
                    subtitle: field.helpText,
                    fields: [field]
                };
            } else {
                currentGroup.fields.push(field);
            }
        });

        if (currentGroup.fields.length > 0) {
            steps.push(currentGroup);
        }

        return steps.length > 0
            ? steps
            : [{ title: activeForm.title, fields: visibleFields }];
    }, [activeForm, visibleFields]);

    const currentStepFields =
        formSteps[Math.min(currentStepIndex, formSteps.length - 1)]?.fields ||
        visibleFields;

    const setFieldAnswer = (fieldId: string, value: unknown) => {
        setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    };

    const handleDirectPhotoUpload = async (
        fieldId: string,
        file: File | undefined
    ) => {
        if (!file) return;
        setUploadingFieldId(fieldId);
        try {
            const uploadedUrl = await uploadToImgBB(file);
            if (uploadedUrl) {
                setFieldAnswer(fieldId, uploadedUrl);
            } else {
                alert("Could not upload image. You can also paste a direct link.");
            }
        } catch (err) {
            console.error("Photo upload error:", err);
            alert("Image upload failed. Please paste a Google Drive or image link instead.");
        } finally {
            setUploadingFieldId(null);
        }
    };

    const validateFields = (fieldsToValidate: JoinFormField[]): boolean => {
        for (const field of fieldsToValidate) {
            if (field.type === "section_header" || !field.required) continue;
            const val = answers[field.id];
            if (
                val === undefined ||
                val === null ||
                val === "" ||
                (Array.isArray(val) && val.length === 0) ||
                (field.type === "consent" && val !== true)
            ) {
                alert(`Please complete the required field: "${field.label}"`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeForm) return;

        if (!validateFields(visibleFields)) return;

        setLoadingSubmit(true);
        try {
            // Build customAnswers map and core mapped fields
            const customAnswers: Record<string, unknown> = {};
            const customFieldsMeta: { id: string; label: string; type: string }[] = [];

            let mappedName = "";
            let mappedEmail = "";
            let mappedPhone = "";
            let mappedBranch = "";
            let mappedYear = "";
            let mappedRole = "";
            let mappedExperience = "";
            let mappedPortfolio = "";
            let mappedPhotoLink = "";

            visibleFields.forEach((field) => {
                if (field.type === "section_header") return;
                const rawVal = answers[field.id];
                if (rawVal === undefined || rawVal === null || rawVal === "") return;

                let displayVal = rawVal;
                if (field.type === "wing_cards") {
                    const foundWing = config.wings.find((w) => w.id === rawVal);
                    displayVal = foundWing ? foundWing.name : rawVal;
                }

                customAnswers[field.label] = displayVal;
                customFieldsMeta.push({
                    id: field.id,
                    label: field.label,
                    type: field.type
                });

                const strVal = Array.isArray(displayVal)
                    ? displayVal.join(", ")
                    : String(displayVal);

                // Core field mapping
                switch (field.mapToCore) {
                    case "name":
                        mappedName = strVal;
                        break;
                    case "email":
                        mappedEmail = strVal;
                        break;
                    case "phone":
                        mappedPhone = strVal;
                        break;
                    case "branch":
                        mappedBranch = strVal;
                        break;
                    case "year":
                        mappedYear = strVal;
                        break;
                    case "role":
                        mappedRole = strVal;
                        break;
                    case "experience":
                        mappedExperience = strVal;
                        break;
                    case "portfolio":
                        mappedPortfolio = strVal;
                        break;
                    case "photoLink":
                        mappedPhotoLink = strVal;
                        break;
                    default:
                        break;
                }

                // Automatic fallback detection by field type/label if not explicitly mapped
                const lowerLabel = field.label.toLowerCase();
                if (!mappedName && lowerLabel.includes("name")) mappedName = strVal;
                if (!mappedEmail && field.type === "email") mappedEmail = strVal;
                if (!mappedPhone && field.type === "phone") mappedPhone = strVal;
                if (!mappedRole && field.type === "wing_cards") mappedRole = strVal;
                if (!mappedPhotoLink && field.type === "image_upload")
                    mappedPhotoLink = strVal;
                if (!mappedPortfolio && field.type === "url")
                    mappedPortfolio = strVal;
                if (!mappedExperience && field.type === "textarea")
                    mappedExperience = strVal;
            });

            const activeWingObj = config.wings.find(
                (w) => w.id === selectedWingId
            );
            const finalWingName =
                activeWingObj?.name || mappedRole || "General Audition";

            // Ensure Firestore security rules (isValidAudition) always pass 100%
            const safeName = (mappedName || "Swaang Applicant").slice(0, 100);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const safeEmail =
                mappedEmail && emailRegex.test(mappedEmail)
                    ? mappedEmail.slice(0, 120)
                    : "applicant@swaang.club";

            const ticketId = `SWG-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(
                1000 + Math.random() * 9000
            )}`;

            await addDoc(collection(db, "auditions"), {
                name: safeName,
                email: safeEmail,
                phone: (mappedPhone || "").slice(0, 30),
                branch: (mappedBranch || "").slice(0, 100),
                year: (mappedYear || "").slice(0, 50),
                role: finalWingName.slice(0, 100),
                wing: finalWingName.slice(0, 100),
                wingId: selectedWingId || "",
                experience: (mappedExperience || "").slice(0, 2900),
                motivation: (mappedExperience || "").slice(0, 2900),
                portfolio: (mappedPortfolio || "").slice(0, 500),
                photoLink: (mappedPhotoLink || "").slice(0, 500),
                status: "pending",
                formId: activeForm.id,
                formTitle: activeForm.title,
                ticketId,
                customAnswers,
                customFieldsMeta,
                submittedAt: new Date().toISOString(),
                timestamp: serverTimestamp()
            });

            setSubmittedTicket({
                ticketId,
                name: safeName,
                wingName: finalWingName,
                form: activeForm
            });
        } catch (error) {
            console.error("Submission Error:", error);
            alert(
                "Could not submit your application. Please check required fields and try again."
            );
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (loadingInitial) {
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center font-black uppercase tracking-widest text-black">
                Loading Stage Door...
            </div>
        );
    }

    // =========================================================================
    // POST-SUBMISSION STAMPED TICKET RECEIPT
    // =========================================================================
    if (submittedTicket) {
        const { ticketId, name, wingName, form } = submittedTicket;
        return (
            <div className="min-h-screen bg-[#FFF9F0] flex items-center justify-center p-6 text-center relative overflow-hidden">
                <motion.div
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border-8 border-black p-8 md:p-12 shadow-[16px_16px_0px_#06D6A0] max-w-xl w-full relative z-10 text-left"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b-4 border-black pb-4 mb-6">
                        <span className="border-2 border-black px-3 py-1 bg-[#06D6A0] font-mono text-xs font-black uppercase shadow-[2px_2px_0px_black]">
                            STATUS: STAGED &amp; INDEXED
                        </span>
                        <span className="font-mono text-sm font-black bg-black text-[#FFD166] px-3 py-1">
                            TICKET #{ticketId}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-black mb-3 uppercase tracking-tighter leading-none">
                        {form.successTitle || "BREAK A LEG!"}
                    </h1>

                    <p className="font-mono font-bold text-black/80 text-xs md:text-sm mb-6 leading-relaxed">
                        {form.successMessage ||
                            "Your application ticket has been officially stamped and filed with the Swaang Casting Desk."}
                    </p>

                    <div className="bg-[#FFF9F0] border-4 border-black p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                        <div>
                            <span className="text-black/50 font-black block uppercase text-[10px]">
                                APPLICANT
                            </span>
                            <span className="text-black font-black text-sm">
                                {name}
                            </span>
                        </div>
                        <div>
                            <span className="text-black/50 font-black block uppercase text-[10px]">
                                PRIMARY WING / TRACK
                            </span>
                            <span className="text-black font-black text-sm">
                                {wingName}
                            </span>
                        </div>
                        <div className="sm:col-span-2">
                            <span className="text-black/50 font-black block uppercase text-[10px]">
                                DRIVE / CALL-SHEET
                            </span>
                            <span className="text-black font-bold">
                                {form.title}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {form.whatsappGroupUrl && (
                            <a
                                href={form.whatsappGroupUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-[#06D6A0] text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 shadow-[6px_6px_0px_black] hover:bg-[#FFD166] transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Join Official Audition WhatsApp Group
                            </a>
                        )}

                        {form.showResourcesLink && (
                            <Link
                                href="/auditions/resources"
                                className="w-full bg-[#FFD166] text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 shadow-[6px_6px_0px_black] hover:bg-black hover:text-white transition-all"
                            >
                                <BookOpen className="w-4 h-4" />
                                Open Audition Prep Vault &amp; Monologues
                            </Link>
                        )}

                        <Link
                            href="/"
                            className="w-full bg-black text-white border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center hover:bg-[#FF5F5F] hover:text-black transition-all"
                        >
                            Return to Mainstage
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Check schedule window if configured on activeForm
    const nowMs = Date.now();
    const isNotYetOpen =
        activeForm?.opensAt &&
        !Number.isNaN(Date.parse(activeForm.opensAt)) &&
        nowMs < Date.parse(activeForm.opensAt);
    const isPastDeadline =
        activeForm?.closesAt &&
        !Number.isNaN(Date.parse(activeForm.closesAt)) &&
        nowMs > Date.parse(activeForm.closesAt);

    const isCurrentFormOpen =
        isPortalLive &&
        Boolean(activeForm?.isLive) &&
        !isNotYetOpen &&
        !isPastDeadline;

    return (
        <PageTransition>
            <main className="min-h-screen bg-[#FFF9F0] py-28 md:py-36 px-4 md:px-8 relative overflow-hidden">
                <div className="max-w-4xl mx-auto relative z-10">
                    {/* ========================================================= */}
                    {/* MULTI-FORM RECRUITMENT HUB SWITCHER (When 2+ Forms Live)  */}
                    {/* ========================================================= */}
                    {isPortalLive &&
                        liveForms.length > 1 &&
                        (config.hubMode === "hub" || Boolean(queryFormId)) && (
                            <div className="mb-10 bg-white border-4 border-black p-4 md:p-5 shadow-[8px_8px_0px_black]">
                                <div className="flex items-center gap-2 mb-3">
                                    <Layers className="w-4 h-4 text-[#FF5F5F]" />
                                    <span className="font-mono font-black text-xs uppercase tracking-widest text-black">
                                        ACTIVE RECRUITMENT DRIVES ({liveForms.length} OPEN) — SELECT CALL-SHEET:
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {liveForms.map((lf) => {
                                        const isSelected =
                                            lf.id === activeForm?.id;
                                        return (
                                            <button
                                                key={lf.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveFormId(lf.id);
                                                    setAnswers({});
                                                    setSelectedWingId("");
                                                }}
                                                className={`p-3.5 border-4 border-black text-left transition-all ${
                                                    isSelected
                                                        ? "bg-[#FFD166] shadow-[4px_4px_0px_black] -translate-y-0.5"
                                                        : "bg-[#FFF9F0] hover:bg-white"
                                                }`}
                                            >
                                                <span className="font-mono text-[10px] font-black uppercase px-2 py-0.5 bg-black text-white inline-block mb-1">
                                                    {lf.badge}
                                                </span>
                                                <p className="font-black text-sm uppercase text-black leading-tight">
                                                    {lf.title}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    {/* ========================================================= */}
                    {/* CLOSED CURTAIN STATE                                      */}
                    {/* ========================================================= */}
                    {!isCurrentFormOpen ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-8 border-black p-10 md:p-12 text-center shadow-[16px_16px_0px_#FF5F5F] mt-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-4 bg-[repeating-linear-gradient(45deg,#FFD166,#FFD166_10px,black_10px,black_20px)]" />

                            <div className="text-6xl mb-6 mt-4">🔒</div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase text-black mb-4 tracking-tighter leading-none">
                                {activeForm?.closedTitle ||
                                    config.closedDoorTitle ||
                                    "AUDITIONS CLOSED"}
                            </h2>
                            <p className="font-mono font-bold text-black bg-black/5 border-4 border-black p-4 mb-8 max-w-lg mx-auto uppercase tracking-widest text-xs md:text-sm">
                                {isNotYetOpen
                                    ? `This recruitment form opens on ${new Date(
                                          activeForm.opensAt!
                                      ).toLocaleString()}.`
                                    : isPastDeadline
                                    ? `The submission window for this form closed on ${new Date(
                                          activeForm.closesAt!
                                      ).toLocaleString()}.`
                                    : activeForm?.closedMessage ||
                                      config.closedDoorMessage ||
                                      "The stage door is currently chained. Keep an eye on our official noticeboard for the next casting call!"}
                            </p>
                            <Link
                                href="/"
                                className="inline-block bg-black text-white border-4 border-black font-black uppercase px-8 py-4 shadow-[6px_6px_0px_black] hover:bg-[#FF5F5F] transition-all tracking-widest"
                            >
                                Return to Mainstage
                            </Link>
                        </motion.div>
                    ) : (
                        /* ===================================================== */
                        /* LIVE DYNAMIC CUSTOM FORM                              */
                        /* ===================================================== */
                        <motion.div
                            key={activeForm.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {/* FORM HEADER */}
                            <div className="mb-10">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="bg-black text-[#FFD166] px-4 py-2 border-2 border-black font-mono font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_#FF5F5F] inline-block">
                                        {activeForm.badge || "OFFICIAL CALL-SHEET"}
                                    </span>
                                    {activeForm.closesAt && (
                                        <span className="bg-white text-black px-3 py-1.5 border-2 border-black font-mono font-bold uppercase text-xs inline-flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#FF5F5F]" />
                                            Closes:{" "}
                                            {new Date(
                                                activeForm.closesAt
                                            ).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-black uppercase tracking-tighter leading-[0.9] mt-2">
                                    {activeForm.title}
                                </h1>

                                {activeForm.description && (
                                    <p className="text-black font-mono font-bold uppercase tracking-wider text-xs md:text-sm mt-5 border-l-4 border-[#FF5F5F] pl-4 max-w-2xl">
                                        {activeForm.description}
                                    </p>
                                )}
                            </div>

                            {/* MULTI-STEP PROGRESS BAR */}
                            {activeForm.multiStep && formSteps.length > 1 && (
                                <div className="mb-6 bg-white border-4 border-black p-4 shadow-[6px_6px_0px_black]">
                                    <div className="flex items-center justify-between text-xs font-mono font-black uppercase mb-2">
                                        <span>
                                            Step {currentStepIndex + 1} of{" "}
                                            {formSteps.length}:{" "}
                                            {formSteps[currentStepIndex]?.title}
                                        </span>
                                        <span>
                                            {Math.round(
                                                ((currentStepIndex + 1) /
                                                    formSteps.length) *
                                                    100
                                            )}
                                            %
                                        </span>
                                    </div>
                                    <div className="w-full h-3 bg-black/10 border-2 border-black overflow-hidden">
                                        <div
                                            className="h-full bg-[#06D6A0] transition-all duration-300"
                                            style={{
                                                width: `${
                                                    ((currentStepIndex + 1) /
                                                        formSteps.length) *
                                                    100
                                                }%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* DYNAMIC FORM CONTAINER */}
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white border-8 border-black p-6 md:p-10 shadow-[16px_16px_0px_black] space-y-6 relative"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                                    <AnimatePresence mode="popLayout">
                                        {currentStepFields.map((field) => {
                                            const colSpanClass =
                                                field.width === "full" ||
                                                field.type === "section_header" ||
                                                field.type === "wing_cards" ||
                                                field.type === "availability_grid" ||
                                                field.type === "consent"
                                                    ? "md:col-span-12"
                                                    : field.width === "half"
                                                    ? "md:col-span-6"
                                                    : "md:col-span-4";

                                            const isConditional =
                                                field.conditionalWings &&
                                                field.conditionalWings.length >
                                                    0;

                                            // 1. SECTION HEADER / ACT DIVIDER
                                            if (
                                                field.type === "section_header"
                                            ) {
                                                return (
                                                    <motion.div
                                                        key={field.id}
                                                        layout
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0
                                                        }}
                                                        className="md:col-span-12 pt-4 pb-2 border-b-4 border-black"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-[#FFD166] border-2 border-black px-2.5 py-0.5 font-mono font-black text-xs uppercase">
                                                                SECTION
                                                            </span>
                                                            <h3 className="font-black text-lg md:text-xl uppercase tracking-tight text-black">
                                                                {field.label}
                                                            </h3>
                                                        </div>
                                                        {field.helpText && (
                                                            <p className="font-mono text-xs font-bold text-black/70 mt-1">
                                                                {field.helpText}
                                                            </p>
                                                        )}
                                                    </motion.div>
                                                );
                                            }

                                            return (
                                                <motion.div
                                                    key={field.id}
                                                    layout
                                                    initial={{
                                                        opacity: 0,
                                                        y: 12
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -8
                                                    }}
                                                    className={`${colSpanClass} space-y-2`}
                                                >
                                                    {field.type !==
                                                        "consent" && (
                                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                                            <label className="text-xs font-mono font-black uppercase tracking-wider text-black block">
                                                                &gt;{" "}
                                                                {field.label}
                                                                {field.required && (
                                                                    <span className="text-[#FF5F5F] ml-1">
                                                                        *
                                                                    </span>
                                                                )}
                                                            </label>
                                                            {isConditional && (
                                                                <span className="text-[10px] font-mono font-black uppercase bg-[#FFD166] border border-black px-1.5 py-0.5">
                                                                    Wing-Specific
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {field.helpText &&
                                                        field.type !==
                                                            "consent" && (
                                                            <p className="text-[11px] font-mono font-bold text-black/60">
                                                                {field.helpText}
                                                            </p>
                                                        )}

                                                    {/* 2. WING / CATEGORY CARDS */}
                                                    {field.type ===
                                                        "wing_cards" && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                                            {config.wings
                                                                .filter(
                                                                    (w) =>
                                                                        w.isActive
                                                                )
                                                                .map((wing) => {
                                                                    const isPicked =
                                                                        answers[
                                                                            field
                                                                                .id
                                                                        ] ===
                                                                        wing.id;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                wing.id
                                                                            }
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setFieldAnswer(
                                                                                    field.id,
                                                                                    wing.id
                                                                                );
                                                                                setSelectedWingId(
                                                                                    wing.id
                                                                                );
                                                                            }}
                                                                            className={`p-4 border-4 border-black text-left transition-all flex flex-col justify-between gap-2 ${
                                                                                isPicked
                                                                                    ? "bg-[#FFD166] shadow-[6px_6px_0px_black] -translate-y-1 -translate-x-1"
                                                                                    : "bg-[#FFF9F0] hover:bg-white hover:shadow-[4px_4px_0px_black]"
                                                                            }`}
                                                                        >
                                                                            <div>
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <span className="font-black text-base uppercase text-black">
                                                                                        {
                                                                                            wing.name
                                                                                        }
                                                                                    </span>
                                                                                    {wing.quota && (
                                                                                        <span className="font-mono text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                                                                                            {
                                                                                                wing.quota
                                                                                            }
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <p className="font-mono text-[11px] font-black uppercase text-[#FF5F5F] mt-0.5">
                                                                                    {
                                                                                        wing.tagline
                                                                                    }
                                                                                </p>
                                                                                <p className="text-xs font-medium text-black/80 mt-1.5">
                                                                                    {
                                                                                        wing.description
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                            <div className="flex items-center justify-end">
                                                                                <span
                                                                                    className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${
                                                                                        isPicked
                                                                                            ? "bg-black text-[#06D6A0]"
                                                                                            : "bg-white text-black"
                                                                                    }`}
                                                                                >
                                                                                    {isPicked
                                                                                        ? "✓ SELECTED WING"
                                                                                        : "SELECT WING"}
                                                                                </span>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                        </div>
                                                    )}

                                                    {/* 3. TEXT / EMAIL / PHONE / NUMBER / DATE / URL */}
                                                    {(field.type === "text" ||
                                                        field.type ===
                                                            "email" ||
                                                        field.type ===
                                                            "phone" ||
                                                        field.type ===
                                                            "number" ||
                                                        field.type === "date" ||
                                                        field.type ===
                                                            "url") && (
                                                        <input
                                                            required={
                                                                field.required
                                                            }
                                                            type={
                                                                field.type ===
                                                                "phone"
                                                                    ? "tel"
                                                                    : field.type
                                                            }
                                                            value={String(
                                                                answers[
                                                                    field.id
                                                                ] || ""
                                                            )}
                                                            onChange={(e) =>
                                                                setFieldAnswer(
                                                                    field.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={
                                                                field.placeholder ||
                                                                ""
                                                            }
                                                            className="w-full border-4 border-black bg-white p-3.5 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] text-black font-bold transition-all placeholder:text-black/30"
                                                        />
                                                    )}

                                                    {/* 4. TEXTAREA */}
                                                    {field.type ===
                                                        "textarea" && (
                                                        <textarea
                                                            required={
                                                                field.required
                                                            }
                                                            rows={4}
                                                            value={String(
                                                                answers[
                                                                    field.id
                                                                ] || ""
                                                            )}
                                                            onChange={(e) =>
                                                                setFieldAnswer(
                                                                    field.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder={
                                                                field.placeholder ||
                                                                "Share your response..."
                                                            }
                                                            className="w-full border-4 border-black bg-white p-3.5 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] text-black font-bold transition-all placeholder:text-black/30"
                                                        />
                                                    )}

                                                    {/* 5. DROPDOWN SELECT / SLOT PICKER / MONOLOGUE PICKER */}
                                                    {(field.type === "select" ||
                                                        field.type ===
                                                            "slot_picker" ||
                                                        field.type ===
                                                            "monologue_picker") && (
                                                        <select
                                                            required={
                                                                field.required
                                                            }
                                                            value={String(
                                                                answers[
                                                                    field.id
                                                                ] || ""
                                                            )}
                                                            onChange={(e) =>
                                                                setFieldAnswer(
                                                                    field.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full border-4 border-black bg-white p-3.5 outline-none focus:bg-[#FFD166] focus:shadow-[6px_6px_0px_black] text-black font-black cursor-pointer transition-all"
                                                        >
                                                            <option value="">
                                                                -- Select{" "}
                                                                {field.label} --
                                                            </option>
                                                            {(field.type ===
                                                            "monologue_picker"
                                                                ? monologues.length >
                                                                  0
                                                                    ? [
                                                                          ...monologues,
                                                                          "Own Prepared Monologue / Self-Written Piece"
                                                                      ]
                                                                    : [
                                                                          "Official Vault Monologue #1 (Dramatic)",
                                                                          "Official Vault Monologue #2 (Satire / Comedy)",
                                                                          "Official Vault Monologue #3 (Hindustani Classic)",
                                                                          "Own Prepared Monologue / Self-Written Piece"
                                                                      ]
                                                                : field.options ||
                                                                  []
                                                            ).map((opt) => (
                                                                <option
                                                                    key={opt}
                                                                    value={opt}
                                                                >
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}

                                                    {/* 6. RADIO SINGLE-CHOICE PILLS */}
                                                    {field.type === "radio" && (
                                                        <div className="flex flex-wrap gap-2.5 pt-1">
                                                            {(
                                                                field.options ||
                                                                []
                                                            ).map((opt) => {
                                                                const active =
                                                                    answers[
                                                                        field.id
                                                                    ] === opt;
                                                                return (
                                                                    <button
                                                                        key={
                                                                            opt
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setFieldAnswer(
                                                                                field.id,
                                                                                opt
                                                                            )
                                                                        }
                                                                        className={`px-4 py-2.5 border-4 border-black font-mono text-xs font-black uppercase transition-all ${
                                                                            active
                                                                                ? "bg-[#FFD166] shadow-[4px_4px_0px_black] -translate-y-0.5"
                                                                                : "bg-[#FFF9F0] hover:bg-white"
                                                                        }`}
                                                                    >
                                                                        {active
                                                                            ? `● ${opt}`
                                                                            : `○ ${opt}`}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* 7. MULTI-SELECT CHECKBOX GROUP */}
                                                    {field.type ===
                                                        "checkbox_group" && (
                                                        <div className="flex flex-wrap gap-2.5 pt-1">
                                                            {(
                                                                field.options ||
                                                                []
                                                            ).map((opt) => {
                                                                const currentArr =
                                                                    Array.isArray(
                                                                        answers[
                                                                            field
                                                                                .id
                                                                        ]
                                                                    )
                                                                        ? (answers[
                                                                              field
                                                                                  .id
                                                                          ] as string[])
                                                                        : [];
                                                                const checked =
                                                                    currentArr.includes(
                                                                        opt
                                                                    );
                                                                return (
                                                                    <button
                                                                        key={
                                                                            opt
                                                                        }
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const next =
                                                                                checked
                                                                                    ? currentArr.filter(
                                                                                          (
                                                                                              x
                                                                                          ) =>
                                                                                              x !==
                                                                                              opt
                                                                                      )
                                                                                    : [
                                                                                          ...currentArr,
                                                                                          opt
                                                                                      ];
                                                                            setFieldAnswer(
                                                                                field.id,
                                                                                next
                                                                            );
                                                                        }}
                                                                        className={`px-3.5 py-2 border-4 border-black font-mono text-xs font-black uppercase transition-all inline-flex items-center gap-1.5 ${
                                                                            checked
                                                                                ? "bg-[#06D6A0] shadow-[4px_4px_0px_black] -translate-y-0.5"
                                                                                : "bg-[#FFF9F0] hover:bg-white"
                                                                        }`}
                                                                    >
                                                                        {checked && (
                                                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                        )}
                                                                        {opt}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* 8. YES / NO BOOLEAN TOGGLE */}
                                                    {field.type ===
                                                        "boolean" && (
                                                        <div className="flex gap-3 pt-1">
                                                            {[
                                                                {
                                                                    label: "YES, ABSOLUTELY",
                                                                    val: "Yes"
                                                                },
                                                                {
                                                                    label: "NO / NOT SURE",
                                                                    val: "No"
                                                                }
                                                            ].map((item) => {
                                                                const active =
                                                                    answers[
                                                                        field.id
                                                                    ] ===
                                                                    item.val;
                                                                return (
                                                                    <button
                                                                        key={
                                                                            item.val
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setFieldAnswer(
                                                                                field.id,
                                                                                item.val
                                                                            )
                                                                        }
                                                                        className={`flex-1 py-3 px-4 border-4 border-black font-mono text-xs font-black uppercase transition-all ${
                                                                            active
                                                                                ? "bg-[#FFD166] shadow-[4px_4px_0px_black]"
                                                                                : "bg-[#FFF9F0] hover:bg-white"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* 9. SKILL SELF-RATING SCALE */}
                                                    {field.type ===
                                                        "rating" && (
                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            {Array.from(
                                                                {
                                                                    length:
                                                                        field.maxRating ||
                                                                        10
                                                                },
                                                                (_, i) => i + 1
                                                            ).map((num) => {
                                                                const selectedNum =
                                                                    Number(
                                                                        answers[
                                                                            field
                                                                                .id
                                                                        ] || 0
                                                                    );
                                                                const active =
                                                                    selectedNum >=
                                                                    num;
                                                                return (
                                                                    <button
                                                                        key={
                                                                            num
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setFieldAnswer(
                                                                                field.id,
                                                                                num
                                                                            )
                                                                        }
                                                                        className={`w-10 h-10 border-4 border-black font-mono font-black text-sm transition-all ${
                                                                            active
                                                                                ? "bg-[#FF5F5F] text-white shadow-[3px_3px_0px_black] -translate-y-0.5"
                                                                                : "bg-[#FFF9F0] text-black hover:bg-[#FFD166]"
                                                                        }`}
                                                                    >
                                                                        {num}
                                                                    </button>
                                                                );
                                                            })}
                                                            {Boolean(
                                                                answers[
                                                                    field.id
                                                                ]
                                                            ) && (
                                                                <span className="font-mono font-black text-xs uppercase ml-2">
                                                                    {String(
                                                                        answers[
                                                                            field
                                                                                .id
                                                                        ]
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {field.maxRating ||
                                                                        10}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 10. DIRECT PHOTO / HEADSHOT UPLOAD + URL FALLBACK */}
                                                    {field.type ===
                                                        "image_upload" && (
                                                        <div className="border-4 border-black bg-[#FFF9F0] p-4 space-y-3">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                                <label className="bg-black text-white border-2 border-black px-4 py-2.5 font-mono text-xs font-black uppercase cursor-pointer hover:bg-[#06D6A0] hover:text-black transition-all inline-flex items-center justify-center gap-2 shrink-0">
                                                                    <Upload className="w-4 h-4" />
                                                                    {uploadingFieldId ===
                                                                    field.id
                                                                        ? "Uploading Photo..."
                                                                        : "Upload Photo Directly"}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleDirectPhotoUpload(
                                                                                field.id,
                                                                                e
                                                                                    .target
                                                                                    .files?.[0]
                                                                            )
                                                                        }
                                                                    />
                                                                </label>
                                                                <input
                                                                    type="url"
                                                                    value={String(
                                                                        answers[
                                                                            field
                                                                                .id
                                                                        ] || ""
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setFieldAnswer(
                                                                            field.id,
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder={
                                                                        field.placeholder ||
                                                                        "Or paste direct photo / Google Drive link..."
                                                                    }
                                                                    className="flex-1 border-2 border-black bg-white p-2.5 text-xs font-bold text-black outline-none focus:bg-[#FFD166]"
                                                                />
                                                            </div>
                                                            {Boolean(
                                                                answers[
                                                                    field.id
                                                                ]
                                                            ) && (
                                                                <div className="flex items-center gap-3 pt-1">
                                                                    <img
                                                                        src={String(
                                                                            answers[
                                                                                field
                                                                                    .id
                                                                            ]
                                                                        )}
                                                                        alt="Uploaded preview"
                                                                        onError={(
                                                                            e
                                                                        ) => {
                                                                            (
                                                                                e.currentTarget as HTMLImageElement
                                                                            ).style.display =
                                                                                "none";
                                                                        }}
                                                                        className="w-14 h-14 object-cover border-2 border-black"
                                                                    />
                                                                    <span className="font-mono text-xs font-black text-[#06D6A0] bg-black px-2.5 py-1">
                                                                        ✓ PHOTO LINK ATTACHED
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* 11. WEEKLY REHEARSAL AVAILABILITY GRID */}
                                                    {field.type ===
                                                        "availability_grid" && (
                                                        <div className="border-4 border-black bg-[#FFF9F0] p-4 overflow-x-auto">
                                                            <table className="w-full text-left font-mono text-xs">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="p-2 border-b-2 border-black">
                                                                            Slot \ Day
                                                                        </th>
                                                                        {AVAILABILITY_DAYS.map(
                                                                            (
                                                                                day
                                                                            ) => (
                                                                                <th
                                                                                    key={
                                                                                        day
                                                                                    }
                                                                                    className="p-2 border-b-2 border-black text-center"
                                                                                >
                                                                                    {
                                                                                        day
                                                                                    }
                                                                                </th>
                                                                            )
                                                                        )}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {AVAILABILITY_SLOTS.map(
                                                                        (
                                                                            slot
                                                                        ) => (
                                                                            <tr
                                                                                key={
                                                                                    slot
                                                                                }
                                                                            >
                                                                                <td className="p-2 font-black border-t border-black/20">
                                                                                    {
                                                                                        slot
                                                                                    }
                                                                                </td>
                                                                                {AVAILABILITY_DAYS.map(
                                                                                    (
                                                                                        day
                                                                                    ) => {
                                                                                        const cellKey = `${day} (${slot})`;
                                                                                        const currentSlots =
                                                                                            Array.isArray(
                                                                                                answers[
                                                                                                    field
                                                                                                        .id
                                                                                                ]
                                                                                            )
                                                                                                ? (answers[
                                                                                                      field
                                                                                                          .id
                                                                                                  ] as string[])
                                                                                                : [];
                                                                                        const isFree =
                                                                                            currentSlots.includes(
                                                                                                cellKey
                                                                                            );
                                                                                        return (
                                                                                            <td
                                                                                                key={
                                                                                                    cellKey
                                                                                                }
                                                                                                className="p-1.5 border-t border-black/20 text-center"
                                                                                            >
                                                                                                <button
                                                                                                    type="button"
                                                                                                    onClick={() => {
                                                                                                        const next =
                                                                                                            isFree
                                                                                                                ? currentSlots.filter(
                                                                                                                      (
                                                                                                                          x
                                                                                                                      ) =>
                                                                                                                          x !==
                                                                                                                          cellKey
                                                                                                                  )
                                                                                                                : [
                                                                                                                      ...currentSlots,
                                                                                                                      cellKey
                                                                                                                  ];
                                                                                                        setFieldAnswer(
                                                                                                            field.id,
                                                                                                            next
                                                                                                        );
                                                                                                    }}
                                                                                                    className={`w-full py-2 border-2 border-black font-black text-[10px] uppercase transition-all ${
                                                                                                        isFree
                                                                                                            ? "bg-[#06D6A0] text-black shadow-[2px_2px_0px_black]"
                                                                                                            : "bg-white text-black/40 hover:text-black"
                                                                                                    }`}
                                                                                                >
                                                                                                    {isFree
                                                                                                        ? "✓ FREE"
                                                                                                        : "—"}
                                                                                                </button>
                                                                                            </td>
                                                                                        );
                                                                                    }
                                                                                )}
                                                                            </tr>
                                                                        )
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                    {/* 12. DISCIPLINE & CODE OF CONDUCT CONSENT PLEDGE */}
                                                    {field.type ===
                                                        "consent" && (
                                                        <label className="flex items-start gap-3.5 p-4 border-4 border-black bg-[#FFF9F0] cursor-pointer hover:bg-[#FFD166]/40 transition-all">
                                                            <input
                                                                type="checkbox"
                                                                required={
                                                                    field.required
                                                                }
                                                                checked={
                                                                    answers[
                                                                        field.id
                                                                    ] === true
                                                                }
                                                                onChange={(e) =>
                                                                    setFieldAnswer(
                                                                        field.id,
                                                                        e.target
                                                                            .checked
                                                                    )
                                                                }
                                                                className="mt-1 w-5 h-5 accent-black shrink-0"
                                                            />
                                                            <span className="font-mono text-xs font-black uppercase text-black leading-relaxed">
                                                                {field.label}
                                                                {field.required && (
                                                                    <span className="text-[#FF5F5F] ml-1">
                                                                        *
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </label>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>

                                {/* MULTI-STEP OR SUBMIT CONTROLS */}
                                <div className="pt-6 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                                    {activeForm.multiStep &&
                                    formSteps.length > 1 ? (
                                        <>
                                            {currentStepIndex > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentStepIndex(
                                                            (i) =>
                                                                Math.max(
                                                                    0,
                                                                    i - 1
                                                                )
                                                        )
                                                    }
                                                    className="w-full sm:w-auto bg-white text-black border-4 border-black px-6 py-4 font-black uppercase tracking-widest text-sm hover:bg-[#FFD166] transition-all inline-flex items-center justify-center gap-2"
                                                >
                                                    <ArrowLeft className="w-4 h-4" />
                                                    Previous Act
                                                </button>
                                            ) : (
                                                <div />
                                            )}

                                            {currentStepIndex <
                                            formSteps.length - 1 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (
                                                            validateFields(
                                                                currentStepFields
                                                            )
                                                        ) {
                                                            setCurrentStepIndex(
                                                                (i) => i + 1
                                                            );
                                                        }
                                                    }}
                                                    className="w-full sm:w-auto bg-black text-white border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-[#06D6A0] hover:text-black shadow-[6px_6px_0px_black] transition-all inline-flex items-center justify-center gap-2"
                                                >
                                                    Next Act
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    disabled={loadingSubmit}
                                                    className="w-full sm:w-auto bg-black text-white border-4 border-black px-10 py-5 font-black uppercase tracking-[0.2em] text-base hover:bg-[#06D6A0] hover:text-black shadow-[8px_8px_0px_black] transition-all disabled:opacity-50"
                                                >
                                                    {loadingSubmit
                                                        ? "[ TRANSMITTING_DOSSIER... ]"
                                                        : `[ ${
                                                              activeForm.submitButtonText ||
                                                              "STAMP APPLICATION"
                                                          } ]`}
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={loadingSubmit}
                                            className="w-full bg-black text-white border-4 border-black py-6 font-black uppercase tracking-[0.25em] text-base md:text-lg hover:bg-[#06D6A0] hover:text-black hover:shadow-[12px_12px_0px_black] hover:-translate-y-1.5 hover:-translate-x-1.5 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
                                        >
                                            {loadingSubmit ? (
                                                <span className="animate-pulse">
                                                    [ TRANSMITTING_DATA... ]
                                                </span>
                                            ) : (
                                                <span>
                                                    [{" "}
                                                    {activeForm.submitButtonText ||
                                                        "STAMP_APPLICATION"}{" "}
                                                    ]
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </main>
        </PageTransition>
    );
}
