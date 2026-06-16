import User from "../models/User.js";

export const generatePassword = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
};

export const generateUsername = async (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || "waiter";

  let username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
  let exists = await User.findOne({ username });

  while (exists) {
    username = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    exists = await User.findOne({ username });
  }

  return username;
};
