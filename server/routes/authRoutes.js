import express from "express";
import {
  login,
  getMe,
  createWaiter,
  getWaiters,
  deleteWaiter,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/waiters", protect, authorize("admin"), createWaiter);
router.get("/waiters", protect, authorize("admin"), getWaiters);
router.delete("/waiters/:id", protect, authorize("admin"), deleteWaiter);

export default router;
