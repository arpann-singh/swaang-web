"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, doc, deleteDoc } from "firebase/firestore";
import { Plus, Receipt, TrendingDown, Wallet } from "lucide-react";

export default function BudgetManager() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projectedBudget, setProjectedBudget] = useState(50000); 
  const [form, setForm] = useState({ title: "", amount: "", category: "Props" });

  useEffect(() => {
    const q = query(collection(db, "expenses"));
    return onSnapshot(q, (snap) => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const remaining = projectedBudget - totalSpent;

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "expenses"), { 
      ...form, 
      amount: Number(form.amount), 
      createdAt: Date.now() 
    });
    setForm({ title: "", amount: "", category: "Props" });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFD166] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_black]">
          <div className="flex justify-between items-start mb-4">
            <Wallet size={32} />
            <span className="font-black text-[10px] uppercase opacity-60">Total Budget</span>
          </div>
          <p className="text-4xl font-black italic">₹{projectedBudget.toLocaleString()}</p>
        </div>
        
        <div className="bg-[#FF5F5F] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_black] text-white">
          <div className="flex justify-between items-start mb-4">
            <TrendingDown size={32} />
            <span className="font-black text-[10px] uppercase opacity-60 text-white/80">Total Spent</span>
          </div>
          <p className="text-4xl font-black italic">₹{totalSpent.toLocaleString()}</p>
        </div>

        <div className="bg-[#06D6A0] border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_black]">
          <div className="flex justify-between items-start mb-4">
            <Receipt size={32} />
            <span className="font-black text-[10px] uppercase opacity-60">Remaining</span>
          </div>
          <p className="text-4xl font-black italic">₹{remaining.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <form onSubmit={addExpense} className="bg-white border-4 border-black p-8 rounded-[2.5rem] shadow-[10px_10px_0px_black] space-y-4 sticky top-10">
            <h3 className="font-black uppercase text-xl italic mb-4">Log Expense</h3>
            <input required type="text" placeholder="Bill Description" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            <input required type="number" placeholder="Amount (INR)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold bg-[#FFF9F0]" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-black uppercase text-xs">
              <option>Props</option>
              <option>Costumes</option>
              <option>Makeup</option>
              <option>Refreshments</option>
              <option>Marketing</option>
            </select>
            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#FF5F5F] transition-colors">
              Record Transaction
            </button>
          </form>
        </div>

        <div className="lg:col-span-8 bg-white border-4 border-black rounded-[2.5rem] shadow-[10px_10px_0px_#06D6A0] overflow-hidden">
          <div className="p-6 border-b-4 border-black bg-gray-50 flex justify-between items-center">
            <h3 className="font-black uppercase tracking-widest text-sm">Audit Ledger</h3>
            <span className="text-[10px] font-bold opacity-40">{expenses.length} Entries</span>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-6 border-b-2 border-gray-100 hover:bg-[#FFF9F0] transition-colors">
                <div>
                  <p className="font-black uppercase text-sm">{exp.title}</p>
                  <p className="text-[9px] font-bold text-[#FF5F5F] uppercase tracking-widest">{exp.category} • {new Date(exp.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-black text-xl">₹{exp.amount}</span>
                  <button onClick={() => deleteDoc(doc(db, "expenses", exp.id))} className="text-gray-300 hover:text-red-500 transition-colors text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}