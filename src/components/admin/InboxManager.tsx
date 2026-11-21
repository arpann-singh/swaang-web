"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Mail, Phone, Trash2, Check, Inbox } from "lucide-react";

export default function InboxManager({ messages: initialMessages }: { messages?: any[] }) {
  const [messages, setMessages] = useState<any[]>(initialMessages || []);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        console.warn("Falling back to JS sorting", error);
        onSnapshot(collection(db, "messages"), (fallbackSnap) => {
          const fetched = fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
          fetched.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
          setMessages(fetched);
        });
      }
    );

    return () => unsub();
  }, []);

  const markAsRead = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "unread" ? "read" : "unread";
      await updateDoc(doc(db, "messages", id), { status: newStatus });
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (err) {
      alert("Failed to delete message.");
    }
  };

  return (
    <div className="space-y-6 text-left w-full">
      <div className="adm-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="adm-eyebrow">Direct Messages</p>
          <h2 className="adm-title mt-1">Communications & Inbox</h2>
          <p className="adm-muted mt-1">
            Review inquiries, sponsorship proposals, and event invitations submitted from the public contact page.
          </p>
        </div>
        <span className="adm-badge adm-badge-accent">
          {messages.length} {messages.length === 1 ? "Message" : "Messages"}
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {messages.length === 0 ? (
          <div className="col-span-full py-16 text-center adm-card p-8">
            <Inbox size={36} className="mx-auto text-adm-fg-3 mb-2" />
            <p className="adm-h3">The inbox is empty</p>
            <p className="adm-muted mt-1">New messages from the contact form will appear here in real time.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUnread = msg.status === "unread";
            return (
              <div
                key={msg.id}
                className={`adm-card p-5 sm:p-6 flex flex-col justify-between gap-4 transition-all ${
                  isUnread ? "border-adm-accent/50" : "opacity-90"
                }`}
              >
                <div>
                  {/* Header: Name, Date, Status */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3.5 border-b border-adm-line">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-display font-bold text-xl text-adm-fg leading-tight">
                          {msg.name}
                        </h3>
                        {isUnread && (
                          <span className="adm-badge adm-badge-danger">Unread</span>
                        )}
                      </div>
                      <p className="text-xs text-adm-fg-3 mt-1">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "Unknown Date"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => markAsRead(msg.id, msg.status)}
                      className={`adm-btn adm-btn-sm ${
                        isUnread ? "adm-btn-primary" : "adm-btn-secondary"
                      }`}
                    >
                      <Check size={13} />
                      <span>{isUnread ? "Mark as Read" : "Mark Unread"}</span>
                    </button>
                  </div>

                  {/* Subject */}
                  <h4 className="adm-h3 text-adm-accent-text mb-3 border-l-2 border-adm-accent pl-3">
                    {msg.subject || "General Inquiry"}
                  </h4>

                  {/* Contact Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex-1 adm-panel px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-adm-fg hover:border-adm-line-strong transition-colors overflow-hidden"
                    >
                      <span className="font-semibold flex items-center gap-1.5 shrink-0 text-adm-info">
                        <Mail size={13} />
                        <span>Email</span>
                      </span>
                      <span className="truncate text-adm-fg-2">{msg.email}</span>
                    </a>

                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="flex-1 adm-panel px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs text-adm-fg hover:border-adm-line-strong transition-colors"
                      >
                        <span className="font-semibold flex items-center gap-1.5 text-adm-accent-text">
                          <Phone size={13} />
                          <span>Call</span>
                        </span>
                        <span className="font-mono text-adm-fg-2">{msg.phone}</span>
                      </a>
                    )}
                  </div>

                  {/* The Message Body */}
                  <div className="adm-panel p-4 text-sm text-adm-fg-2 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-adm-line flex justify-end">
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg.id)}
                    className="adm-btn adm-btn-danger adm-btn-sm"
                  >
                    <Trash2 size={13} />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}