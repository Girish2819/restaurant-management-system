import { formatCurrency } from "../../utils/format";

const KpiCard = ({ label, value, subtext, subtextColor = "text-emerald-600" }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className="text-2xl font-semibold text-slate-900 mb-1">{value}</p>
    {subtext && (
      <p className={`text-xs ${subtextColor}`}>{subtext}</p>
    )}
  </div>
);

const KpiCards = ({ stats }) => {
  const s = stats || {
    totalOrders: 0,
    ordersDiff: 0,
    totalRevenue: 0,
    revenueChange: 0,
    totalExpenses: 0,
    expenseChange: 0,
    labourCost: 0,
    staffOnShift: 0,
    netProfit: 0,
    margin: 0,
  };

  const ordersDiffText =
    s.ordersDiff >= 0 ? `+${s.ordersDiff} vs yesterday` : `${s.ordersDiff} vs yesterday`;

  const revenueChangeText =
    s.revenueChange > 0
      ? `+${s.revenueChange}% vs yesterday`
      : s.revenueChange < 0
        ? `${s.revenueChange}% vs yesterday`
        : "No change vs yesterday";

  const expenseChangeText =
    s.expenseChange > 0
      ? `+${s.expenseChange}% vs yesterday`
      : s.expenseChange < 0
        ? `${s.expenseChange}% vs yesterday`
        : "No change vs yesterday";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Total Orders"
        value={s.totalOrders}
        
      />
      <KpiCard
        label="Total Revenue"
        value={formatCurrency(s.totalRevenue)}
        
      />
      <KpiCard
        label="Total Expenses"
        value={formatCurrency(s.totalExpenses)}
        
      />
      <KpiCard
        label="Staff Cost"
        value={formatCurrency(s.labourCost)}
        subtext={`${s.staffOnShift} staff on shift`}
        subtextColor="text-blue-600"
      />
      <KpiCard
        label="Net Profit"
        value={formatCurrency(s.netProfit)}
        
      />
    </div>
  );
};

export default KpiCards;
