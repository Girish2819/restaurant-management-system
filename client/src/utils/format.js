const formatCurrency = (amount) =>
  `₹${amount.toLocaleString("en-IN")}`;

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hrs ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const formatOrderType = (type) => {
  const map = {
    "dine-in": "Dine-in",
    takeaway: "Takeaway",
    delivery: "Delivery",
  };
  return map[type] || type;
};

const statusStyles = {
  pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  in_kitchen: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  done: "bg-green-500/20 text-green-400 border-green-500/30",
};

const statusLabels = {
  pending: "PENDING",
  in_kitchen: "IN KITCHEN",
  done: "DONE",
};

export {
  formatCurrency,
  formatTimeAgo,
  formatOrderType,
  statusStyles,
  statusLabels,
};
