import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const AdminTakeOrder = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleSelectItem = (item) => {
    const existingItem = cartItems.find((cart) => cart._id === item._id);
    if (existingItem) {
      setCartItems((prev) =>
        prev.map((cart) =>
          cart._id === item._id
            ? { ...cart, quantity: cart.quantity + 1 }
            : cart
        )
      );
    } else {
      setCartItems((prev) => [...prev, { ...item, quantity: 1 }]);
    }
    setSearchQuery("");
    setShowDropdown(false);
    setOrderError("");
  };

  const handleUpdateQuantity = (index, delta) => {
    setCartItems((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      setOrderError("Add at least one menu item");
      return;
    }

    setOrderError("");
    setSubmitting(true);

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          _id: item._id,
          name: item.name,
          code: item.code,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
        })),
        orderType: "dine-in",
      };
      const response = await api.post("/orders", orderPayload);
      setCartItems([]);
      setSearchQuery("");
      await fetchOrders();
      alert("Order saved successfully!");
    } catch (err) {
      console.error("Order error:", err);
      setOrderError(
        err.response?.data?.message || "Failed to save order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const groupedOrders = groupOrdersByDate(orders);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading admin order page...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="text-xl text-slate-600 hover:text-slate-900 transition"
            >
              ← Back
            </button>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1">
                Admin Order Board
              </h1>
              <p className="text-slate-600 text-sm">
                Place orders directly when waiters are unavailable.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-4 py-2">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">New Order</h2>
          <form onSubmit={handleCompleteOrder} className="mb-4">
            <div className="relative mb-4" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-500 mb-2 block">Search & select item</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by name, code or category..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:border-slate-300"
              />
              {showDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {item.code} — {item.name}
                          </p>
                          <p className="text-xs text-slate-500">{item.category}</p>
                        </div>
                        <p className="text-sm font-semibold text-emerald-600 ml-2 shrink-0">
                          ₹{item.price}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-slate-500 text-sm">
                      No items found
                    </div>
                  )}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mb-4">
                <div className="space-y-3 mb-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.code}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, -1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-sm font-medium text-slate-900 min-w-max">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(index, 1)}
                            className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-emerald-600 min-w-max">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-red-500 text-lg transition"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total amount</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(cartTotal)}</p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    {submitting ? "Saving..." : "Complete Order"}
                  </button>
                </div>
              </div>
            )}

            {orderError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {orderError}
              </div>
            )}
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Order History</h2>
            <span className="text-xs text-slate-500">Total completed: {orderCount}</span>
          </div>
          {groupedOrders.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No completed orders yet</p>
          ) : (
            <div className="space-y-6">
              {groupedOrders.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{group.label}</p>
                  <div className="space-y-3">
                    {group.orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="text-slate-900 text-sm font-medium">{order.orderLabel}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{formatOrderTime(order.createdAt)}</p>
                        </div>
                        <p className="text-emerald-600 text-sm font-medium shrink-0">{formatCurrency(order.amount)}</p>
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

export default AdminTakeOrder;
