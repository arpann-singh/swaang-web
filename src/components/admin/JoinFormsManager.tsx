"use client";

import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";
import {
    FIELD_TYPE_CATALOG,
    FORM_TEMPLATES,
    DEFAULT_WINGS,
    JoinFieldType,
    JoinFormDefinition,
    JoinFormField,
    JoinFormsGlobalConfig,
    WingCategory,
    CoreFieldMapping,
    normalizeJoinFormsConfig
} from "@/lib/joinFormsConfig";
import {
    Rocket,
    Sliders,
    Layers,
    FileSpreadsheet,
    Plus,
    Trash2,
    Copy,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    Eye,
    Smartphone,
    Monitor,
    ExternalLink,
    Sparkles,
    Save,
    Share2,
    Search,
    Download,
    Filter,
    MessageSquare,
    GitBranch,
    LayoutGrid,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    Theater,
    Megaphone,
    Feather,
    Music,
    Palette,
    Camera,
    Calendar,
    Clock,
    ShieldCheck,
    HelpCircle
} from "lucide-react";

async function logAdminAction(action: string, details: string) {
    try {
        const user = auth.currentUser;
        await addDoc(collection(db, "admin_logs"), {
            action,
            details,
            userEmail: user?.email || "admin@swaang.club",
            userName: user?.displayName || user?.email?.split("@")[0] || "Admin",
            timestamp: serverTimestamp(),
            createdAt: new Date().toISOString()
        });
    } catch {
        // Non-blocking audit log
    }
}

export type JoinFormsSubTab = "launchpad" | "builder" | "wings" | "responses";

export interface AuditionSubmissionRecord {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    branch?: string;
    year?: string;
    role?: string;
    wing?: string;
    wingId?: string;
    experience?: string;
    portfolio?: string;
    photoLink?: string;
    motivation?: string;
    status?: string;
    formId?: string;
    formTitle?: string;
    ticketId?: string;
    submittedAt?: string;
    customAnswers?: Record<string, unknown>;
    customFieldsMeta?: { id: string; label: string; type: string }[];
}

interface JoinFormsManagerProps {
    initialSubTab?: JoinFormsSubTab;
    auditions: AuditionSubmissionRecord[];
    onNavigateTab?: (tabId: string) => void;
}

const WING_COLORS: { id: WingCategory["color"]; label: string; badgeClass: string; dotClass: string }[] = [
    { id: "crimson", label: "Stage Crimson", badgeClass: "adm-badge-crimson", dotClass: "bg-rose-500" },
    { id: "gold", label: "Spotlight Gold", badgeClass: "adm-badge-gold", dotClass: "bg-amber-400" },
    { id: "emerald", label: "Cue Emerald", badgeClass: "adm-badge-emerald", dotClass: "bg-emerald-500" },
    { id: "sky", label: "Console Sky", badgeClass: "adm-badge-sky", dotClass: "bg-sky-500" },
    { id: "violet", label: "Dramaturgy Violet", badgeClass: "adm-badge-violet", dotClass: "bg-violet-500" },
    { id: "amber", label: "Warm Amber", badgeClass: "adm-badge-gold", dotClass: "bg-orange-400" },
    { id: "rose", label: "Velvet Rose", badgeClass: "adm-badge-crimson", dotClass: "bg-pink-500" }
];

const CORE_MAPPINGS: { value: CoreFieldMapping; label: string }[] = [
    { value: "none", label: "Custom Field Only (Stored in Custom Answers)" },
    { value: "name", label: "Applicant Full Name (Core)" },
    { value: "email", label: "Applicant Email (Core)" },
    { value: "phone", label: "WhatsApp / Phone Number (Core)" },
    { value: "branch", label: "Academic Branch / Dept (Core)" },
    { value: "year", label: "Academic Year (Core)" },
    { value: "role", label: "Primary Wing / Role (Core)" },
    { value: "experience", label: "Experience / Motivation Essay (Core)" },
    { value: "portfolio", label: "Portfolio / Work Sample URL (Core)" },
    { value: "photoLink", label: "Applicant Headshot Photo URL (Core)" }
];

