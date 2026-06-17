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
  const videoRef = useRef(null);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative min-h-screen overflow-hidden">
  {/* Background Video */}
  <video
    ref={videoRef}
    autoPlay
    loop
    muted
    playsInline
    className="absolute inset-0 h-full w-full object-cover"
  >
    <source src="/videos/restaurant-bg.mp4" type="video/mp4" />
  </video>

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/60" />

  {/* Content */}
  <div className="relative z-10">
    <div className="max-w-4xl mx-auto px-6 py-8">

      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
         <button
  type="button"
  onClick={() => navigate("/admin")}
  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-emerald-500 hover:text-slate-950 hover:scale-105 transition-all duration-300 shadow-lg"
>
  <span className="text-xl">←</span>
</button>

          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white mb-1">
              Admin Order Board
            </h1>

            <p className="text-white/70 text-sm">
              Place orders directly when waiters are unavailable.
            </p>
          </div>
        </div>

        <div className="text-xs text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
          })}
        </div>
      </header>

      {/* New Order Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6 shadow-2xl">
        <h2 className="text-sm font-semibold text-white mb-4">
          New Order
        </h2>

        <form onSubmit={handleCompleteOrder} className="mb-4">
          <div className="relative mb-4" ref={dropdownRef}>
            <label className="text-xs font-semibold text-white/70 mb-2 block">
              Search & select item
            </label>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name, code or category..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />

            {showDropdown && searchQuery && (
              <div className="absolute z-10 w-full mt-1 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 border-b border-white/10 last:border-b-0 transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">
                          {item.code} — {item.name}
                        </p>

                        <p className="text-white/60 text-xs">
                          {item.category}
                        </p>
                      </div>

                      <p className="text-emerald-400 font-semibold">
                        ₹{item.price}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-center text-white/60 text-sm">
                    No items found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Keep your existing cartItems section exactly as it is */}

          {orderError && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-xs">
              {orderError}
            </div>
          )}
        </form>
      </div>

      {/* Order History Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white">
            Order History
          </h2>

          <span className="text-xs text-white/60">
            Total completed: {orderCount}
          </span>
        </div>

        {/* Keep your existing Order History code exactly as it is */}
      </div>

    </div>
  </div>
</div>
  );
};

export default AdminTakeOrder;
