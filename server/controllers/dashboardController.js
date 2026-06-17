import Order from "../models/Order.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const [todayOrders, yesterdayOrders, todayExpenses, yesterdayExpenses] =
      await Promise.all([
        Order.find({
          status: "done",
          createdAt: { $gte: todayStart, $lte: todayEnd },
        }),
        Order.find({
          status: "done",
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        }),
        Expense.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Expense.find({
          createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
        }),
      ]);

    const totalOrders = todayOrders.length;
    const yesterdayOrderCount = yesterdayOrders.length;
    const ordersDiff = totalOrders - yesterdayOrderCount;

    const totalRevenue = todayOrders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    const yesterdayRevenue = yesterdayOrders.reduce(
      (sum, o) => sum + o.amount,
      0
    );

    const revenueChange =
      yesterdayRevenue > 0
        ? Math.round(
          ((totalRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        )
        : 0;

    // Staff Cost
    const labourExpenses = todayExpenses
      .filter((e) => e.category?.toLowerCase() === "staff")
      .reduce((sum, e) => sum + e.amount, 0);

    // Expenses excluding Staff Cost
    const totalExpenses = todayExpenses
      .filter((e) => e.category?.toLowerCase() !== "staff")
      .reduce((sum, e) => sum + e.amount, 0);

    const yesterdayExpenseTotal = yesterdayExpenses
      .filter((e) => e.category?.toLowerCase() !== "staff")
      .reduce((sum, e) => sum + e.amount, 0);

    const expenseChange =
      yesterdayExpenseTotal > 0
        ? Math.round(
          ((totalExpenses - yesterdayExpenseTotal) /
            yesterdayExpenseTotal) *
          100
        )
        : 0;

    console.log("Today's Expenses:", todayExpenses);

    const staffOnShift = await User.countDocuments({
      role: "waiter",
      isActive: true,
    });

    // Profit = Revenue - Expenses - Staff Cost
    const netProfit =
      totalRevenue - totalExpenses - labourExpenses;

    const margin =
      totalRevenue > 0
        ? Math.round((netProfit / totalRevenue) * 100)
        : 0;
    res.json({
      totalOrders,
      ordersDiff,
      totalRevenue,
      revenueChange,
      totalExpenses,
      expenseChange,
      labourCost: labourExpenses,
      staffOnShift,
      netProfit,
      margin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { period = "week" } = req.query;
    const days = period === "month" ? 30 : 7;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const [orders, expenses] = await Promise.all([
        Order.find({
          status: "done",
          createdAt: { $gte: dayStart, $lte: dayEnd },
        }),
        Expense.find({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
      ]);

      const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
      const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
      const labour = expenses
        .filter((e) => e.category?.toLowerCase() === "staff")
        .reduce((sum, e) => sum + e.amount, 0);

      const label =
        period === "month"
          ? date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
          : date.toLocaleDateString("en-IN", { weekday: "short" });

      data.push({
        label,
        revenue,
        expenses: expenseTotal,
        labour,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetTodayData = async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const ordersResult = await Order.deleteMany({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });
    const expensesResult = await Expense.deleteMany({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    res.json({
      message: "Today orders and expenses have been reset.",
      deletedOrders: ordersResult.deletedCount,
      deletedExpenses: expensesResult.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
