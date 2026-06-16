import Expense from "../models/Expense.js";

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

export const getExpenses = async (req, res) => {
  try {
    const filter = {};
    if (req.query.all !== "true") {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      filter.createdAt = { $gte: todayStart, $lte: todayEnd };
    }

    const expenses = await Expense.find(filter).sort({ createdAt: -1 }).limit(10);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { name, category, icon, amount } = req.body;

    if (!name || !category || amount == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const expense = await Expense.create({ name, category, icon, amount });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
