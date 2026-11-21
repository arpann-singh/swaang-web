"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export default function IdentityHub() {
  const [data, setData] = useState<any>({ styles: {} });

  useEffect(() => {
    return onSnapshot(doc(db, "settings", "homepage"), (d) => {
      setData(d.data() || { styles: {} });
    });
  }, []);

  const syncData = async () => {
    await setDoc(doc(db, "settings", "homepage"), data, { merge: true });
    alert("Directorate Identity Synced!");
  };

  const HubCard = ({ title, prefix, badge }: any) => (
    <div className="adm-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-adm-line pb-3">
        <h3 className="adm-h2">{title}</h3>
        <span className={`adm-badge ${badge}`}>{prefix}</span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="adm-label">Name</label>
          <input
            className="adm-input"
            placeholder="Name"
            value={data[`${prefix}Name`] || ""}
            onChange={(e) => setData({ ...data, [`${prefix}Name`]: e.target.value })}
          />
        </div>
        <div>
          <label className="adm-label">Stage Message</label>
          <textarea
            className="adm-input"
            placeholder="Stage Message"
            value={data[`${prefix}Note`] || ""}
            onChange={(e) => setData({ ...data, [`${prefix}Note`]: e.target.value })}
          />
        </div>
        <div>
          <label className="adm-label">Photo URL (ImgBB)</label>
          <input
            className="adm-input text-xs"
            placeholder="Photo URL (ImgBB)"
            value={data[`${prefix}Image`] || ""}
            onChange={(e) => setData({ ...data, [`${prefix}Image`]: e.target.value })}
          />
        </div>
      </div>

      <button type="button" onClick={syncData} className="adm-btn adm-btn-primary w-full">
        Sync {title}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6">
        <p className="adm-eyebrow">The Face of Swaang</p>
        <h1 className="adm-title mt-1">Identity Hub</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <HubCard title="Main Founder" prefix="founder" badge="adm-badge-accent" />
        <HubCard title="Co-Founder 1" prefix="coFounder1" badge="adm-badge-success" />
        <HubCard title="Co-Founder 2" prefix="coFounder2" badge="adm-badge-danger" />
      </div>
    </div>
  );
}
