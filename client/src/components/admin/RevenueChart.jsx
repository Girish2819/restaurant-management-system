import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/format";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-md">
      <p className="text-slate-600 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="mb-0.5">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

const RevenueChart = ({ data, period, onPeriodChange }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
        Revenue vs Expenses
      </h2>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            Expenses
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Labour
          </span>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          {["week", "month"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
                period === p
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="w-full h-[300px] min-w-0">
      <ResponsiveContainer width="99%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => (v > 0 ? `₹${(v / 1000).toFixed(0)}k` : "₹0")}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: "#22c55e", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: "#f97316", r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="labour"
            name="Labour"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: "#3b82f6", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default RevenueChart;
