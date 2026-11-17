"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Save, 
  Undo2, 
  Redo2, 
  AlertTriangle, 
  Check, 
  Lock, 
  Unlock, 
  Eye, 
  Maximize2,
  Trash2,
  ArrowRight
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { verifyAdminAccess } from "@/lib/authConfig";
import { DirtyField, InspectorHistoryStep } from "./types";

export default function VisualInspectorOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Hover & Active Target state
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredMeta, setHoveredMeta] = useState<{ docPath: string; field: string; tag: string } | null>(null);
  const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);

  // Dirty fields tracking & history for Undo/Redo
  const [dirtyFields, setDirtyFields] = useState<Record<string, DirtyField>>({});
  const [history, setHistory] = useState<InspectorHistoryStep[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState<{
    element: HTMLImageElement;
    docPath: string;
    field: string;
    currentSrc: string;
  } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Publish / Save State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // 1. Verify Admin Clearance on Mount
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const hasAccess = await verifyAdminAccess(currentUser);
        setIsAdmin(hasAccess);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  // 2. Global Shortcut: Ctrl+Shift+E / Cmd+Shift+E or ?inspect=true
  useEffect(() => {
    // Check URL query parameter ?inspect=true
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("inspect") === "true") {
        if (isAdmin) {
          setIsActive(true);
        } else {
          setShowAuthWarning(true);
        }
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Inspect Mode: Ctrl + Shift + E or Cmd + Shift + E
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        if (isAdmin) {
          setIsActive((prev) => !prev);
        } else {
          setShowAuthWarning(true);
        }
      }

      // Undo: Ctrl+Z (when active)
      if (isActive && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (when active)
      if (isActive && ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" || (e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")) {
        e.preventDefault();
        handleRedo();
      }

      // Escape to close active editing / modals
      if (e.key === "Escape") {
        if (activeImageModal) setActiveImageModal(null);
        if (isDiffOpen) setIsDiffOpen(false);
        if (editingElement) {
          editingElement.blur();
          setEditingElement(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdmin, isActive]);

  // Helper to find CMS target
  const getCmsTarget = useCallback((el: HTMLElement | null): { target: HTMLElement; docPath: string; field: string; type: "text" | "image" } | null => {
    let current: HTMLElement | null = el;
    while (current && current !== document.body) {
      if (current.dataset.cmsField) {
        const field = current.dataset.cmsField;
        const docPath = current.dataset.cmsDoc || current.closest<HTMLElement>("[data-cms-doc]")?.dataset.cmsDoc || "settings/homepage";
        const isImage = current.tagName === "IMG" || current.dataset.cmsType === "image";
        return {
          target: current,
          docPath,
          field,
          type: isImage ? "image" : "text",
        };
      }
      current = current.parentElement;
    }
    return null;
  }, []);

  // 3. Mousemove & Hover Bounding Box Listener
  useEffect(() => {
    if (!isActive) {
      setHoveredRect(null);
      setHoveredMeta(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (activeImageModal || isDiffOpen) return;

      const target = e.target as HTMLElement;
      // Ignore inspector elements
      if (target.closest("[data-cms-inspector-ui]")) {
        setHoveredRect(null);
        setHoveredMeta(null);
        return;
      }

      const match = getCmsTarget(target);
      if (match) {
        const rect = match.target.getBoundingClientRect();
        setHoveredRect(rect);
        setHoveredMeta({
          docPath: match.docPath,
          field: match.field,
          tag: match.target.tagName,
        });
      } else {
        setHoveredRect(null);
        setHoveredMeta(null);
      }
    };

    const handleScroll = () => {
      setHoveredRect(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isActive, activeImageModal, isDiffOpen, getCmsTarget]);

  // 4. Click Listener: Enable Inline Text Edit or Image Replacer
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("[data-cms-inspector-ui]")) return;

      const match = getCmsTarget(target);
      if (!match) return;

      e.preventDefault();
      e.stopPropagation();

      const { target: cmsEl, docPath, field, type } = match;

      if (type === "image" && cmsEl.tagName === "IMG") {
        const img = cmsEl as HTMLImageElement;
        setActiveImageModal({
          element: img,
          docPath,
          field,
          currentSrc: img.src,
        });
        setNewImageUrl(img.src);
      } else if (type === "text") {
        // Text editing with contentEditable
        setEditingElement(cmsEl);
        cmsEl.contentEditable = "true";
        cmsEl.focus();

        const initialText = cmsEl.innerText.trim();
        const fieldKey = `${docPath}::${field}`;

        // Save original value if not already dirty
        if (!dirtyFields[fieldKey]) {
          setDirtyFields((prev) => ({
            ...prev,
            [fieldKey]: {
              docPath,
              field,
              oldValue: initialText,
              newValue: initialText,
              label: field,
            },
          }));
        }

        const handleBlur = () => {
          cmsEl.contentEditable = "false";
          setEditingElement(null);
          const newText = cmsEl.innerText.trim();

          if (newText !== initialText) {
            recordChange(docPath, field, initialText, newText);
          }
          cmsEl.removeEventListener("blur", handleBlur);
        };

        cmsEl.addEventListener("blur", handleBlur);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isActive, dirtyFields, getCmsTarget]);

  // Push to history for Undo/Redo
  const recordChange = (docPath: string, field: string, oldValue: any, newValue: any) => {
    const fieldKey = `${docPath}::${field}`;
    const updated = {
      ...dirtyFields,
      [fieldKey]: {
        docPath,
        field,
        oldValue,
        newValue,
        label: field,
      },
    };
    setDirtyFields(updated);

    // Append to history stack
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ dirtyFields: updated });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      setDirtyFields(prevStep.dirtyFields);
      setHistoryIndex(historyIndex - 1);
    } else if (historyIndex === 0) {
      setDirtyFields({});
      setHistoryIndex(-1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      setDirtyFields(nextStep.dirtyFields);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Image replacement apply
  const handleApplyImage = () => {
    if (!activeImageModal || !newImageUrl.trim()) return;
    const { element, docPath, field, currentSrc } = activeImageModal;

    element.src = newImageUrl.trim();
    recordChange(docPath, field, currentSrc, newImageUrl.trim());
    setActiveImageModal(null);
  };

  // Discard all changes & reload DOM
  const handleDiscardAll = () => {
    if (confirm("Discard all unsaved changes and reload original content?")) {
      window.location.reload();
    }
  };

  // 5. Publish to Firestore
  const handlePublish = async () => {
    const keys = Object.keys(dirtyFields);
    if (keys.length === 0) return;

    setIsPublishing(true);
    try {
      // Group updates by docPath
      const groups: Record<string, Record<string, any>> = {};

      Object.values(dirtyFields).forEach((item) => {
        if (!groups[item.docPath]) groups[item.docPath] = {};
        groups[item.docPath][item.field] = item.newValue;
      });

      // Write to Firestore documents
      for (const [docPath, payload] of Object.entries(groups)) {
        const parts = docPath.split("/");
        if (parts.length === 2) {
          const [collectionName, docId] = parts;
          await setDoc(doc(db, collectionName, docId), payload, { merge: true });
        }
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setDirtyFields({});
        setHistory([]);
        setHistoryIndex(-1);
        setIsDiffOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error("Visual Inspector publish error:", err);
      alert(`Publish failed: ${err?.message || "Missing or insufficient permissions."}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const dirtyCount = Object.keys(dirtyFields).length;

  return (
    <>
      {/* ============================================================== */}
      {/* ⚠️ AUTHENTICATION CLEARANCE WARNING BANNER                     */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showAuthWarning && (
          <motion.div
            data-cms-inspector-ui
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-black text-white border-4 border-[#FF5F5F] px-6 py-4 shadow-[8px_8px_0px_#FF5F5F] font-mono flex items-center gap-4 max-w-lg"
          >
            <AlertTriangle className="text-[#FF5F5F] shrink-0" size={24} />
            <div className="text-left text-xs">
              <p className="font-black uppercase tracking-wider text-white">
                ADMIN CLEARANCE REQUIRED
              </p>
              <p className="text-gray-300 mt-1">
                Visual Inspect Mode is reserved for club directors. Please sign in at{" "}
                <a href="/admin" className="text-[#FFD166] underline font-bold">
                  /admin
                </a>{" "}
                to unlock in-place editing.
              </p>
            </div>
            <button
              onClick={() => setShowAuthWarning(false)}
              className="text-white hover:text-[#FF5F5F] ml-auto p-1"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 🎯 HOVER OUTLINE & FLOATING CMS TAG PILL                       */}
      {/* ============================================================== */}
      {isActive && hoveredRect && hoveredMeta && (
        <div
          data-cms-inspector-ui
          className="pointer-events-none fixed z-[9998] transition-all duration-75"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
            border: "2px dashed #06D6A0",
            boxShadow: "0 0 0 2px black, inset 0 0 0 1px rgba(6, 214, 160, 0.2)",
            backgroundColor: "rgba(6, 214, 160, 0.05)",
          }}
        >
          {/* Floating Pill Header */}
          <div
            className="absolute -top-7 left-0 bg-black text-[#06D6A0] border-2 border-black px-2 py-0.5 font-mono font-black text-[10px] uppercase tracking-wider whitespace-nowrap shadow-[2px_2px_0px_black] flex items-center gap-1.5"
            style={{ transform: "translateY(-2px)" }}
          >
            <span className="text-[#FFD166] font-bold">{hoveredMeta.tag}</span>
            <span className="text-gray-400">::</span>
            <span className="text-white">{hoveredMeta.docPath}</span>
            <span className="text-gray-400">➔</span>
            <span>{hoveredMeta.field}</span>
            <span className="text-gray-400 font-normal">
              ({Math.round(hoveredRect.width)}×{Math.round(hoveredRect.height)})
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ⚡ FLOATING SWAANG STUDIO DOCK (Bottom Controls)                */}
      {/* ============================================================== */}
      {isActive && (
        <motion.div
          data-cms-inspector-ui
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-black text-white border-4 border-black px-5 py-3.5 shadow-[10px_10px_0px_#FFD166] flex flex-wrap items-center gap-4 font-mono max-w-[95vw] select-none"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-2 pr-2 border-r-2 border-white/20">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-pulse" />
            <span className="font-black text-xs uppercase tracking-widest text-[#06D6A0]">
              STUDIO INSPECT
            </span>
          </div>

          {/* Dirty Changes Count */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider border border-black ${
                dirtyCount > 0 ? "bg-[#FF5F5F] text-white animate-bounce" : "bg-gray-800 text-gray-400"
              }`}
            >
              {dirtyCount} UNSAVED {dirtyCount === 1 ? "CHANGE" : "CHANGES"}
            </span>
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex < 0}
              title="Undo (Ctrl+Z)"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 flex items-center justify-center transition-all text-white"
            >
              <Undo2 size={15} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
              className="w-8 h-8 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed border border-white/20 flex items-center justify-center transition-all text-white"
            >
              <Redo2 size={15} />
            </button>
          </div>

          {/* Visual Diff Modal Trigger */}
          {dirtyCount > 0 && (
            <button
              onClick={() => setIsDiffOpen(true)}
              className="px-3 py-1.5 bg-[#FFF9F0] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_white] hover:bg-[#FFD166] transition-all flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>DIFF</span>
            </button>
          )}

          {/* Discard All */}
          {dirtyCount > 0 && (
            <button
              onClick={handleDiscardAll}
              title="Discard all changes"
              className="px-2.5 py-1.5 bg-red-950 text-red-300 hover:bg-red-900 border border-red-500 font-bold uppercase text-[10px] tracking-wider transition-all"
            >
              DISCARD
            </button>
          )}

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={dirtyCount === 0 || isPublishing}
            className={`px-5 py-2 font-black uppercase text-xs tracking-widest border-2 border-black shadow-[3px_3px_0px_white] transition-all flex items-center gap-2 ${
              publishSuccess
                ? "bg-[#06D6A0] text-black"
                : dirtyCount > 0
                ? "bg-[#06D6A0] hover:bg-[#FFD166] text-black cursor-pointer active:translate-y-0.5"
                : "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700 shadow-none"
            }`}
          >
            {isPublishing ? (
              <span>PUBLISHING...</span>
            ) : publishSuccess ? (
              <>
                <Check size={14} strokeWidth={3} />
                <span>PUBLISHED!</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>PUBLISH LIVE</span>
              </>
            )}
          </button>

          {/* Exit Inspector */}
          <button
            onClick={() => setIsActive(false)}
            title="Exit Inspector Mode (Ctrl+Shift+E)"
            className="w-8 h-8 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white border border-white/20 flex items-center justify-center transition-all ml-1"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* 🖼️ DIRECT IMAGE REPLACER MODAL                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeImageModal && (
          <div
            data-cms-inspector-ui
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#FFF9F0] text-black border-8 border-black p-6 md:p-8 shadow-[16px_16px_0px_#06D6A0] max-w-xl w-full font-mono relative"
            >
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-white border-2 border-black flex items-center justify-center font-black hover:bg-[#FF5F5F] hover:text-white transition-all shadow-[2px_2px_0px_black]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-black text-[#06D6A0] px-3 py-1 text-xs font-black uppercase tracking-wider">
                  IMAGE REPLACER
                </span>
                <span className="text-xs text-gray-600 font-bold">
                  {activeImageModal.field}
                </span>
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                SWAP PRODUCTION IMAGE
              </h3>

              {/* Current Preview */}
              <div className="border-4 border-black aspect-video w-full bg-black mb-4 overflow-hidden shadow-[4px_4px_0px_black]">
                <img
                  src={newImageUrl || activeImageModal.currentSrc}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = activeImageModal.currentSrc;
                  }}
                />
              </div>

              {/* Input for Image URL */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-black uppercase tracking-wider block">
                  New Image Source (URL / ImgBB / Storage):
                </label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border-4 border-black p-3 font-mono font-bold text-xs shadow-[3px_3px_0px_black] focus:outline-none focus:bg-yellow-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="flex-1 bg-white border-4 border-black py-3 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_black] hover:bg-gray-100 transition-all"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleApplyImage}
                  className="flex-1 bg-[#06D6A0] text-black border-4 border-black py-3 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_black] hover:bg-[#FFD166] transition-all"
                >
                  APPLY TO CANVAS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 🔍 VISUAL DIFF MODAL                                           */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isDiffOpen && (
          <div
            data-cms-inspector-ui
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#FFF9F0] text-black border-8 border-black p-6 md:p-8 shadow-[16px_16px_0px_#FF5F5F] max-w-3xl w-full max-h-[85vh] overflow-y-auto font-mono relative text-left"
            >
              <button
                onClick={() => setIsDiffOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 bg-white border-2 border-black flex items-center justify-center font-black hover:bg-[#FF5F5F] hover:text-white transition-all shadow-[2px_2px_0px_black]"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[#FF5F5F] text-white px-3 py-1 text-xs font-black uppercase tracking-wider">
                  VISUAL DIFF COMPARISON
                </span>
                <span className="text-xs font-bold text-gray-600">
                  {dirtyCount} pending {dirtyCount === 1 ? "write" : "writes"}
                </span>
              </div>

              <h3 className="text-3xl font-black uppercase tracking-tight mb-6">
                REVIEW UNCOMMITTED CHANGES
              </h3>

              <div className="space-y-4 mb-6">
                {Object.entries(dirtyFields).map(([key, item]) => (
                  <div
                    key={key}
                    className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_black]"
                  >
                    <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
                      <span className="bg-black text-[#FFD166] px-2 py-0.5 text-[10px] font-black uppercase">
                        {item.docPath}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#FF5F5F]">
                        FIELD: {item.field}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-red-50 border-2 border-red-300 p-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block mb-1">
                          - BEFORE:
                        </span>
                        <p className="font-bold text-gray-800 break-words whitespace-pre-wrap">
                          {String(item.oldValue)}
                        </p>
                      </div>

                      <div className="bg-green-50 border-2 border-green-300 p-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-green-700 block mb-1">
                          + AFTER (NEW):
                        </span>
                        <p className="font-black text-black break-words whitespace-pre-wrap">
                          {String(item.newValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-4 border-black">
                <button
                  onClick={() => setIsDiffOpen(false)}
                  className="bg-white border-4 border-black px-6 py-3 font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_black] hover:bg-gray-100 transition-all"
                >
                  KEEP EDITING
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-[#06D6A0] text-black border-4 border-black px-8 py-3 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_black] hover:bg-[#FFD166] transition-all flex items-center gap-2"
                >
                  <Save size={14} />
                  <span>PUBLISH TO FIRESTORE</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
