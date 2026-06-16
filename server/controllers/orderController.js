import Order from "../models/Order.js";

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

const buildOrderLabel = (items) =>
  items.map((item) => item.name).join(", ");

export const getOrders = async (req, res) => {
  try {
    const filter = { status: "done" };

    if (req.user.role === "waiter") {
      filter.waiter = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate("waiter", "name username")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const filter = { status: "done" };
    if (req.query.all !== "true") {
      filter.createdAt = { $gte: todayStart, $lte: todayEnd };
    }

    const orders = await Order.find(filter)
      .populate("waiter", "name username")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, orderType = "dine-in" } = req.body;

    if (!items?.length) {
      return res
        .status(400)
        .json({ message: "Add at least one menu item to the order" });
    }

    const amount = items.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity || 1),
      0
    );

    const order = await Order.create({
      orderLabel: buildOrderLabel(items),
      orderType,
      amount,
      items,
      status: "done",
      waiter: req.user._id,
    });

    const populated = await Order.findById(order._id).populate(
      "waiter",
      "name username"
    );

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWaiterOrderCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({
      waiter: req.user._id,
      status: "done",
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
