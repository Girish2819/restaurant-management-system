import Menu from "../models/Menu.js";

export const getMenuItems = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Menu.find(filter).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const { code, name, category, price } = req.body;

    if (!code || !name || !category || price == null) {
      return res.status(400).json({ message: "All menu fields are required" });
    }

    const existing = await Menu.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Menu code already exists" });
    }

    const menuItem = await Menu.create({
      code: code.toUpperCase(),
      name,
      category,
      price: Number(price),
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Menu.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({ message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (price == null) {
      return res.status(400).json({ message: "Price is required" });
    }

    const item = await Menu.findById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    item.price = Number(price);
    await item.save();

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
