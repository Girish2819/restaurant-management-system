import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import MenuItemSearch from "../components/MenuItemSearch";
import CartItemsList from "../components/CartItemsList";
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
  const videoRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
    }
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

  const handleCompleteOrder = async () => {
    if (!cartItems.length) {
      setOrderError("Add at least one menu item");
      return;
    }

    setOrderError("");
    setSubmitting(true);

    try {
      await api.post("/orders", {
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        orderType: "dine-in",
      });
      setCartItems([]);
      await fetchOrders();
    } catch (err) {
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
    <div className="relative min-h-screen">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="fixed inset-0 h-full w-full object-cover -z-20"
      >
        <source src="/videos/restaurant-bg.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/60 -z-10" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-emerald-500 transition min-h-[44px] min-w-[44px]"
              aria-label="Back to dashboard"
            >
              ←
            </button>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-white">Place Order</h1>
              <p className="text-white/60 text-sm">Admin order board</p>
            </div>
          </div>
          <span className="text-xs text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
            {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
          </span>
        </header>

        <div className="relative z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 mb-4 shadow-xl overflow-visible">
          <h2 className="text-sm font-semibold text-white mb-4">New Order</h2>

          <MenuItemSearch
            menuItems={menuItems}
            onSelect={handleSelectItem}
            label="Search & select item"
            labelClassName="text-white/70"
            placeholder="Type item name, code or category..."
            inputClassName="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 min-h-[48px]"
          />

          <CartItemsList
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            cartTotal={cartTotal}
            onComplete={handleCompleteOrder}
            submitting={submitting}
            variant="glass"
          />

          {orderError && (
            <p className="text-red-300 text-sm mt-3">{orderError}</p>
          )}
        </div>

        <div className="relative z-0 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Order History</h2>
            <span className="text-xs text-slate-500">Total completed: {orderCount}</span>
          </div>

          {groupedOrders.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">No completed orders yet</p>
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
                        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <p className="text-slate-900 text-sm font-medium break-words">
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

export default AdminTakeOrder;
