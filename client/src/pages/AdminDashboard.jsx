import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import KpiCards from "../components/admin/KpiCards";
import RecentOrders from "../components/admin/RecentOrders";
import RecentExpenses from "../components/admin/RecentExpenses";
import RevenueChart from "../components/admin/RevenueChart";
import CreateWaiterModal from "../components/admin/CreateWaiterModal";
import WaiterList from "../components/admin/WaiterList";
import MenuManager from "../components/admin/MenuManager";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("week");
  const [showWaiterModal, setShowWaiterModal] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, ordersRes, expensesRes, chartRes, waitersRes] =
        await Promise.all([
          api.get("/dashboard/stats"),
          api.get(`/orders/recent?all=${showAllRecords}`),
          api.get(`/expenses?all=${showAllRecords}`),
          api.get(`/dashboard/chart?period=${chartPeriod}`),
          api.get("/auth/waiters"),
        ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setExpenses(expensesRes.data);
      setChartData(chartRes.data);
      setWaiters(waitersRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [chartPeriod, showAllRecords]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-slate-900 mb-1">
              {getGreeting()}, {user?.name || "Chef"} 👨‍🍳
            </h1>
            <p className="text-slate-600 text-sm">
              Here&apos;s how your restaurant is performing today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-4 py-2">
              {today}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setShowAllRecords(false)}
                className={`text-xs font-medium rounded-full px-3 py-2 transition ${
                  !showAllRecords
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setShowAllRecords(true)}
                className={`text-xs font-medium rounded-full px-3 py-2 transition ${
                  showAllRecords
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
            </div>
            {/* <button
              type="button"
              onClick={() => setShowWaiterModal(true)}
              className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              + Add Waiter
            </button> */}
            {/* <button
              type="button"
              onClick={logout}
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Logout
            </button> */}
          </div>
        </header>

        <div className="mb-6">
          <KpiCards stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentOrders orders={orders} />
          <RecentExpenses expenses={expenses} onExpenseAdded={fetchData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueChart
              data={chartData}
              period={chartPeriod}
              onPeriodChange={setChartPeriod}
            />
          </div>
          <WaiterList waiters={waiters} onRefresh={fetchData} onAddWaiter={() => setShowWaiterModal(true)} />
        </div>

        <div className="mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Menu Manager</h2>
                <p className="text-slate-600 text-sm">Manage menu items on a dedicated page.</p>
              </div>
              <div>
                <a
                  href="/admin/menu-manager"
                  className="text-xs bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Open Menu Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10 mb-10">
      <button
        type="button"
        onClick={logout}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
      >
        Logout
      </button>
    </div>

      <CreateWaiterModal
        isOpen={showWaiterModal}
        onClose={() => setShowWaiterModal(false)}
        onCreated={fetchData}
      />
    </div>
  );
};

export default AdminDashboard;
