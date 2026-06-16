import { useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";

const CATEGORY_ICONS = {
  groceries: "🥬",
  utilities: "🔥",
  labour: "👥",
  other: "📦",
};

const AddExpense = ({ onAdded }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("groceries");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/expenses", {
        name,
        amount: Number(amount),
        category,
        icon: CATEGORY_ICONS[category] || "📦",
      });
      setName("");
      setAmount("");
      setCategory("groceries");
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 pb-5 border-b border-slate-200">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Add Expense</p>
      {error && (
        <p className="text-red-500 text-xs mb-2">{error}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          required
          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount ₹"
          required
          min="1"
          className="w-full sm:w-28 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="groceries">Groceries</option>
          <option value="utilities">Utilities</option>
          <option value="labour">Labour</option>
          <option value="other">Other</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "..." : "Add"}
        </button>
      </div>
    </form>
  );
};

const formatExpenseTime = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  if (isToday) {
    return `Today, ${date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const RecentExpenses = ({ expenses, onExpenseAdded }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
      Expenses
    </h2>

    <AddExpense onAdded={onExpenseAdded} />

    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense._id}
          className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
              {expense.icon}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 text-sm font-medium truncate">
                {expense.name}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {formatExpenseTime(expense.createdAt)}
              </p>
            </div>
          </div>
          <p className="text-amber-600 text-sm font-medium shrink-0">
            {formatCurrency(expense.amount)}
          </p>
        </div>
      ))}
      {expenses.length === 0 && (
        <p className="text-slate-600 text-sm text-center py-4">No expenses yet</p>
      )}
    </div>
  </div>
);

export default RecentExpenses;
