import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { formatCurrency } from "../utils/format";

const formatOrderTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const formatDateHeader = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const groupOrdersByDate = (orders) => {
  const groups = {};

  orders.forEach((order) => {
    const key = new Date(order.createdAt).toDateString();
    if (!groups[key]) {
      groups[key] = {
        label: formatDateHeader(order.createdAt),
        orders: [],
      };
    }
    groups[key].orders.push(order);
  });

  return Object.values(groups);
};

const WaiterDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const fetchOrders = async () => {
    try {
      const [ordersRes, countRes] = await Promise.all([
        api.get("/orders"),
        api.get("/orders/count"),
      ]);
      setOrders(ordersRes.data);
      setOrderCount(countRes.data.count);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      console.error("Failed to fetch menu items:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    const interval = setInterval(() => {
      fetchOrders();
      fetchMenuItems();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedMenuItem) {
      setOrderError("Select an item from the menu");
      return;
    }

    setOrderError("");
    setCartItems((prev) => [
      ...prev,
      { ...selectedMenuItem, quantity: 1 },
    ]);
    setSelectedMenuItem(null);
    setSearchQuery("");
  };

  const handleSelectMenuItem = (e) => {
    const item = menuItems.find((menuItem) => menuItem._id === e.target.value);
    setSelectedMenuItem(item || null);
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCompleteOrder = async () => {
    if (!cartItems.length) {
      setOrderError("Add at least one menu item");
      return;
    }

    setOrderError("");
    setSubmitting(true);

    try {
      await api.post("/orders", { items: cartItems });
      setCartItems([]);
      await fetchOrders();
    } catch (err) {
      setOrderError(err.response?.data?.message || "Failed to save order");
    } finally {
      setSubmitting(false);
    }
  };

  const groupedOrders = groupOrdersByDate(orders);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
          <div>
            <h1 className="font-serif text-2xl text-slate-900 mb-1">
              Hello, {user?.name}
            </h1>
            <p className="text-slate-600 text-sm">@{user?.username}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            Logout
          </button>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 text-center shadow-sm">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            Total Orders
          </p>
          <p className="text-5xl font-semibold text-slate-900">{orderCount}</p>
          <p className="text-slate-600 text-xs mt-2">completed by you</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
            New Order
          </h2>

          <form onSubmit={handleAddItem} className="grid gap-2 md:grid-cols-[1fr_240px_120px] items-end mb-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-2">Search menu</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-slate-300"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-2">Menu item</label>
              <select
                value={selectedMenuItem?.name || ""}
                onChange={handleSelectMenuItem}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-slate-300"
              >
                <option value="">Select menu item</option>
                {menuItems
                  .filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.code} — {item.name} — ₹{item.price}
                    </option>
                  ))}
              </select>
            </div>
            <button
              type="submit"
              className="h-12 px-5 bg-slate-900 border border-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
            >
              Add
            </button>
          </form>
          {selectedMenuItem && (
            <div className="text-sm text-slate-600 mb-4">
              Price: <span className="font-semibold text-slate-900">₹{selectedMenuItem.price}</span>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="mb-4">
              <div className="space-y-2 mb-3">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5"
                  >
                    <span className="text-sm text-slate-900">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-emerald-600">
                        {formatCurrency(item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-600">
                  Total: <span className="text-slate-900 font-medium">{formatCurrency(cartTotal)}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Complete Order"}
                </button>
              </div>
            </div>
          )}

          {orderError && (
            <p className="text-red-400 text-xs">{orderError}</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
            Order History
          </h2>

          {groupedOrders.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">
              No completed orders yet
            </p>
          ) : (
            <div className="space-y-6">
              {groupedOrders.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    {group.label}
                  </p>
                  <div className="space-y-3">
                    {group.orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="text-slate-900 text-sm font-medium">
                            {order.orderLabel}
                          </p>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {formatOrderTime(order.createdAt)}
                          </p>
                        </div>
                        <p className="text-emerald-600 text-sm font-medium shrink-0">
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;
