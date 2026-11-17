"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { Plus, Receipt, TrendingDown, Wallet, Trash2, Download, Filter, Sparkles } from "lucide-react";

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
    return onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Expenses listener notice:", err));
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

  const filtered = filterCat === "all"
    ? expenses
    : expenses.filter((e) => e.category === filterCat);

  return (
    <div className="space-y-8 text-left pb-20 w-full font-mono">
      {/* Header */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#06D6A0] text-black border-2 border-black shadow-[2px_2px_0px_black]">
              <Wallet size={20} />
            </span>
            <span className="font-black text-xs uppercase tracking-widest bg-black text-[#06D6A0] px-3 py-1 border-2 border-black">
              FINANCIAL LEDGER
            </span>
          </div>
          <h1 className="font-cinzel text-4xl md:text-6xl font-black uppercase tracking-tighter text-black leading-none">
            Production Finances
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-black/70 mt-2">
            Backstage budget forecasting, procurement expenses, costume allocations & receipts ledger.
          </p>
        </div>

        <button
          onClick={exportExpensesCSV}
          className="bg-white border-4 border-black px-6 py-4 font-black uppercase text-xs shadow-[4px_4px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download size={16} />
          Export CSV Report
        </button>
      </div>

      {/* 💰 TOP 3 BENTO STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Projected Budget */}
        <div className="bg-[#FFD166] border-4 border-black p-6 shadow-[8px_8px_0px_black] text-black relative flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-black text-[#FFD166] border-2 border-black shadow-[2px_2px_0px_black]">
              <Wallet size={24} />
            </div>
            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="text-[10px] font-black uppercase underline hover:text-[#FF5F5F] cursor-pointer"
            >
              {isEditingBudget ? "Done" : "Edit Cap"}
            </button>
          </div>

          <div>
            <span className="font-black text-[10px] uppercase opacity-70 block mb-1">
              Projected Show Budget
            </span>
            {isEditingBudget ? (
              <input
                type="number"
                value={projectedBudget}
                onChange={(e) => setProjectedBudget(Number(e.target.value))}
                className="w-full bg-white border-2 border-black p-2 font-black text-2xl"
              />
            ) : (
              <p className="text-4xl font-black tracking-tight">₹{projectedBudget.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-[#FF5F5F] border-4 border-black p-6 shadow-[8px_8px_0px_black] text-white flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-black text-[#FF5F5F] border-2 border-black shadow-[2px_2px_0px_white]">
              <TrendingDown size={24} />
            </div>
            <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase border border-white/20">
              {expenses.length} ENTRIES
            </span>
          </div>

          <div>
            <span className="font-black text-[10px] uppercase opacity-80 block mb-1">
              Total Production Spent
            </span>
            <p className="text-4xl font-black tracking-tight">₹{totalSpent.toLocaleString()}</p>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className={`border-4 border-black p-6 shadow-[8px_8px_0px_black] text-black flex flex-col justify-between ${remaining >= 0 ? "bg-[#06D6A0]" : "bg-red-400"}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-black text-[#06D6A0] border-2 border-black shadow-[2px_2px_0px_black]">
              <Receipt size={24} />
            </div>
            <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black uppercase">
              {remaining >= 0 ? "UNDER BUDGET" : "OVER BUDGET"}
            </span>
          </div>

          <div>
            <span className="font-black text-[10px] uppercase opacity-70 block mb-1">
              Remaining Runway
            </span>
            <p className="text-4xl font-black tracking-tight">₹{remaining.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* ✍️ LOG NEW EXPENSE FORM */}
      <form
        onSubmit={addExpense}
        className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-4 text-xs"
      >
        <div className="border-b-4 border-black pb-3">
          <h2 className="font-black text-base uppercase tracking-tight text-black flex items-center gap-2">
            <span className="w-3 h-3 bg-[#06D6A0] border border-black" />
            Record Backstage Procurement / Expense
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block font-black uppercase text-black mb-1">Expense Title / Item *</label>
            <input
              required
              type="text"
              placeholder="e.g. Stage Timber & Backdrop Paint"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white border-4 border-black p-3 font-black text-sm shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-black uppercase text-black mb-1">Amount (₹) *</label>
            <input
              required
              type="number"
              placeholder="e.g. 4500"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full bg-white border-4 border-black p-3 font-black text-sm shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block font-black uppercase text-black mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white border-4 border-black p-3 font-bold text-xs uppercase shadow-[3px_3px_0px_black] focus:shadow-none focus:translate-y-1 focus:translate-x-1 outline-none transition-all"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="text"
            placeholder="Optional Note or Vendor Details (e.g. Bhilai Timber Mart, Invoice #402)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="flex-1 w-full bg-white border-2 border-black p-3 font-medium text-xs"
          />

          <button
            type="submit"
            className="w-full sm:w-auto bg-[#06D6A0] text-black border-4 border-black px-8 py-3 font-black uppercase text-xs shadow-[4px_4px_0px_black] hover:bg-[#FFD166] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={3} />
            Add to Ledger
          </button>
        </div>
      </form>

      {/* FILTER & EXPENSE TABLE */}
      <div className="bg-[#FFF9F0] border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_black] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black uppercase text-black flex items-center gap-1.5">
              <Filter size={14} /> FILTER:
            </span>
            <button
              onClick={() => setFilterCat("all")}
              className={`px-3 py-1 font-black uppercase border-2 border-black transition-all ${
                filterCat === "all" ? "bg-black text-[#06D6A0]" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              All
            </button>
            {categories.slice(0, 5).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`px-3 py-1 font-black uppercase border-2 border-black transition-all ${
                  filterCat === c ? "bg-black text-[#06D6A0]" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <span className="font-black text-black/60 uppercase">
            Showing {filtered.length} of {expenses.length} items
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-gray-500 uppercase font-bold p-8 text-center">
            No expenses found in this category.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-4 border-black bg-black text-[#FFF9F0]">
                  <th className="p-3 uppercase">Date</th>
                  <th className="p-3 uppercase">Item / Title</th>
                  <th className="p-3 uppercase">Category</th>
                  <th className="p-3 uppercase">Note</th>
                  <th className="p-3 uppercase text-right">Amount</th>
                  <th className="p-3 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b-2 border-black/20 hover:bg-white transition-colors"
                  >
                    <td className="p-3 font-bold text-gray-600">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="p-3 font-black uppercase text-black text-sm">
                      {item.title}
                    </td>
                    <td className="p-3">
                      <span className="bg-[#FFD166] text-black px-2 py-0.5 border border-black font-black uppercase text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-gray-700">
                      {item.note || "—"}
                    </td>
                    <td className="p-3 font-black text-sm text-right text-black">
                      ₹{Number(item.amount).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteExpense(item.id, item.title)}
                        className="p-1.5 text-black hover:text-[#FF5F5F] hover:bg-red-50 border border-black transition-all cursor-pointer"
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