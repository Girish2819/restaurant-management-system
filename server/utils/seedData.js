import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Menu from "../models/Menu.js";

const menuItems = [
  { code: "ST01", name: "Simple Veg Thali", category: "Veg Thali", price: 80 },
  { code: "ST02", name: "Special Veg Thali", category: "Veg Thali", price: 150 },
  { code: "PBM01", name: "Paneer Butter Masala", category: "Paneer Dishes", price: 220 },
  { code: "PM01", name: "Paneer Masala", category: "Paneer Dishes", price: 200 },
  { code: "SP01", name: "Shahi Paneer", category: "Paneer Dishes", price: 260 },
  { code: "PDP01", name: "Paneer Do Pyaza", category: "Paneer Dishes", price: 240 },
  { code: "KP01", name: "Kadai Paneer", category: "Paneer Dishes", price: 260 },
  { code: "PL01", name: "Paneer Lababdar", category: "Paneer Dishes", price: 260 },
  { code: "PBH01", name: "Paneer Bhujia", category: "Paneer Dishes", price: 220 },
  { code: "MV01", name: "Mixed Veg", category: "Mixed Veg", price: 150 },
  { code: "KM01", name: "Kadai Mushroom", category: "Mixed Veg", price: 240 },
  { code: "MDP01", name: "Mushroom Do Pyaza", category: "Mixed Veg", price: 260 },
  { code: "MM01", name: "Mushroom Masala", category: "Mixed Veg", price: 210 },
  { code: "MBM01", name: "Mushroom Butter Masala", category: "Mixed Veg", price: 260 },
  { code: "VM01", name: "Veg Manchurian", category: "Chinese", price: 180 },
  { code: "CP01", name: "Chilli Paneer", category: "Chinese", price: 200 },
  { code: "CM01", name: "Chilli Mushroom", category: "Chinese", price: 240 },
  { code: "CBC01", name: "Chilli Baby Corn", category: "Chinese", price: 190 },
  { code: "CC01", name: "Chilli Chicken (8 pcs)", category: "Non-Veg Items", price: 220 },
  { code: "CL01", name: "Chicken Lollipop (8 pcs)", category: "Non-Veg Items", price: 220 },
  { code: "BCC01", name: "Boneless Chilli Chicken (8 pcs)", category: "Non-Veg Items", price: 240 },
  { code: "KC01", name: "Kadai Chicken (6 pcs)", category: "Non-Veg Items", price: 240 },
  { code: "DC01", name: "Desi Chicken (6 pcs)", category: "Non-Veg Items", price: 200 },
  { code: "CBM01", name: "Chicken Butter Masala (6 pcs)", category: "Non-Veg Items", price: 260 },
  { code: "AP01", name: "Aloo Paratha (per plate)", category: "Paratha", price: 120 },
  { code: "PP01", name: "Paneer Paratha (per plate)", category: "Paratha", price: 160 },
  { code: "EP01", name: "Egg Paratha (per plate)", category: "Paratha", price: 140 },
  { code: "KP02", name: "Keema Paratha (per plate)", category: "Paratha", price: 160 },
  { code: "MRJ01", name: "Mutton Rogan Josh (plate)", category: "Mutton", price: 180 },
  { code: "KM02", name: "Kadai Mutton (plate)", category: "Mutton", price: 260 },
  { code: "KMM01", name: "Keema Mutton (plate)", category: "Mutton", price: 210 },
  { code: "MK01", name: "Mutton Kebab", category: "Mutton", price: 800 },
  { code: "AM01", name: "Ahuna Mutton", category: "Mutton", price: 1100 },
];

const seedDatabase = async () => {
  const adminExists = await User.findOne({ role: "admin" });

  if (!adminExists) {
    const adminPassword = await bcrypt.hash("ashu123", 10);
    await User.create({
      name: "Ashutosh",
      username: "ashu123",
      mobile: "9999999999",
      password: adminPassword,
      role: "admin",
    });
    console.log("Default admin created: username ASHU / password ashu123");
  }

  const menuCount = await Menu.countDocuments();
  if (menuCount === 0) {
    await Menu.insertMany(menuItems);
    console.log(`Seeded ${menuItems.length} menu items`);
  }
};

export default seedDatabase;