export default function JoinFormsManager({
    initialSubTab = "launchpad",
    auditions,
    onNavigateTab
}: JoinFormsManagerProps) {
    const [subTab, setSubTab] = useState<JoinFormsSubTab>(initialSubTab);
    const [config, setConfig] = useState<JoinFormsGlobalConfig>(() =>
        normalizeJoinFormsConfig(null)
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusNotice, setStatusNotice] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const toast = useMemo(
        () => ({
            success: (text: string) => {
                setStatusNotice({ type: "success", text });
                setTimeout(() => setStatusNotice(null), 4000);
            },
            error: (text: string) => {
                setStatusNotice({ type: "error", text });
                setTimeout(() => setStatusNotice(null), 5000);
            }
        }),
        []
    );

    // Builder state
    const [selectedFormId, setSelectedFormId] = useState<string>("swaang-annual-auditions");
    const [expandedFieldId, setExpandedFieldId] = useState<string | null>(null);
    const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [previewSelectedWing, setPreviewSelectedWing] = useState<string>("");

    // Responses state
    const [responseFormFilter, setResponseFormFilter] = useState<string>("all");
    const [responseWingFilter, setResponseWingFilter] = useState<string>("all");
    const [responseStatusFilter, setResponseStatusFilter] = useState<string>("all");
    const [responseSearch, setResponseSearch] = useState<string>("");
    const [selectedSubmission, setSelectedSubmission] = useState<AuditionSubmissionRecord | null>(null);

    useEffect(() => {
        setSubTab(initialSubTab);
    }, [initialSubTab]);

    useEffect(() => {
        let mounted = true;
        const loadConfig = async () => {
            try {
                const [joinSnap, audSnap] = await Promise.all([
                    getDoc(doc(db, "settings", "join_forms")),
                    getDoc(doc(db, "settings", "auditions"))
                ]);

                if (!mounted) return;

                if (joinSnap.exists()) {
                    const normalized = normalizeJoinFormsConfig(
                        joinSnap.data() as Partial<JoinFormsGlobalConfig>
                    );
                    setConfig(normalized);
                    setSelectedFormId(normalized.primaryFormId || normalized.forms[0]?.id);
                } else {
                    const fallback = normalizeJoinFormsConfig(null);
                    if (audSnap.exists()) {
                        const audData = audSnap.data();
                        if (typeof audData.isLive === "boolean") {
                            fallback.masterLive = audData.isLive;
                        }
                        if (typeof audData.ctaText === "string" && audData.ctaText.trim()) {
                            fallback.heroCtaText = audData.ctaText.trim();
                        }
                    }
                    setConfig(fallback);
                    setSelectedFormId(fallback.primaryFormId);
                }
            } catch (error) {
                console.error("Failed to load join_forms config:", error);
                toast.error("Could not load forms studio configuration.");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadConfig();
        return () => {
            mounted = false;
        };
    }, []);

    const activeForm = useMemo(() => {
        return (
            config.forms.find((f) => f.id === selectedFormId) ||
            config.forms[0]
        );
    }, [config.forms, selectedFormId]);

    const persistConfig = async (
        nextConfig: JoinFormsGlobalConfig,
        toastMessage = "Join Us & Forms Studio saved and synced live!"
    ) => {
        setSaving(true);
        try {
            const primaryForm =
                nextConfig.forms.find((f) => f.id === nextConfig.primaryFormId) ||
                nextConfig.forms[0];

            // Save full forms studio configuration
            await setDoc(doc(db, "settings", "join_forms"), {
                ...nextConfig,
                updatedAt: new Date().toISOString()
            });

            // Sync master gate & CTA text with settings/auditions so Hero.tsx, Header.tsx, CommandCenter stay 100% in sync
            await setDoc(
                doc(db, "settings", "auditions"),
                {
                    isLive: nextConfig.masterLive,
                    ctaText: nextConfig.heroCtaText || primaryForm?.ctaText || "JOIN US",
                    activeFormId: nextConfig.primaryFormId,
                    activeFormTitle: primaryForm?.title || "Annual Auditions",
                    hubMode: nextConfig.hubMode,
                    updatedAt: new Date().toISOString()
                },
                { merge: true }
            );

            setConfig(nextConfig);
            await logAdminAction(
                "UPDATE_JOIN_FORMS",
                `Updated Join Forms Studio (Live: ${nextConfig.masterLive}, Primary Form: ${primaryForm?.title}, Forms: ${nextConfig.forms.length})`
            );
            toast.success(toastMessage);
        } catch (error) {
            console.error("Error saving join_forms config:", error);
            toast.error("Failed to save configuration to Firestore.");
        } finally {
            setSaving(false);
        }
    };

    const handleSubTabChange = (next: JoinFormsSubTab) => {
        setSubTab(next);
        if (onNavigateTab) {
            const tabMap: Record<JoinFormsSubTab, string> = {
                launchpad: "join_launchpad",
                builder: "form_builder",
                wings: "form_categories",
                responses: "form_responses"
            };
            onNavigateTab(tabMap[next]);
        }
    };

    // Form CRUD helpers
    const updateActiveForm = (updater: (form: JoinFormDefinition) => JoinFormDefinition) => {
        if (!activeForm) return;
        const updatedForms = config.forms.map((f) =>
            f.id === activeForm.id
                ? { ...updater(f), updatedAt: new Date().toISOString() }
                : f
        );
        setConfig({ ...config, forms: updatedForms });
    };

    const handleCreateBlankForm = () => {
        const newId = `form-${Date.now().toString(36)}`;
        const newForm: JoinFormDefinition = {
            id: newId,
            slug: newId,
            title: "New Custom Recruitment Form",
            badge: "SPECIAL CALL-SHEET",
            subtitle: "Join The Ensemble",
            description: "Fill out the fields below to submit your application to Swaang.",
            isLive: true,
            isFeaturedOnJoinUs: false,
            ctaText: "JOIN US",
            submitButtonText: "Submit Application",
            opensAt: "",
            closesAt: "",
            maxSubmissions: 0,
            closedTitle: "Applications Closed",
            closedMessage: "This form is currently not accepting new entries.",
            successTitle: "Application Received!",
            successMessage: "Your submission has been recorded by the Swaang team.",
            whatsappGroupUrl: "",
            showResourcesLink: true,
            multiStep: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            fields: [
                {
                    id: `f_name_${Date.now()}`,
                    type: "text",
                    label: "Full Name",
                    placeholder: "Your full name",
                    required: true,
                    width: "half",
                    conditionalWings: [],
                    mapToCore: "name"
                },
                {
                    id: `f_email_${Date.now() + 1}`,
                    type: "email",
                    label: "Email Address",
                    placeholder: "you@example.com",
                    required: true,
                    width: "half",
                    conditionalWings: [],
                    mapToCore: "email"
                },
                {
                    id: `f_phone_${Date.now() + 2}`,
                    type: "phone",
                    label: "WhatsApp Number",
                    placeholder: "9876543210",
                    required: true,
                    width: "half",
                    conditionalWings: [],
                    mapToCore: "phone"
                },
                {
                    id: `f_wing_${Date.now() + 3}`,
                    type: "wing_cards",
                    label: "Select Your Wing / Category",
                    required: true,
                    width: "full",
                    conditionalWings: [],
                    mapToCore: "role"
                }
            ]
        };

        const nextConfig: JoinFormsGlobalConfig = {
            ...config,
            forms: [...config.forms, newForm]
        };
        setConfig(nextConfig);
        setSelectedFormId(newId);
        setSubTab("builder");
        toast.success("Created new custom form! Remember to click Save Studio Changes.");
    };

    const handleCreateFromTemplate = (template: JoinFormDefinition) => {
        const suffix = Date.now().toString(36).slice(-4);
        const cloned: JoinFormDefinition = {
            ...structuredClone(template),
            id: `${template.id}-${suffix}`,
            slug: `${template.slug}-${suffix}`,
            title: `${template.title} (Copy)`,
            isLive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const nextConfig: JoinFormsGlobalConfig = {
            ...config,
            forms: [...config.forms, cloned]
        };
        setConfig(nextConfig);
        setSelectedFormId(cloned.id);
        setShowTemplateModal(false);
        setSubTab("builder");
        toast.success(`Loaded "${template.title}" template!`);
    };

    const handleDuplicateForm = (form: JoinFormDefinition) => {
        const suffix = Date.now().toString(36).slice(-4);
        const cloned: JoinFormDefinition = {
            ...structuredClone(form),
            id: `${form.id}-${suffix}`,
            slug: `${form.slug}-${suffix}`,
            title: `${form.title} (Duplicate)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const nextConfig = {
            ...config,
            forms: [...config.forms, cloned]
        };
        persistConfig(nextConfig, `Duplicated "${form.title}"`);
    };

    const handleDeleteForm = (formId: string) => {
        if (config.forms.length <= 1) {
            toast.error("You must keep at least one recruitment form in the studio.");
            return;
        }
        const target = config.forms.find((f) => f.id === formId);
        if (!window.confirm(`Delete form "${target?.title}"? Existing responses will still remain safe in the database.`)) {
            return;
        }
        const remaining = config.forms.filter((f) => f.id !== formId);
        const nextPrimary =
            config.primaryFormId === formId ? remaining[0].id : config.primaryFormId;
        const nextConfig: JoinFormsGlobalConfig = {
            ...config,
            primaryFormId: nextPrimary,
            forms: remaining
        };
        if (selectedFormId === formId) {
            setSelectedFormId(remaining[0].id);
        }
        persistConfig(nextConfig, `Deleted form "${target?.title}"`);
    };

    const handleAddField = (fieldType: JoinFieldType) => {
        if (!activeForm) return;
        const catalogEntry = FIELD_TYPE_CATALOG.find((c) => c.type === fieldType);
        const newFieldId = `fld_${Date.now().toString(36)}`;

        const defaultMap: Record<JoinFieldType, CoreFieldMapping> = {
            text: "none",
            textarea: "none",
            email: "email",
            phone: "phone",
            number: "none",
            date: "none",
            select: "none",
            wing_cards: "role",
            radio: "none",
            checkbox_group: "none",
            boolean: "none",
            image_upload: "photoLink",
            url: "portfolio",
            rating: "none",
            availability_grid: "none",
            slot_picker: "none",
            monologue_picker: "none",
            section_header: "none",
            consent: "none"
        };

        const newField: JoinFormField = {
            id: newFieldId,
            type: fieldType,
            label:
                fieldType === "section_header"
                    ? "New Form Section / Act"
                    : fieldType === "consent"
                    ? "I agree to Swaang’s rehearsal discipline and ensemble code of conduct."
                    : `New ${catalogEntry?.label || "Question"}`,
            placeholder:
                fieldType === "url"
                    ? "https://..."
                    : fieldType === "email"
                    ? "name@example.com"
                    : fieldType === "phone"
                    ? "9876543210"
                    : "Enter your answer...",
            helpText: "",
            required: fieldType !== "section_header" && fieldType !== "url",
            width:
                fieldType === "textarea" ||
                fieldType === "wing_cards" ||
                fieldType === "checkbox_group" ||
                fieldType === "availability_grid" ||
                fieldType === "section_header" ||
                fieldType === "consent"
                    ? "full"
                    : "half",
            options: catalogEntry?.hasOptions
                ? ["Option 1", "Option 2", "Option 3"]
                : undefined,
            maxRating: fieldType === "rating" ? 10 : undefined,
            conditionalWings: [],
            mapToCore: defaultMap[fieldType]
        };

        updateActiveForm((form) => ({
            ...form,
            fields: [...form.fields, newField]
        }));
        setExpandedFieldId(newFieldId);
        setShowAddQuestionModal(false);
        toast.success(`Added "${catalogEntry?.label}" question!`);
    };

    const handleUpdateField = (fieldId: string, patch: Partial<JoinFormField>) => {
        updateActiveForm((form) => ({
            ...form,
            fields: form.fields.map((fld) =>
                fld.id === fieldId ? { ...fld, ...patch } : fld
            )
        }));
    };

    const handleMoveField = (index: number, direction: -1 | 1) => {
        if (!activeForm) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= activeForm.fields.length) return;
        const nextFields = [...activeForm.fields];
        const [moved] = nextFields.splice(index, 1);
        nextFields.splice(targetIndex, 0, moved);
        updateActiveForm((form) => ({ ...form, fields: nextFields }));
    };

    const handleDuplicateField = (index: number) => {
        if (!activeForm) return;
        const source = activeForm.fields[index];
        const copy: JoinFormField = {
            ...structuredClone(source),
            id: `fld_${Date.now().toString(36)}`,
            label: `${source.label} (Copy)`,
            mapToCore: "none"
        };
        const nextFields = [...activeForm.fields];
        nextFields.splice(index + 1, 0, copy);
        updateActiveForm((form) => ({ ...form, fields: nextFields }));
        setExpandedFieldId(copy.id);
    };

    const handleDeleteField = (fieldId: string) => {
        updateActiveForm((form) => ({
            ...form,
            fields: form.fields.filter((f) => f.id !== fieldId)
        }));
    };

    // Wing CRUD helpers
    const handleAddWing = () => {
        const id = `wing_${Date.now().toString(36)}`;
        const newWing: WingCategory = {
            id,
            name: "New Custom Wing",
            tagline: "Specialized Theatre Department",
            description: "Describe what members of this wing create and perform.",
            icon: "Sparkles",
            color: "gold",
            quota: "5–10 Seats",
            isActive: true
        };
        setConfig({
            ...config,
            wings: [...config.wings, newWing]
        });
        toast.success("Added new wing! Edit details below and click Save.");
    };

    const handleUpdateWing = (wingId: string, patch: Partial<WingCategory>) => {
        setConfig({
            ...config,
            wings: config.wings.map((w) => (w.id === wingId ? { ...w, ...patch } : w))
        });
    };

    const handleDeleteWing = (wingId: string) => {
        if (config.wings.length <= 1) {
            toast.error("Keep at least one active wing.");
            return;
        }
        setConfig({
            ...config,
            wings: config.wings.filter((w) => w.id !== wingId)
        });
    };

    // Filtered responses
    const filteredResponses = useMemo(() => {
        return auditions.filter((item) => {
            if (responseFormFilter !== "all") {
                const itemFormId = item.formId || "swaang-annual-auditions";
                if (itemFormId !== responseFormFilter) return false;
            }
            if (responseWingFilter !== "all") {
                const itemRole = (item.wing || item.role || "").toLowerCase();
                const targetWing = config.wings.find((w) => w.id === responseWingFilter);
                const matchesId = item.wingId === responseWingFilter;
                const matchesName =
                    targetWing && itemRole.includes(targetWing.name.toLowerCase());
                const matchesRaw = itemRole === responseWingFilter.toLowerCase();
                if (!matchesId && !matchesName && !matchesRaw) return false;
            }
            if (responseStatusFilter !== "all") {
                if ((item.status || "pending") !== responseStatusFilter) return false;
            }
            if (responseSearch.trim()) {
                const q = responseSearch.toLowerCase();
                const hay = [
                    item.name,
                    item.email,
                    item.phone,
                    item.branch,
                    item.year,
                    item.role,
                    item.wing,
                    item.ticketId,
                    item.formTitle,
                    JSON.stringify(item.customAnswers || {})
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [
        auditions,
        responseFormFilter,
        responseWingFilter,
        responseStatusFilter,
        responseSearch,
        config.wings
    ]);

    const handleUpdateSubmissionStatus = async (submissionId: string, nextStatus: string) => {
        try {
            await updateDoc(doc(db, "auditions", submissionId), {
                status: nextStatus
            });
            if (selectedSubmission?.id === submissionId) {
                setSelectedSubmission({ ...selectedSubmission, status: nextStatus });
            }
            toast.success(`Updated status to ${nextStatus.toUpperCase()}`);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Could not update submission status.");
        }
    };

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!window.confirm("Permanently delete this form response?")) return;
        try {
            await deleteDoc(doc(db, "auditions", submissionId));
            if (selectedSubmission?.id === submissionId) {
                setSelectedSubmission(null);
            }
            toast.success("Deleted submission.");
        } catch (error) {
            console.error("Error deleting submission:", error);
            toast.error("Failed to delete submission.");
        }
    };

    const handleExportDynamicCSV = () => {
        if (filteredResponses.length === 0) {
            toast.error("No responses match current filter to export.");
            return;
        }

        // Collect all unique custom question keys across filtered responses
        const customKeySet = new Set<string>();
        filteredResponses.forEach((sub) => {
            if (sub.customAnswers && typeof sub.customAnswers === "object") {
                Object.keys(sub.customAnswers).forEach((k) => customKeySet.add(k));
            }
        });
        const customKeys = Array.from(customKeySet);

        const baseHeaders = [
            "Ticket ID",
            "Form Title",
            "Full Name",
            "Email",
            "WhatsApp / Phone",
            "Branch",
            "Year",
            "Primary Wing / Role",
            "Status",
            "Headshot Link",
            "Portfolio Link",
            "Experience / Essay",
            "Submitted At"
        ];

        const allHeaders = [...baseHeaders, ...customKeys];

        const escapeCell = (val: unknown) => {
            if (val === null || val === undefined) return '""';
            const str =
                typeof val === "object" ? JSON.stringify(val) : String(val);
            return `"${str.replace(/"/g, '""')}"`;
        };

        const rows = filteredResponses.map((sub) => {
            const baseVals = [
                sub.ticketId || sub.id.slice(0, 8).toUpperCase(),
                sub.formTitle || "Annual Auditions",
                sub.name || "",
                sub.email || "",
                sub.phone || "",
                sub.branch || "",
                sub.year || "",
                sub.wing || sub.role || "",
                sub.status || "pending",
                sub.photoLink || "",
                sub.portfolio || "",
                sub.experience || sub.motivation || "",
                sub.submittedAt || ""
            ];
            const customVals = customKeys.map((k) =>
                sub.customAnswers ? sub.customAnswers[k] : ""
            );
            return [...baseVals, ...customVals].map(escapeCell).join(",");
        });

        const csvContent = [allHeaders.map(escapeCell).join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `swaang-form-responses-${responseFormFilter}-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`Exported ${filteredResponses.length} responses with all custom fields!`);
    };

    const copyShareLink = (formId: string) => {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = `${origin}/auditions?form=${encodeURIComponent(formId)}`;
        navigator.clipboard.writeText(url);
        toast.success("Copied direct form link to clipboard!");
    };

    if (loading) {
        return (
            <div className="adm-card p-10 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
                <p className="text-sm font-medium adm-text-2">
                    Loading Join Us Forms & Recruitment Studio...
                </p>
            </div>
        );
    }

    const primaryForm =
        config.forms.find((f) => f.id === config.primaryFormId) || config.forms[0];

    return (
        <div className="space-y-6">
            {statusNotice && (
                <div
                    className={`adm-panel px-4 py-3 flex items-center justify-between gap-3 text-xs font-semibold ${
                        statusNotice.type === "success"
                            ? "border-emerald-500/40 text-emerald-400"
                            : "border-rose-500/40 text-rose-400"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{statusNotice.text}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setStatusNotice(null)}
                        className="adm-btn adm-btn-ghost p-1"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Top Studio Header Bar */}
            <div className="adm-card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                        <span className="adm-eyebrow">FORMS & RECRUITMENT STUDIO</span>
                        <span
                            className={`adm-badge ${
                                config.masterLive
                                    ? "adm-badge-emerald"
                                    : "adm-badge-crimson"
                            }`}
                        >
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    config.masterLive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                            />
                            {config.masterLive
                                ? `JOIN US LIVE (${config.heroCtaText})`
                                : "JOIN US CLOSED"}
                        </span>
                    </div>
                    <h2 className="adm-title text-xl sm:text-2xl">
                        Custom Join Us Forms, Wings & Question Builder
                    </h2>
                    <p className="text-xs sm:text-sm adm-text-2 mt-1">
                        Design multi-type theatrical application forms, manage society wings, and publish directly to the homepage &ldquo;Join Us&rdquo; button.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <a
                        href="/auditions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="adm-btn adm-btn-ghost text-xs"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Live /auditions
                    </a>
                    <button
                        type="button"
                        onClick={() => persistConfig(config)}
                        disabled={saving}
                        className="adm-btn adm-btn-primary text-xs"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "Syncing Live..." : "Save & Publish Studio"}
                    </button>
                </div>
            </div>

            {/* 4-Module Segmented Navigation Bar */}
            <div className="adm-seg w-full grid grid-cols-2 lg:grid-cols-4 gap-1.5 p-1.5">
                <button
                    type="button"
                    onClick={() => handleSubTabChange("launchpad")}
                    data-active={subTab === "launchpad"}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                >
                    <Rocket className="w-4 h-4" />
                    <span>1. Join Us Launchpad</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleSubTabChange("builder")}
                    data-active={subTab === "builder"}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                >
                    <Sliders className="w-4 h-4" />
                    <span>2. Form & Question Builder ({config.forms.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleSubTabChange("wings")}
                    data-active={subTab === "wings"}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                >
                    <Layers className="w-4 h-4" />
                    <span>3. Wings & Categories ({config.wings.length})</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleSubTabChange("responses")}
                    data-active={subTab === "responses"}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>4. Form Responses ({auditions.length})</span>
                </button>
            </div>

            {/* ================================================================= */}
            {/* SUB-MODULE 1: JOIN US LAUNCHPAD                                   */}
            {/* ================================================================= */}
            {subTab === "launchpad" && (
                <div className="space-y-6">
                    {/* Master Hero Button & Gate Controller */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 adm-card p-6 space-y-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <span className="adm-eyebrow">HOMEPAGE &ldquo;JOIN US&rdquo; BUTTON CONTROLLER</span>
                                    <h3 className="adm-h2 mt-1">
                                        Master Recruitment Gate & CTA
                                    </h3>
                                    <p className="text-xs adm-text-2 mt-1">
                                        Controls whether the homepage Hero button opens your live recruitment form(s) or displays the closed curtain state.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = {
                                            ...config,
                                            masterLive: !config.masterLive
                                        };
                                        persistConfig(
                                            next,
                                            next.masterLive
                                                ? "Join Us Button is now LIVE on the homepage!"
                                                : "Join Us portal is now CLOSED."
                                        );
                                    }}
                                    className={`adm-btn text-xs ${
                                        config.masterLive
                                            ? "adm-btn-primary"
                                            : "adm-btn-outline"
                                    }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            config.masterLive
                                                ? "bg-white animate-pulse"
                                                : "bg-rose-500"
                                        }`}
                                    />
                                    {config.masterLive ? "GATE OPEN (LIVE)" : "GATE CLOSED"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="adm-label">
                                        Homepage Hero Button Label
                                    </label>
                                    <input
                                        type="text"
                                        value={config.heroCtaText}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                heroCtaText: e.target.value
                                            })
                                        }
                                        placeholder="JOIN US"
                                        className="adm-input"
                                    />
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {[
                                            "JOIN US",
                                            "AUDITIONS LIVE",
                                            "APPLY TO SWAANG",
                                            "JOIN THE CREW",
                                            "NUKKAD TRYOUTS"
                                        ].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() =>
                                                    setConfig({
                                                        ...config,
                                                        heroCtaText: preset
                                                    })
                                                }
                                                className="adm-chip text-[10px] py-1 px-2"
                                                data-active={
                                                    config.heroCtaText === preset
                                                }
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="adm-label">
                                        Primary Form Linked to &ldquo;Join Us&rdquo;
                                    </label>
                                    <select
                                        value={config.primaryFormId}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                primaryFormId: e.target.value
                                            })
                                        }
                                        className="adm-input adm-select"
                                    >
                                        {config.forms.map((form) => (
                                            <option key={form.id} value={form.id}>
                                                {form.title} ({form.fields.length} fields)
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] adm-text-3 mt-1.5">
                                        Currently linked to:{" "}
                                        <strong className="adm-text-1">
                                            {primaryForm?.title}
                                        </strong>
                                    </p>
                                </div>
                            </div>

                            <div className="adm-panel p-4 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold adm-text-1">
                                            When Multiple Forms Are Marked Live:
                                        </p>
                                        <p className="text-[11px] adm-text-2">
                                            Choose whether visitors see only the Primary Form or a Selector Hub of all live forms.
                                        </p>
                                    </div>
                                    <div className="adm-seg flex p-1">
                                        <button
                                            type="button"
                                            data-active={config.hubMode === "single"}
                                            onClick={() =>
                                                setConfig({
                                                    ...config,
                                                    hubMode: "single"
                                                })
                                            }
                                            className="px-2.5 py-1 text-[11px] font-semibold rounded"
                                        >
                                            Direct Primary Form
                                        </button>
                                        <button
                                            type="button"
                                            data-active={config.hubMode === "hub"}
                                            onClick={() =>
                                                setConfig({
                                                    ...config,
                                                    hubMode: "hub"
                                                })
                                            }
                                            className="px-2.5 py-1 text-[11px] font-semibold rounded"
                                        >
                                            Multi-Form Selector Hub
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Closed Curtain Fallback Customizer */}
                        <div className="lg:col-span-5 adm-card p-6 space-y-4">
                            <div>
                                <span className="adm-eyebrow">OFF-SEASON CURTAIN MESSAGE</span>
                                <h3 className="adm-h2 mt-1">
                                    Closed Gate Notice
                                </h3>
                                <p className="text-xs adm-text-2 mt-1">
                                    Displayed on <code>/auditions</code> whenever the Master Recruitment Gate is turned off.
                                </p>
                            </div>

                            <div>
                                <label className="adm-label">Closed Screen Title</label>
                                <input
                                    type="text"
                                    value={config.closedDoorTitle}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            closedDoorTitle: e.target.value
                                        })
                                    }
                                    className="adm-input"
                                />
                            </div>

                            <div>
                                <label className="adm-label">Closed Screen Message</label>
                                <textarea
                                    rows={3}
                                    value={config.closedDoorMessage}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            closedDoorMessage: e.target.value
                                        })
                                    }
                                    className="adm-input"
                                />
                            </div>

                            <div className="pt-1 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => persistConfig(config)}
                                    disabled={saving}
                                    className="adm-btn adm-btn-gold text-xs"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save Launchpad Settings
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* All Forms Directory Cards */}
                    <div className="adm-card p-6 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <span className="adm-eyebrow">FORM LIBRARY & LIVE ROUTING</span>
                                <h3 className="adm-h2 mt-1">
                                    Your Custom Recruitment Forms ({config.forms.length})
                                </h3>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTemplateModal(true)}
                                    className="adm-btn adm-btn-gold text-xs"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    + New From Theatre Template
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateBlankForm}
                                    className="adm-btn adm-btn-primary text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    + Create Blank Form
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {config.forms.map((form) => {
                                const isPrimary = config.primaryFormId === form.id;
                                const responseCount = auditions.filter(
                                    (a) =>
                                        (a.formId || "swaang-annual-auditions") ===
                                        form.id
                                ).length;
                                const conditionalCount = form.fields.filter(
                                    (f) =>
                                        f.conditionalWings &&
                                        f.conditionalWings.length > 0
                                ).length;

                                return (
                                    <div
                                        key={form.id}
                                        className={`adm-panel p-5 flex flex-col justify-between gap-4 transition-all ${
                                            isPrimary
                                                ? "ring-2 ring-amber-500/60"
                                                : ""
                                        }`}
                                    >
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {isPrimary && (
                                                        <span className="adm-badge adm-badge-gold">
                                                            ★ LIVE ON &ldquo;JOIN US&rdquo; BUTTON
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`adm-badge ${
                                                            form.isLive
                                                                ? "adm-badge-emerald"
                                                                : "adm-badge-neutral"
                                                        }`}
                                                    >
                                                        {form.isLive
                                                            ? "Form Active"
                                                            : "Draft / Paused"}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-mono adm-text-3">
                                                    {responseCount} responses
                                                </span>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider adm-text-gold">
                                                    {form.badge}
                                                </p>
                                                <h4 className="adm-h3 text-base mt-0.5">
                                                    {form.title}
                                                </h4>
                                                <p className="text-xs adm-text-2 mt-1 line-clamp-2">
                                                    {form.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <span className="adm-badge adm-badge-neutral">
                                                    {form.fields.length} Fields
                                                </span>
                                                {conditionalCount > 0 && (
                                                    <span className="adm-badge adm-badge-violet">
                                                        <GitBranch className="w-3 h-3" />
                                                        {conditionalCount} Wing-Conditional
                                                    </span>
                                                )}
                                                {form.multiStep && (
                                                    <span className="adm-badge adm-badge-sky">
                                                        Multi-Step Wizard
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t adm-divider flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                {!isPrimary && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const next = {
                                                                ...config,
                                                                primaryFormId: form.id,
                                                                masterLive: true,
                                                                forms: config.forms.map(
                                                                    (f) =>
                                                                        f.id === form.id
                                                                            ? {
                                                                                  ...f,
                                                                                  isLive: true
                                                                              }
                                                                            : f
                                                                )
                                                            };
                                                            persistConfig(
                                                                next,
                                                                `"${form.title}" is now LIVE on the homepage Join Us button!`
                                                            );
                                                        }}
                                                        className="adm-btn adm-btn-gold text-[11px] py-1.5 px-2.5"
                                                    >
                                                        <Rocket className="w-3.5 h-3.5" />
                                                        Make Live on Join Us
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFormId(form.id);
                                                        handleSubTabChange("builder");
                                                    }}
                                                    className="adm-btn adm-btn-outline text-[11px] py-1.5 px-2.5"
                                                >
                                                    <Sliders className="w-3.5 h-3.5" />
                                                    Edit Questions
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setResponseFormFilter(form.id);
                                                        handleSubTabChange("responses");
                                                    }}
                                                    className="adm-btn adm-btn-ghost text-[11px] py-1.5 px-2.5"
                                                >
                                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                                    Responses ({responseCount})
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => copyShareLink(form.id)}
                                                    title="Copy direct share link"
                                                    className="adm-btn adm-btn-ghost p-1.5"
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicateForm(form)}
                                                    title="Duplicate form"
                                                    className="adm-btn adm-btn-ghost p-1.5"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteForm(form.id)}
                                                    title="Delete form"
                                                    className="adm-btn adm-btn-danger p-1.5"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* SUB-MODULE 2: FORM & QUESTION BUILDER                             */}
            {/* ================================================================= */}
            {subTab === "builder" && activeForm && (
                <div className="space-y-6">
                    {/* Form Selector & Action Bar */}
                    <div className="adm-card p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                            <div className="min-w-[260px] flex-1 max-w-md">
                                <label className="adm-label">
                                    Editing Form in Studio
                                </label>
                                <select
                                    value={activeForm.id}
                                    onChange={(e) =>
                                        setSelectedFormId(e.target.value)
                                    }
                                    className="adm-input adm-select font-semibold"
                                >
                                    {config.forms.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {config.primaryFormId === f.id
                                                ? "★ [LIVE ON JOIN US] "
                                                : ""}
                                            {f.title} ({f.fields.length} questions)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowTemplateModal(true)}
                                    className="adm-btn adm-btn-outline text-xs"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Templates
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCreateBlankForm}
                                    className="adm-btn adm-btn-ghost text-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    New Blank
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLivePreview(!showLivePreview)}
                                className={`adm-btn text-xs ${
                                    showLivePreview
                                        ? "adm-btn-gold"
                                        : "adm-btn-outline"
                                }`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                {showLivePreview
                                    ? "Hide Interactive Preview"
                                    : "Live Form Preview"}
                            </button>

                            {config.primaryFormId !== activeForm.id && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = {
                                            ...config,
                                            primaryFormId: activeForm.id,
                                            masterLive: true,
                                            forms: config.forms.map((f) =>
                                                f.id === activeForm.id
                                                    ? { ...f, isLive: true }
                                                    : f
                                            )
                                        };
                                        persistConfig(
                                            next,
                                            `"${activeForm.title}" is now LIVE on the homepage Join Us button!`
                                        );
                                    }}
                                    className="adm-btn adm-btn-gold text-xs"
                                >
                                    <Rocket className="w-3.5 h-3.5" />
                                    Make Live on Join Us
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => persistConfig(config)}
                                disabled={saving}
                                className="adm-btn adm-btn-primary text-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {saving ? "Saving..." : "Save Form"}
                            </button>
                        </div>
                    </div>

                    {/* Form Header, Schedule & Post-Submit Ticket Settings */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 adm-card p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="adm-eyebrow">FORM HEADER & BRANDING</span>
                                <label className="flex items-center gap-2 text-xs font-semibold adm-text-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={activeForm.isLive}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                isLive: e.target.checked
                                            }))
                                        }
                                        className="rounded accent-emerald-500"
                                    />
                                    Form Enabled (Accepting Submissions)
                                </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="adm-label">Form Title</label>
                                    <input
                                        type="text"
                                        value={activeForm.title}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                title: e.target.value
                                            }))
                                        }
                                        className="adm-input"
                                    />
                                </div>
                                <div>
                                    <label className="adm-label">Top Eyebrow Badge</label>
                                    <input
                                        type="text"
                                        value={activeForm.badge}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                badge: e.target.value
                                            }))
                                        }
                                        className="adm-input"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="adm-label">Dramatic Subtitle</label>
                                    <input
                                        type="text"
                                        value={activeForm.subtitle}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                subtitle: e.target.value
                                            }))
                                        }
                                        className="adm-input"
                                    />
                                </div>
                                <div>
                                    <label className="adm-label">Submit Button Text</label>
                                    <input
                                        type="text"
                                        value={activeForm.submitButtonText}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                submitButtonText: e.target.value
                                            }))
                                        }
                                        className="adm-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="adm-label">Form Intro Description</label>
                                <textarea
                                    rows={2}
                                    value={activeForm.description}
                                    onChange={(e) =>
                                        updateActiveForm((f) => ({
                                            ...f,
                                            description: e.target.value
                                        }))
                                    }
                                    className="adm-input"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 text-xs font-semibold adm-text-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={activeForm.multiStep}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                multiStep: e.target.checked
                                            }))
                                        }
                                        className="rounded accent-amber-500"
                                    />
                                    Enable Multi-Step Act Wizard (Splits pages at Section Dividers)
                                </label>
                            </div>
                        </div>

                        <div className="lg:col-span-5 adm-card p-6 space-y-4">
                            <span className="adm-eyebrow">
                                SCHEDULE CAP & POST-SUBMISSION TICKET
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="adm-label">Auto-Open Date</label>
                                    <input
                                        type="datetime-local"
                                        value={activeForm.opensAt || ""}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                opensAt: e.target.value
                                            }))
                                        }
                                        className="adm-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="adm-label">Auto-Close Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={activeForm.closesAt || ""}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                closesAt: e.target.value
                                            }))
                                        }
                                        className="adm-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="adm-label">Max Cap (0 = ∞)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={activeForm.maxSubmissions || 0}
                                        onChange={(e) =>
                                            updateActiveForm((f) => ({
                                                ...f,
                                                maxSubmissions:
                                                    parseInt(e.target.value, 10) || 0
                                            }))
                                        }
                                        className="adm-input text-xs"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="adm-label">
                                    Ticket Receipt Heading (After Submit)
                                </label>
                                <input
                                    type="text"
                                    value={activeForm.successTitle}
                                    onChange={(e) =>
                                        updateActiveForm((f) => ({
                                            ...f,
                                            successTitle: e.target.value
                                        }))
                                    }
                                    className="adm-input"
                                />
                            </div>

                            <div>
                                <label className="adm-label">
                                    WhatsApp Audition Group Invite Link (Optional — Shown on Ticket)
                                </label>
                                <input
                                    type="url"
                                    value={activeForm.whatsappGroupUrl || ""}
                                    onChange={(e) =>
                                        updateActiveForm((f) => ({
                                            ...f,
                                            whatsappGroupUrl: e.target.value
                                        }))
                                    }
                                    placeholder="https://chat.whatsapp.com/..."
                                    className="adm-input"
                                />
                            </div>

                            <label className="flex items-center gap-2 text-xs font-semibold adm-text-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={activeForm.showResourcesLink}
                                    onChange={(e) =>
                                        updateActiveForm((f) => ({
                                            ...f,
                                            showResourcesLink: e.target.checked
                                        }))
                                    }
                                    className="rounded accent-amber-500"
                                />
                                Show &ldquo;Open Audition Prep Vault (/auditions/resources)&rdquo; Button on Ticket
                            </label>
                        </div>
                    </div>

                    {/* Question Builder + Optional Live Preview Split View */}
                    <div
                        className={`grid grid-cols-1 ${
                            showLivePreview ? "xl:grid-cols-12" : ""
                        } gap-6`}
                    >
                        {/* Left / Main: Question List */}
                        <div
                            className={`${
                                showLivePreview ? "xl:col-span-7" : ""
                            } adm-card p-6 space-y-4`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <span className="adm-eyebrow">
                                        CUSTOM QUESTIONS & CONDITIONAL LOGIC
                                    </span>
                                    <h3 className="adm-h2 mt-1">
                                        Form Fields ({activeForm.fields.length})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAddQuestionModal(true)}
                                    className="adm-btn adm-btn-primary text-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                    + Add Question / Field (19 Types)
                                </button>
                            </div>

                            <div className="space-y-3">
                                {activeForm.fields.map((field, idx) => {
                                    const isExpanded = expandedFieldId === field.id;
                                    const catalogInfo = FIELD_TYPE_CATALOG.find(
                                        (c) => c.type === field.type
                                    );
                                    const hasConditional =
                                        field.conditionalWings &&
                                        field.conditionalWings.length > 0;

                                    return (
                                        <div
                                            key={field.id}
                                            className={`adm-panel transition-all ${
                                                field.type === "section_header"
                                                    ? "border-l-4 border-l-amber-500"
                                                    : hasConditional
                                                    ? "border-l-4 border-l-violet-500"
                                                    : ""
                                            }`}
                                        >
                                            {/* Summary Bar */}
                                            <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                                                <div
                                                    onClick={() =>
                                                        setExpandedFieldId(
                                                            isExpanded
                                                                ? null
                                                                : field.id
                                                        )
                                                    }
                                                    className="flex items-center gap-3 flex-1 min-w-[220px] cursor-pointer"
                                                >
                                                    <span className="w-7 h-7 rounded-lg adm-surface-2 flex items-center justify-center text-xs font-mono font-bold adm-text-2">
                                                        {idx + 1}
                                                    </span>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-semibold text-sm adm-text-1">
                                                                {field.label}
                                                            </span>
                                                            {field.required &&
                                                                field.type !==
                                                                    "section_header" && (
                                                                    <span className="adm-badge adm-badge-crimson text-[10px] py-0.5 px-1.5">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            <span className="adm-badge adm-badge-neutral text-[10px] py-0.5 px-2">
                                                                {catalogInfo?.label ||
                                                                    field.type}
                                                            </span>
                                                            {field.mapToCore &&
                                                                field.mapToCore !==
                                                                    "none" && (
                                                                    <span className="adm-badge adm-badge-emerald text-[10px] py-0.5 px-2">
                                                                        Maps to:{" "}
                                                                        {
                                                                            field.mapToCore
                                                                        }
                                                                    </span>
                                                                )}
                                                            {hasConditional && (
                                                                <span className="adm-badge adm-badge-violet text-[10px] py-0.5 px-2">
                                                                    <GitBranch className="w-3 h-3" />
                                                                    Only for:{" "}
                                                                    {field.conditionalWings
                                                                        ?.map(
                                                                            (
                                                                                wId
                                                                            ) =>
                                                                                config.wings.find(
                                                                                    (
                                                                                        w
                                                                                    ) =>
                                                                                        w.id ===
                                                                                        wId
                                                                                )
                                                                                    ?.name ||
                                                                                wId
                                                                        )
                                                                        .join(
                                                                            ", "
                                                                        )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {field.helpText && (
                                                            <p className="text-xs adm-text-3 mt-0.5 line-clamp-1">
                                                                {field.helpText}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMoveField(
                                                                idx,
                                                                -1
                                                            )
                                                        }
                                                        disabled={idx === 0}
                                                        title="Move Up"
                                                        className="adm-btn adm-btn-ghost p-1.5 disabled:opacity-30"
                                                    >
                                                        <ArrowUp className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleMoveField(
                                                                idx,
                                                                1
                                                            )
                                                        }
                                                        disabled={
                                                            idx ===
                                                            activeForm.fields
                                                                .length -
                                                                1
                                                        }
                                                        title="Move Down"
                                                        className="adm-btn adm-btn-ghost p-1.5 disabled:opacity-30"
                                                    >
                                                        <ArrowDown className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDuplicateField(
                                                                idx
                                                            )
                                                        }
                                                        title="Duplicate Question"
                                                        className="adm-btn adm-btn-ghost p-1.5"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDeleteField(
                                                                field.id
                                                            )
                                                        }
                                                        title="Delete Question"
                                                        className="adm-btn adm-btn-danger p-1.5"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedFieldId(
                                                                isExpanded
                                                                    ? null
                                                                    : field.id
                                                            )
                                                        }
                                                        className="adm-btn adm-btn-outline text-xs py-1 px-2.5 ml-1"
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                                Done
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                                Configure
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Expanded Field Editor */}
                                            {isExpanded && (
                                                <div className="px-4 pb-5 pt-3 border-t adm-divider space-y-4">
                                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                                        <div className="sm:col-span-6">
                                                            <label className="adm-label">
                                                                Question Label / Heading
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    field.label
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateField(
                                                                        field.id,
                                                                        {
                                                                            label: e
                                                                                .target
                                                                                .value
                                                                        }
                                                                    )
                                                                }
                                                                className="adm-input"
                                                            />
                                                        </div>

                                                        <div className="sm:col-span-3">
                                                            <label className="adm-label">
                                                                Question Type
                                                            </label>
                                                            <select
                                                                value={
                                                                    field.type
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const nextType =
                                                                        e.target
                                                                            .value as JoinFieldType;
                                                                    const cat =
                                                                        FIELD_TYPE_CATALOG.find(
                                                                            (
                                                                                c
                                                                            ) =>
                                                                                c.type ===
                                                                                nextType
                                                                        );
                                                                    handleUpdateField(
                                                                        field.id,
                                                                        {
                                                                            type: nextType,
                                                                            options:
                                                                                cat?.hasOptions &&
                                                                                (!field.options ||
                                                                                    field
                                                                                        .options
                                                                                        .length ===
                                                                                        0)
                                                                                    ? [
                                                                                          "Option 1",
                                                                                          "Option 2"
                                                                                      ]
                                                                                    : field.options
                                                                        }
                                                                    );
                                                                }}
                                                                className="adm-input adm-select"
                                                            >
                                                                {FIELD_TYPE_CATALOG.map(
                                                                    (cat) => (
                                                                        <option
                                                                            key={
                                                                                cat.type
                                                                            }
                                                                            value={
                                                                                cat.type
                                                                            }
                                                                        >
                                                                            {
                                                                                cat.label
                                                                            }
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div className="sm:col-span-3">
                                                            <label className="adm-label">
                                                                Layout Width
                                                            </label>
                                                            <select
                                                                value={
                                                                    field.width
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateField(
                                                                        field.id,
                                                                        {
                                                                            width: e
                                                                                .target
                                                                                .value as JoinFormField["width"]
                                                                        }
                                                                    )
                                                                }
                                                                className="adm-input adm-select"
                                                            >
                                                                <option value="full">
                                                                    Full Width (100%)
                                                                </option>
                                                                <option value="half">
                                                                    Half Width (1/2)
                                                                </option>
                                                                <option value="third">
                                                                    Third Width (1/3)
                                                                </option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {field.type !==
                                                        "section_header" && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                            <div>
                                                                <label className="adm-label">
                                                                    Placeholder Text
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        field.placeholder ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                placeholder:
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                            }
                                                                        )
                                                                    }
                                                                    className="adm-input"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="adm-label">
                                                                    Helper Sub-Caption
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        field.helpText ||
                                                                        ""
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                helpText:
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                            }
                                                                        )
                                                                    }
                                                                    className="adm-input"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="adm-label">
                                                                    Sync to Casting Desk Field
                                                                </label>
                                                                <select
                                                                    value={
                                                                        field.mapToCore ||
                                                                        "none"
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                mapToCore:
                                                                                    e
                                                                                        .target
                                                                                        .value as CoreFieldMapping
                                                                            }
                                                                        )
                                                                    }
                                                                    className="adm-input adm-select"
                                                                >
                                                                    {CORE_MAPPINGS.map(
                                                                        (m) => (
                                                                            <option
                                                                                key={
                                                                                    m.value
                                                                                }
                                                                                value={
                                                                                    m.value
                                                                                }
                                                                            >
                                                                                {
                                                                                    m.label
                                                                                }
                                                                            </option>
                                                                        )
                                                                    )}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {field.type ===
                                                        "section_header" && (
                                                        <div>
                                                            <label className="adm-label">
                                                                Section Instructions / Sub-heading
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    field.helpText ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateField(
                                                                        field.id,
                                                                        {
                                                                            helpText:
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                        }
                                                                    )
                                                                }
                                                                className="adm-input"
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Options Editor for Select / Radio / Checkbox / Slot Picker */}
                                                    {(field.type === "select" ||
                                                        field.type ===
                                                            "radio" ||
                                                        field.type ===
                                                            "checkbox_group" ||
                                                        field.type ===
                                                            "slot_picker") && (
                                                        <div className="adm-card p-4 space-y-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="adm-label mb-0">
                                                                    Choices / Options List
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                options:
                                                                                    [
                                                                                        ...(field.options ||
                                                                                            []),
                                                                                        `Option ${
                                                                                            (field
                                                                                                .options
                                                                                                ?.length ||
                                                                                                0) +
                                                                                            1
                                                                                        }`
                                                                                    ]
                                                                            }
                                                                        )
                                                                    }
                                                                    className="adm-btn adm-btn-gold text-[11px] py-1 px-2.5"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                    Add Choice
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {(
                                                                    field.options ||
                                                                    []
                                                                ).map(
                                                                    (
                                                                        opt,
                                                                        optIdx
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                optIdx
                                                                            }
                                                                            className="flex items-center gap-1.5"
                                                                        >
                                                                            <input
                                                                                type="text"
                                                                                value={
                                                                                    opt
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) => {
                                                                                    const nextOpts =
                                                                                        [
                                                                                            ...(field.options ||
                                                                                                [])
                                                                                        ];
                                                                                    nextOpts[
                                                                                        optIdx
                                                                                    ] =
                                                                                        e.target.value;
                                                                                    handleUpdateField(
                                                                                        field.id,
                                                                                        {
                                                                                            options:
                                                                                                nextOpts
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                className="adm-input text-xs py-1.5"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const nextOpts =
                                                                                        (
                                                                                            field.options ||
                                                                                            []
                                                                                        ).filter(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) =>
                                                                                                i !==
                                                                                                optIdx
                                                                                        );
                                                                                    handleUpdateField(
                                                                                        field.id,
                                                                                        {
                                                                                            options:
                                                                                                nextOpts
                                                                                        }
                                                                                    );
                                                                                }}
                                                                                className="adm-btn adm-btn-danger p-1.5"
                                                                            >
                                                                                <X className="w-3.5 h-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Rating Scale Editor */}
                                                    {field.type ===
                                                        "rating" && (
                                                        <div className="flex items-center gap-4">
                                                            <label className="adm-label mb-0">
                                                                Rating Maximum Scale:
                                                            </label>
                                                            <div className="adm-seg flex p-1">
                                                                {[5, 10].map(
                                                                    (scale) => (
                                                                        <button
                                                                            key={
                                                                                scale
                                                                            }
                                                                            type="button"
                                                                            data-active={
                                                                                (field.maxRating ||
                                                                                    10) ===
                                                                                scale
                                                                            }
                                                                            onClick={() =>
                                                                                handleUpdateField(
                                                                                    field.id,
                                                                                    {
                                                                                        maxRating:
                                                                                            scale as
                                                                                                | 5
                                                                                                | 10
                                                                                    }
                                                                                )
                                                                            }
                                                                            className="px-3 py-1 text-xs font-semibold rounded"
                                                                        >
                                                                            1 to{" "}
                                                                            {
                                                                                scale
                                                                            }
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Conditional Wing Branching Selector */}
                                                    <div className="adm-card p-4 space-y-2.5">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <GitBranch className="w-4 h-4 text-violet-400" />
                                                                <span className="text-xs font-semibold adm-text-1">
                                                                    Conditional Wing Visibility (&ldquo;Show Only If Wing Is...&rdquo;)
                                                                </span>
                                                            </div>
                                                            {hasConditional && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                conditionalWings:
                                                                                    []
                                                                            }
                                                                        )
                                                                    }
                                                                    className="text-[11px] font-semibold adm-text-gold hover:underline"
                                                                >
                                                                    Reset to Show for All Wings
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] adm-text-2">
                                                            Leave all unchecked to ask every applicant. Check specific wings to reveal this question dynamically only when those wings are chosen.
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {config.wings.map(
                                                                (wing) => {
                                                                    const isChecked =
                                                                        field.conditionalWings?.includes(
                                                                            wing.id
                                                                        ) ||
                                                                        false;
                                                                    return (
                                                                        <button
                                                                            key={
                                                                                wing.id
                                                                            }
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const current =
                                                                                    field.conditionalWings ||
                                                                                    [];
                                                                                const next =
                                                                                    isChecked
                                                                                        ? current.filter(
                                                                                              (
                                                                                                  id
                                                                                              ) =>
                                                                                                  id !==
                                                                                                  wing.id
                                                                                          )
                                                                                        : [
                                                                                              ...current,
                                                                                              wing.id
                                                                                          ];
                                                                                handleUpdateField(
                                                                                    field.id,
                                                                                    {
                                                                                        conditionalWings:
                                                                                            next
                                                                                    }
                                                                                );
                                                                            }}
                                                                            data-active={
                                                                                isChecked
                                                                            }
                                                                            className="adm-chip text-xs py-1 px-2.5"
                                                                        >
                                                                            {isChecked && (
                                                                                <Check className="w-3 h-3" />
                                                                            )}
                                                                            {
                                                                                wing.name
                                                                            }
                                                                        </button>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Required Checkbox */}
                                                    {field.type !==
                                                        "section_header" && (
                                                        <div className="flex items-center justify-between pt-1">
                                                            <label className="flex items-center gap-2 text-xs font-semibold adm-text-1 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        field.required
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateField(
                                                                            field.id,
                                                                            {
                                                                                required:
                                                                                    e
                                                                                        .target
                                                                                        .checked
                                                                            }
                                                                        )
                                                                    }
                                                                    className="rounded accent-rose-500"
                                                                />
                                                                Mandatory / Required Question
                                                            </label>
                                                            <span className="text-[11px] font-mono adm-text-3">
                                                                Field ID:{" "}
                                                                {field.id}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowAddQuestionModal(true)}
                                    className="adm-btn adm-btn-gold text-xs w-full sm:w-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    + Add Another Question / Widget
                                </button>
                            </div>
                        </div>

                        {/* Right: Interactive Live Preview Panel */}
                        {showLivePreview && (
                            <div className="xl:col-span-5 adm-card p-5 space-y-4 sticky top-20 self-start">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <span className="adm-eyebrow">
                                            INTERACTIVE STAGE PREVIEW
                                        </span>
                                        <h4 className="adm-h3 text-sm mt-0.5">
                                            Test Conditional Questions Live
                                        </h4>
                                    </div>
                                    <div className="adm-seg flex p-1">
                                        <button
                                            type="button"
                                            data-active={
                                                previewViewport === "desktop"
                                            }
                                            onClick={() =>
                                                setPreviewViewport("desktop")
                                            }
                                            className="p-1.5 rounded text-xs"
                                            title="Desktop Preview"
                                        >
                                            <Monitor className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            data-active={
                                                previewViewport === "mobile"
                                            }
                                            onClick={() =>
                                                setPreviewViewport("mobile")
                                            }
                                            className="p-1.5 rounded text-xs"
                                            title="Mobile Preview"
                                        >
                                            <Smartphone className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className={`mx-auto transition-all adm-panel p-5 space-y-4 max-h-[75vh] overflow-y-auto adm-scrollbar ${
                                        previewViewport === "mobile"
                                            ? "max-w-[360px]"
                                            : "w-full"
                                    }`}
                                >
                                    <div className="border-b adm-divider pb-3">
                                        <span className="adm-badge adm-badge-gold text-[10px]">
                                            {activeForm.badge}
                                        </span>
                                        <h3 className="adm-title text-lg mt-2">
                                            {activeForm.title}
                                        </h3>
                                        <p className="text-xs adm-text-2 mt-1">
                                            {activeForm.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-12 gap-3">
                                        {activeForm.fields
                                            .filter((fld) => {
                                                if (
                                                    !fld.conditionalWings ||
                                                    fld.conditionalWings
                                                        .length === 0
                                                )
                                                    return true;
                                                if (!previewSelectedWing)
                                                    return false;
                                                return fld.conditionalWings.includes(
                                                    previewSelectedWing
                                                );
                                            })
                                            .map((fld) => {
                                                const colSpan =
                                                    previewViewport ===
                                                        "mobile" ||
                                                    fld.width === "full"
                                                        ? "col-span-12"
                                                        : fld.width === "half"
                                                        ? "col-span-6"
                                                        : "col-span-4";

                                                if (
                                                    fld.type ===
                                                    "section_header"
                                                ) {
                                                    return (
                                                        <div
                                                            key={fld.id}
                                                            className="col-span-12 pt-3 pb-1 border-b adm-divider"
                                                        >
                                                            <p className="text-xs font-bold uppercase tracking-wider adm-text-gold">
                                                                {fld.label}
                                                            </p>
                                                            {fld.helpText && (
                                                                <p className="text-[11px] adm-text-2 mt-0.5">
                                                                    {
                                                                        fld.helpText
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={fld.id}
                                                        className={`${colSpan} space-y-1`}
                                                    >
                                                        <label className="text-[11px] font-semibold adm-text-1 block">
                                                            {fld.label}{" "}
                                                            {fld.required && (
                                                                <span className="text-rose-500">
                                                                    *
                                                                </span>
                                                            )}
                                                        </label>

                                                        {fld.type ===
                                                        "wing_cards" ? (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                {config.wings
                                                                    .filter(
                                                                        (w) =>
                                                                            w.isActive
                                                                    )
                                                                    .map(
                                                                        (
                                                                            wing
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    wing.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setPreviewSelectedWing(
                                                                                        wing.id
                                                                                    )
                                                                                }
                                                                                className={`p-2.5 rounded-lg text-left border transition-all ${
                                                                                    previewSelectedWing ===
                                                                                    wing.id
                                                                                        ? "border-amber-500 bg-amber-500/10"
                                                                                        : "adm-card"
                                                                                }`}
                                                                            >
                                                                                <p className="text-xs font-bold adm-text-1">
                                                                                    {
                                                                                        wing.name
                                                                                    }
                                                                                </p>
                                                                                <p className="text-[10px] adm-text-2 line-clamp-1">
                                                                                    {
                                                                                        wing.tagline
                                                                                    }
                                                                                </p>
                                                                            </button>
                                                                        )
                                                                    )}
                                                            </div>
                                                        ) : fld.type ===
                                                          "textarea" ? (
                                                            <textarea
                                                                rows={2}
                                                                placeholder={
                                                                    fld.placeholder
                                                                }
                                                                className="adm-input text-xs"
                                                                readOnly
                                                            />
                                                        ) : fld.type ===
                                                              "select" ||
                                                          fld.type ===
                                                              "slot_picker" ||
                                                          fld.type ===
                                                              "monologue_picker" ? (
                                                            <select className="adm-input adm-select text-xs">
                                                                <option>
                                                                    Select{" "}
                                                                    {fld.label}
                                                                    ...
                                                                </option>
                                                                {(
                                                                    fld.options ||
                                                                    []
                                                                ).map((o) => (
                                                                    <option
                                                                        key={o}
                                                                    >
                                                                        {o}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                placeholder={
                                                                    fld.placeholder ||
                                                                    catalogInfoLabel(
                                                                        fld.type
                                                                    )
                                                                }
                                                                className="adm-input text-xs py-1.5"
                                                                readOnly
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    <div className="pt-3">
                                        <button
                                            type="button"
                                            className="adm-btn adm-btn-primary w-full text-xs py-2.5"
                                        >
                                            {activeForm.submitButtonText ||
                                                "Submit Application"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* SUB-MODULE 3: WINGS & CATEGORIES MANAGER                          */}
            {/* ================================================================= */}
            {subTab === "wings" && (
                <div className="space-y-6">
                    <div className="adm-card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <span className="adm-eyebrow">
                                SOCIETY DEPARTMENTS & AUDITION TRACKS
                            </span>
                            <h3 className="adm-h2 mt-1">
                                Swaang Wings & Categories ({config.wings.length})
                            </h3>
                            <p className="text-xs adm-text-2 mt-1">
                                These wings power the interactive <strong>Wing / Department Cards</strong> field and trigger wing-specific conditional questions automatically.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setConfig({
                                        ...config,
                                        wings: structuredClone(DEFAULT_WINGS)
                                    })
                                }
                                className="adm-btn adm-btn-ghost text-xs"
                            >
                                Reset Default 7 Wings
                            </button>
                            <button
                                type="button"
                                onClick={handleAddWing}
                                className="adm-btn adm-btn-gold text-xs"
                            >
                                <Plus className="w-4 h-4" />
                                + Add New Wing / Category
                            </button>
                            <button
                                type="button"
                                onClick={() => persistConfig(config)}
                                disabled={saving}
                                className="adm-btn adm-btn-primary text-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save Wings
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.wings.map((wing) => {
                            const colorMeta =
                                WING_COLORS.find((c) => c.id === wing.color) ||
                                WING_COLORS[0];

                            return (
                                <div
                                    key={wing.id}
                                    className="adm-card p-5 space-y-4"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`adm-badge ${colorMeta.badgeClass}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${colorMeta.dotClass}`}
                                                />
                                                {wing.name}
                                            </span>
                                            {wing.quota && (
                                                <span className="adm-badge adm-badge-neutral text-[10px]">
                                                    {wing.quota}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1.5 text-xs font-semibold adm-text-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={wing.isActive}
                                                    onChange={(e) =>
                                                        handleUpdateWing(
                                                            wing.id,
                                                            {
                                                                isActive:
                                                                    e.target
                                                                        .checked
                                                            }
                                                        )
                                                    }
                                                    className="rounded accent-emerald-500"
                                                />
                                                Active
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteWing(wing.id)
                                                }
                                                className="adm-btn adm-btn-danger p-1.5"
                                                title="Delete Wing"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="adm-label">
                                                Wing Name
                                            </label>
                                            <input
                                                type="text"
                                                value={wing.name}
                                                onChange={(e) =>
                                                    handleUpdateWing(wing.id, {
                                                        name: e.target.value
                                                    })
                                                }
                                                className="adm-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="adm-label">
                                                Short Tagline
                                            </label>
                                            <input
                                                type="text"
                                                value={wing.tagline}
                                                onChange={(e) =>
                                                    handleUpdateWing(wing.id, {
                                                        tagline: e.target.value
                                                    })
                                                }
                                                className="adm-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="adm-label">
                                                Seat Quota / Intake Badge
                                            </label>
                                            <input
                                                type="text"
                                                value={wing.quota || ""}
                                                onChange={(e) =>
                                                    handleUpdateWing(wing.id, {
                                                        quota: e.target.value
                                                    })
                                                }
                                                placeholder="e.g. 10–15 Seats"
                                                className="adm-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="adm-label">
                                                Card Accent Color
                                            </label>
                                            <select
                                                value={wing.color}
                                                onChange={(e) =>
                                                    handleUpdateWing(wing.id, {
                                                        color: e.target
                                                            .value as WingCategory["color"]
                                                    })
                                                }
                                                className="adm-input adm-select"
                                            >
                                                {WING_COLORS.map((c) => (
                                                    <option
                                                        key={c.id}
                                                        value={c.id}
                                                    >
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="adm-label">
                                            Wing Description (Shown on Form Cards)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={wing.description}
                                            onChange={(e) =>
                                                handleUpdateWing(wing.id, {
                                                    description: e.target.value
                                                })
                                            }
                                            className="adm-input"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* SUB-MODULE 4: FORM RESPONSES & DYNAMIC SHEET                      */}
            {/* ================================================================= */}
            {subTab === "responses" && (
                <div className="space-y-6">
                    {/* Filter & Export Bar */}
                    <div className="adm-card p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <span className="adm-eyebrow">
                                    DYNAMIC SUBMISSIONS EXPLORER
                                </span>
                                <h3 className="adm-h2 mt-1">
                                    Form Responses & Custom Answers ({filteredResponses.length})
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={handleExportDynamicCSV}
                                className="adm-btn adm-btn-gold text-xs"
                            >
                                <Download className="w-4 h-4" />
                                Export Dynamic CSV (Includes All Custom Questions)
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 adm-text-3 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={responseSearch}
                                    onChange={(e) =>
                                        setResponseSearch(e.target.value)
                                    }
                                    placeholder="Search name, ticket, branch, custom answer..."
                                    className="adm-input pl-9"
                                />
                            </div>

                            <select
                                value={responseFormFilter}
                                onChange={(e) =>
                                    setResponseFormFilter(e.target.value)
                                }
                                className="adm-input adm-select"
                            >
                                <option value="all">
                                    All Forms ({auditions.length})
                                </option>
                                {config.forms.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.title}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={responseWingFilter}
                                onChange={(e) =>
                                    setResponseWingFilter(e.target.value)
                                }
                                className="adm-input adm-select"
                            >
                                <option value="all">All Wings & Categories</option>
                                {config.wings.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={responseStatusFilter}
                                onChange={(e) =>
                                    setResponseStatusFilter(e.target.value)
                                }
                                className="adm-input adm-select"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending Review</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="selected">Selected / Inducted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Responses Split Table + Dossier Drawer */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div
                            className={`${
                                selectedSubmission
                                    ? "lg:col-span-7"
                                    : "lg:col-span-12"
                            } adm-card overflow-hidden`}
                        >
                            {filteredResponses.length === 0 ? (
                                <div className="p-12 text-center space-y-2">
                                    <FileSpreadsheet className="w-8 h-8 adm-text-3 mx-auto" />
                                    <p className="text-sm font-semibold adm-text-1">
                                        No form responses match your current filters
                                    </p>
                                    <p className="text-xs adm-text-2">
                                        Share your live form link or adjust the Form / Wing filters above.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto adm-scrollbar">
                                    <table className="adm-table w-full text-left">
                                        <thead>
                                            <tr>
                                                <th>Applicant</th>
                                                <th>Wing / Category</th>
                                                <th>Form & Ticket</th>
                                                <th>Custom Fields</th>
                                                <th>Status</th>
                                                <th className="text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResponses.map((sub) => {
                                                const customCount =
                                                    sub.customAnswers
                                                        ? Object.keys(
                                                              sub.customAnswers
                                                          ).length
                                                        : 0;
                                                const isSelected =
                                                    selectedSubmission?.id ===
                                                    sub.id;

                                                return (
                                                    <tr
                                                        key={sub.id}
                                                        onClick={() =>
                                                            setSelectedSubmission(
                                                                sub
                                                            )
                                                        }
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected
                                                                ? "adm-surface-2"
                                                                : ""
                                                        }`}
                                                    >
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                {sub.photoLink ? (
                                                                    <img
                                                                        src={
                                                                            sub.photoLink
                                                                        }
                                                                        alt={
                                                                            sub.name ||
                                                                            "Applicant"
                                                                        }
                                                                        className="w-9 h-9 rounded-lg object-cover border adm-divider"
                                                                    />
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-lg adm-surface-2 flex items-center justify-center text-xs font-bold adm-text-gold">
                                                                        {(
                                                                            sub.name ||
                                                                            "A"
                                                                        )
                                                                            .charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-xs font-bold adm-text-1">
                                                                        {sub.name ||
                                                                            "Unnamed Applicant"}
                                                                    </p>
                                                                    <p className="text-[11px] adm-text-2">
                                                                        {
                                                                            sub.branch
                                                                        }{" "}
                                                                        {sub.year
                                                                            ? `• ${sub.year}`
                                                                            : ""}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className="adm-badge adm-badge-gold text-[10px]">
                                                                {sub.wing ||
                                                                    sub.role ||
                                                                    "General"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <p className="text-xs font-semibold adm-text-1">
                                                                {sub.formTitle ||
                                                                    "Annual Auditions"}
                                                            </p>
                                                            <p className="text-[10px] font-mono adm-text-3">
                                                                #
                                                                {sub.ticketId ||
                                                                    sub.id
                                                                        .slice(
                                                                            0,
                                                                            8
                                                                        )
                                                                        .toUpperCase()}
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <span className="adm-badge adm-badge-neutral text-[10px]">
                                                                {customCount}{" "}
                                                                answers
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`adm-badge text-[10px] ${
                                                                    sub.status ===
                                                                    "selected"
                                                                        ? "adm-badge-emerald"
                                                                        : sub.status ===
                                                                          "shortlisted"
                                                                        ? "adm-badge-gold"
                                                                        : sub.status ===
                                                                          "rejected"
                                                                        ? "adm-badge-crimson"
                                                                        : "adm-badge-sky"
                                                                }`}
                                                            >
                                                                {(
                                                                    sub.status ||
                                                                    "pending"
                                                                ).toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                type="button"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setSelectedSubmission(
                                                                        sub
                                                                    );
                                                                }}
                                                                className="adm-btn adm-btn-outline text-[11px] py-1 px-2.5"
                                                            >
                                                                Inspect Dossier
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Expandable Full Custom Answers Dossier Drawer */}
                        {selectedSubmission && (
                            <div className="lg:col-span-5 adm-card p-6 space-y-5 sticky top-20 self-start max-h-[82vh] overflow-y-auto adm-scrollbar">
                                <div className="flex items-start justify-between gap-3 border-b adm-divider pb-4">
                                    <div className="flex items-center gap-3">
                                        {selectedSubmission.photoLink ? (
                                            <img
                                                src={
                                                    selectedSubmission.photoLink
                                                }
                                                alt={
                                                    selectedSubmission.name ||
                                                    "Applicant"
                                                }
                                                className="w-14 h-14 rounded-xl object-cover border adm-divider"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-xl adm-surface-2 flex items-center justify-center text-lg font-bold adm-text-gold">
                                                {(
                                                    selectedSubmission.name ||
                                                    "A"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <span className="adm-eyebrow">
                                                TICKET #
                                                {selectedSubmission.ticketId ||
                                                    selectedSubmission.id
                                                        .slice(0, 8)
                                                        .toUpperCase()}
                                            </span>
                                            <h4 className="adm-title text-lg">
                                                {selectedSubmission.name}
                                            </h4>
                                            <p className="text-xs adm-text-2">
                                                {selectedSubmission.email} •{" "}
                                                {selectedSubmission.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedSubmission(null)
                                        }
                                        className="adm-btn adm-btn-ghost p-1.5"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Status & Quick Follow-up */}
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            "pending",
                                            "shortlisted",
                                            "selected",
                                            "rejected"
                                        ].map((st) => (
                                            <button
                                                key={st}
                                                type="button"
                                                onClick={() =>
                                                    handleUpdateSubmissionStatus(
                                                        selectedSubmission.id,
                                                        st
                                                    )
                                                }
                                                data-active={
                                                    (selectedSubmission.status ||
                                                        "pending") === st
                                                }
                                                className="adm-chip text-[11px] py-1 px-2.5 uppercase font-bold"
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedSubmission.phone && (
                                        <a
                                            href={`https://wa.me/91${selectedSubmission.phone.replace(
                                                /\D/g,
                                                ""
                                            )}?text=${encodeURIComponent(
                                                `Hi ${selectedSubmission.name}, this is the Casting Desk at Swaang — The Dramatics Society regarding your application (${
                                                    selectedSubmission.formTitle ||
                                                    "Recruitment"
                                                }).`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="adm-btn adm-btn-gold text-xs py-1.5 px-3"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            WhatsApp Applicant
                                        </a>
                                    )}
                                </div>

                                {/* Core Summary Grid */}
                                <div className="grid grid-cols-2 gap-3 adm-panel p-3.5 text-xs">
                                    <div>
                                        <span className="adm-text-3 block text-[10px] uppercase font-bold">
                                            Form Submitted
                                        </span>
                                        <span className="adm-text-1 font-semibold">
                                            {selectedSubmission.formTitle ||
                                                "Annual Auditions"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="adm-text-3 block text-[10px] uppercase font-bold">
                                            Primary Wing / Role
                                        </span>
                                        <span className="adm-text-gold font-semibold">
                                            {selectedSubmission.wing ||
                                                selectedSubmission.role ||
                                                "—"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="adm-text-3 block text-[10px] uppercase font-bold">
                                            Branch & Year
                                        </span>
                                        <span className="adm-text-1 font-semibold">
                                            {selectedSubmission.branch || "—"}{" "}
                                            {selectedSubmission.year
                                                ? `(${selectedSubmission.year})`
                                                : ""}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="adm-text-3 block text-[10px] uppercase font-bold">
                                            Portfolio / Reel
                                        </span>
                                        {selectedSubmission.portfolio ? (
                                            <a
                                                href={
                                                    selectedSubmission.portfolio
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="adm-text-gold underline font-semibold inline-flex items-center gap-1"
                                            >
                                                Open Link{" "}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="adm-text-3">
                                                Not provided
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {selectedSubmission.experience && (
                                    <div className="adm-panel p-3.5 space-y-1">
                                        <span className="text-[10px] uppercase font-bold adm-text-3">
                                            Experience / Motivation
                                        </span>
                                        <p className="text-xs adm-text-1 whitespace-pre-wrap">
                                            {selectedSubmission.experience}
                                        </p>
                                    </div>
                                )}

                                {/* All Custom Questions & Answers */}
                                <div className="space-y-2.5">
                                    <span className="adm-eyebrow">
                                        ALL FORM QUESTIONS & CUSTOM ANSWERS
                                    </span>
                                    {selectedSubmission.customAnswers &&
                                    Object.keys(
                                        selectedSubmission.customAnswers
                                    ).length > 0 ? (
                                        <div className="space-y-2">
                                            {Object.entries(
                                                selectedSubmission.customAnswers
                                            ).map(([questionLabel, answer]) => (
                                                <div
                                                    key={questionLabel}
                                                    className="adm-panel p-3 space-y-1"
                                                >
                                                    <p className="text-[11px] font-bold adm-text-2">
                                                        {questionLabel}
                                                    </p>
                                                    <div className="text-xs adm-text-1 font-medium break-words">
                                                        {renderCustomAnswerValue(
                                                            answer
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs adm-text-3 italic">
                                            Submitted via standard form (all fields shown above).
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2 border-t adm-divider flex justify-between items-center">
                                    <span className="text-[11px] adm-text-3">
                                        ID: {selectedSubmission.id}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteSubmission(
                                                selectedSubmission.id
                                            )
                                        }
                                        className="adm-btn adm-btn-danger text-xs py-1 px-2.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete Response
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* MODAL 1: 19-TYPE QUESTION PICKER PALETTE                          */}
            {/* ================================================================= */}
            {showAddQuestionModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="adm-card max-w-4xl w-full max-h-[85vh] overflow-y-auto adm-scrollbar p-6 space-y-6">
                        <div className="flex items-center justify-between border-b adm-divider pb-4">
                            <div>
                                <span className="adm-eyebrow">
                                    QUESTION & WIDGET PALETTE
                                </span>
                                <h3 className="adm-title text-xl mt-0.5">
                                    Choose Question Type to Add (19 Types)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowAddQuestionModal(false)}
                                className="adm-btn adm-btn-ghost p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {(
                            [
                                "Standard Inputs",
                                "Choice & Categories",
                                "Theatre & Creative Widgets"
                            ] as const
                        ).map((category) => (
                            <div key={category} className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider adm-text-gold">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {FIELD_TYPE_CATALOG.filter(
                                        (item) => item.category === category
                                    ).map((item) => (
                                        <button
                                            key={item.type}
                                            type="button"
                                            onClick={() =>
                                                handleAddField(item.type)
                                            }
                                            className="adm-panel p-4 text-left hover:ring-2 hover:ring-amber-500/60 transition-all flex flex-col justify-between gap-2"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-bold adm-text-1">
                                                        {item.label}
                                                    </span>
                                                    <span className="adm-badge adm-badge-neutral text-[10px]">
                                                        + Add
                                                    </span>
                                                </div>
                                                <p className="text-[11px] adm-text-2 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* MODAL 2: STARTER THEATRE FORM TEMPLATES                           */}
            {/* ================================================================= */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="adm-card max-w-3xl w-full max-h-[85vh] overflow-y-auto adm-scrollbar p-6 space-y-5">
                        <div className="flex items-center justify-between border-b adm-divider pb-4">
                            <div>
                                <span className="adm-eyebrow">
                                    1-CLICK THEATRE PRESETS
                                </span>
                                <h3 className="adm-title text-xl mt-0.5">
                                    Create Form From Swaang Template
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTemplateModal(false)}
                                className="adm-btn adm-btn-ghost p-2"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {FORM_TEMPLATES.map((tpl) => (
                                <div
                                    key={tpl.id}
                                    className="adm-panel p-5 flex flex-col justify-between gap-4"
                                >
                                    <div className="space-y-2">
                                        <span className="adm-badge adm-badge-gold text-[10px]">
                                            {tpl.badge}
                                        </span>
                                        <h4 className="adm-h3 text-base">
                                            {tpl.title}
                                        </h4>
                                        <p className="text-xs adm-text-2">
                                            {tpl.description}
                                        </p>
                                        <p className="text-[11px] adm-text-3 font-mono">
                                            Includes {tpl.fields.length} pre-configured fields
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCreateFromTemplate(tpl)
                                        }
                                        className="adm-btn adm-btn-primary text-xs w-full"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Use This Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function catalogInfoLabel(type: JoinFieldType): string {
    return (
        FIELD_TYPE_CATALOG.find((c) => c.type === type)?.label ||
        "Enter response..."
    );
}

function renderCustomAnswerValue(val: unknown): React.ReactNode {
    if (val === null || val === undefined || val === "") {
        return <span className="adm-text-3 italic">No answer</span>;
    }
    if (typeof val === "boolean") {
        return val ? (
            <span className="adm-badge adm-badge-emerald text-[10px]">YES</span>
        ) : (
            <span className="adm-badge adm-badge-neutral text-[10px]">NO</span>
        );
    }
    if (Array.isArray(val)) {
        return (
            <div className="flex flex-wrap gap-1 mt-1">
                {val.map((item, idx) => (
                    <span
                        key={idx}
                        className="adm-badge adm-badge-gold text-[10px]"
                    >
                        {String(item)}
                    </span>
                ))}
            </div>
        );
    }
    const str = String(val);
    if (str.startsWith("http://") || str.startsWith("https://")) {
        return (
            <a
                href={str}
                target="_blank"
                rel="noopener noreferrer"
                className="adm-text-gold underline inline-flex items-center gap-1"
            >
                {str} <ExternalLink className="w-3 h-3" />
            </a>
        );
    }
    return str;
}
