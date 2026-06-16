import { formatCurrency } from "../../utils/format";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const RecentOrders = ({ orders }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
      Recent Orders
    </h2>
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 last:border-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="text-slate-900 text-sm font-medium truncate">
              {order.orderLabel}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {formatDateTime(order.createdAt)}
              {order.waiter?.name && ` · ${order.waiter.name}`}
            </p>
          </div>
          <p className="text-emerald-600 text-sm font-medium shrink-0">
            {formatCurrency(order.amount)}
          </p>
        </div>
      ))}
      {orders.length === 0 && (
        <p className="text-slate-600 text-sm text-center py-4">No orders yet</p>
      )}
    </div>
  </div>
);

export default RecentOrders;
