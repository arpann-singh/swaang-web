"use client";

import { useState, useRef } from "react";
import { ExternalLink, RotateCw, Monitor, Smartphone, Tablet, Eye, Sparkles } from "lucide-react";

export default function VisualInspectorTab() {
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[400px]";
      case "tablet":
        return "max-w-[800px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Banner */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 shadow-[8px_8px_0px_black] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-[#FF5F5F] text-white border-2 border-black shadow-[2px_2px_0px_black]">
              <Sparkles size={20} />
            </span>
            <h1 className="font-cinzel text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
              Visual Studio Inspector
            </h1>
          </div>
          <p className="font-mono text-xs font-bold text-black/70 mt-1 uppercase tracking-wider">
            Point, click & live-edit website content in real time. Hover bounding box, in-place text & image replacement.
          </p>
        </div>

        {/* Viewport & External Launch Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Viewport Switcher */}
          <div className="flex items-center border-4 border-black bg-white shadow-[4px_4px_0px_black]">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-2 transition-all ${
                viewport === "desktop" ? "bg-[#06D6A0] text-black font-black" : "hover:bg-gray-100"
              }`}
              title="Desktop View"
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-2 border-l-4 border-black transition-all ${
                viewport === "tablet" ? "bg-[#06D6A0] text-black font-black" : "hover:bg-gray-100"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-2 border-l-4 border-black transition-all ${
                viewport === "mobile" ? "bg-[#06D6A0] text-black font-black" : "hover:bg-gray-100"
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone size={18} />
            </button>
          </div>

          {/* Reload Iframe */}
          <button
            onClick={reloadIframe}
            className="flex items-center gap-2 px-3 py-2 border-4 border-black bg-white font-mono font-black text-xs uppercase shadow-[4px_4px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            title="Reload Live Preview"
          >
            <RotateCw size={14} />
            Reload
          </button>

          {/* Open Full Screen */}
          <a
            href="/?inspect=true"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 border-4 border-black bg-[#FF5F5F] text-white font-mono font-black text-xs uppercase shadow-[4px_4px_0px_black] hover:bg-black hover:text-[#06D6A0] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            <ExternalLink size={14} />
            Open Full Window
          </a>
        </div>
      </div>

      {/* Guide Tips Bar */}
      <div className="bg-[#FFD166] border-4 border-black p-4 shadow-[6px_6px_0px_black] flex flex-wrap items-center justify-between gap-4 font-mono text-xs font-black text-black">
        <div className="flex items-center gap-2">
          <Eye size={16} />
          <span>INSPECT MODE SHORTCUT: <kbd className="bg-black text-white px-2 py-0.5 border border-black shadow-[2px_2px_0px_white]">Ctrl + Shift + E</kbd></span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>✏️ Click text to edit in-place</span>
          <span>🖼️ Click photo to swap image</span>
          <span>💾 Floating dock saves & publishes to Firestore</span>
        </div>
      </div>

      {/* Live Preview Iframe Container */}
      <div className="w-full flex justify-center bg-black/40 p-4 border-4 border-black shadow-[8px_8px_0px_black] rounded-none">
        <div className={`w-full transition-all duration-300 ${getViewportWidth()} flex justify-center`}>
          <div className="w-full h-[800px] border-8 border-black bg-white shadow-[12px_12px_0px_black] overflow-hidden relative">
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src="/?inspect=true"
              title="Swaang Visual Inspector Live Preview"
              className="w-full h-full border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
