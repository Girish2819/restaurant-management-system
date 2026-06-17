import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { generatePassword, generateUsername } from "../utils/generateCredentials.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
      restaurantId: user.restaurantId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

export const createWaiter = async (req, res) => {
  try {
    const { name, phone, role, gender } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Member name is required" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ message: "Member phone number is required" });
    }

    const existingPhone = await User.findOne({ mobile: phone.trim() });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    const allowedRoles = ["waiter", "chef", "helper"];
    const memberRole = allowedRoles.includes(role) ? role : "waiter";
    const username = await generateUsername(name);
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const member = await User.create({
      name: name.trim(),
      mobile: phone.trim(),
      username,
      password: hashedPassword,
      role: memberRole,
      gender: gender || null,
      restaurantId: req.user.restaurantId || null,
      isVerified: true,
      isActive: true,
    });

    res.status(201).json({
      _id: member._id,
      name: member.name,
      username: member.username,
      mobile: member.mobile,
      role: member.role,
      generatedPassword: plainPassword,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Phone or username already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getWaiters = async (req, res) => {
  try {
    const filter = { role: { $ne: "admin" }, isActive: true };
    if (req.user.restaurantId) {
      filter.restaurantId = req.user.restaurantId;
    }

    const members = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWaiter = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    if (member.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }
    await User.deleteOne({ _id: member._id });
    res.json({ message: "Member profile deleted. Credentials are now invalid." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
