"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { Plus, Receipt, TrendingDown, Wallet, Trash2, Download, Filter } from "lucide-react";

export default function BudgetManager() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projectedBudget, setProjectedBudget] = useState(75000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [form, setForm] = useState({ title: "", amount: "", category: "Props", note: "" });

  const categories = [
    "Props",
    "Costumes",
    "Stage & Set",
    "Sound & Light",
    "Marketing & Posters",
    "Logistics & Travel",
    "Refreshments",
    "Miscellaneous",
  ];

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (err) => console.warn("Expenses listener notice:", err)
    );
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const remaining = projectedBudget - totalSpent;

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    try {
      await addDoc(collection(db, "expenses"), {
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        note: form.note || "",
        createdAt: Date.now(),
      });
      setForm({ title: "", amount: "", category: "Props", note: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding expense.");
    }
  };

  const deleteExpense = async (id: string, title: string) => {
    if (confirm(`Remove expense "${title}"?`)) {
      await deleteDoc(doc(db, "expenses", id));
    }
  };

  const exportExpensesCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses recorded yet!");
      return;
    }
    const headers = ["Title", "Category", "Amount (INR)", "Note", "Date"];
    const rows = expenses.map((e) => [
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${e.category || "Uncategorized"}"`,
      e.amount || 0,
      `"${(e.note || "").replace(/"/g, '""')}"`,
      `"${e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "N/A"}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Swaang_Budget_Report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const filtered =
    filterCat === "all"
      ? expenses
      : expenses.filter((e) => e.category === filterCat);

  return (
    <div className="space-y-6 text-left w-full">
      {/* Header */}
      <div className="adm-card p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={15} className="text-adm-accent-text" />
            <span className="adm-eyebrow">Financial Ledger</span>
          </div>
          <h1 className="adm-title">Production Finances</h1>
          <p className="adm-muted mt-1">
            Backstage budget forecasting, procurement expenses, costume allocations & receipts ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={exportExpensesCSV}
          className="adm-btn adm-btn-secondary w-full md:w-auto"
        >
          <Download size={15} className="text-adm-accent-text" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* 💰 TOP 3 BENTO STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Projected Budget */}
        <div className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-adm-accent/15 border border-adm-accent/35 flex items-center justify-center text-adm-accent-text">
              <Wallet size={19} />
            </div>
            <button
              type="button"
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="adm-btn adm-btn-secondary adm-btn-sm"
            >
              {isEditingBudget ? "Done" : "Edit Cap"}
            </button>
          </div>

          <div>
            <span className="adm-muted block mb-1">Projected Show Budget</span>
            {isEditingBudget ? (
              <input
                type="number"
                value={projectedBudget}
                onChange={(e) => setProjectedBudget(Number(e.target.value))}
                className="adm-input font-bold text-xl"
              />
            ) : (
              <p className="font-display text-3xl sm:text-4xl font-bold text-adm-fg">
                ₹{projectedBudget.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Total Spent */}
        <div className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-adm-danger/12 border border-adm-danger/30 flex items-center justify-center text-adm-danger">
              <TrendingDown size={19} />
            </div>
            <span className="adm-badge adm-badge-neutral">{expenses.length} Entries</span>
          </div>

          <div>
            <span className="adm-muted block mb-1">Total Production Spent</span>
            <p className="font-display text-3xl sm:text-4xl font-bold text-adm-fg">
              ₹{totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="adm-card p-5 flex flex-col justify-between gap-4">
          <div className="flex justify-between items-center">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                remaining >= 0
                  ? "bg-adm-success/12 text-adm-success border-adm-success/30"
                  : "bg-adm-danger/12 text-adm-danger border-adm-danger/30"
              }`}
            >
              <Receipt size={19} />
            </div>
            <span className={`adm-badge ${remaining >= 0 ? "adm-badge-success" : "adm-badge-danger"}`}>
              {remaining >= 0 ? "Under Budget" : "Over Budget"}
            </span>
          </div>

          <div>
            <span className="adm-muted block mb-1">Remaining Runway</span>
            <p
              className={`font-display text-3xl sm:text-4xl font-bold ${
                remaining >= 0 ? "text-adm-success" : "text-adm-danger"
              }`}
            >
              ₹{remaining.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* ✍️ LOG NEW EXPENSE FORM */}
      <form onSubmit={addExpense} className="adm-card p-5 sm:p-7 space-y-4">
        <div className="border-b border-adm-line pb-3">
          <h2 className="adm-h2">Record Backstage Procurement / Expense</h2>
          <p className="adm-muted">Log bills, vendor invoices, and production purchases</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="adm-label">Expense Title / Item *</label>
            <input
              required
              type="text"
              placeholder="e.g. Stage Timber & Backdrop Paint"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="adm-input"
            />
          </div>

          <div>
            <label className="adm-label">Amount (₹) *</label>
            <input
              required
              type="number"
              placeholder="e.g. 4500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="adm-input"
            />
          </div>

          <div>
            <label className="adm-label">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="adm-input"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="text"
            placeholder="Optional Note or Vendor Details (e.g. Bhilai Timber Mart, Invoice #402)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="adm-input flex-1"
          />

          <button type="submit" className="adm-btn adm-btn-primary shrink-0">
            <Plus size={16} />
            <span>Add to Ledger</span>
          </button>
        </div>
      </form>

      {/* FILTER & EXPENSE TABLE */}
      <div className="adm-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-adm-line flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto adm-scroll-x">
            <span className="text-xs font-semibold text-adm-fg-3 flex items-center gap-1.5 mr-1">
              <Filter size={13} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilterCat("all")}
              data-active={filterCat === "all" ? "true" : "false"}
              className="adm-chip"
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCat(c)}
                data-active={filterCat === c ? "true" : "false"}
                className="adm-chip"
              >
                {c}
              </button>
            ))}
          </div>

          <span className="adm-badge adm-badge-neutral">
            Showing {filtered.length} of {expenses.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center adm-muted">
            No expenses found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item / Title</th>
                  <th>Category</th>
                  <th>Note</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap text-xs text-adm-fg-3">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="font-semibold text-adm-fg">{item.title}</td>
                    <td>
                      <span className="adm-badge adm-badge-accent">{item.category}</span>
                    </td>
                    <td className="text-xs text-adm-fg-3">{item.note || "—"}</td>
                    <td className="font-mono font-bold text-right text-adm-fg whitespace-nowrap">
                      ₹{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => deleteExpense(item.id, item.title)}
                        className="adm-btn adm-btn-danger adm-btn-icon adm-btn-sm"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}