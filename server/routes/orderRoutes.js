import express from "express";
import {
  getOrders,
  getRecentOrders,
  createOrder,
  getWaiterOrderCount,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getOrders);
router.get("/count", getWaiterOrderCount);
router.get("/recent", authorize("admin"), getRecentOrders);
router.post("/", authorize("waiter", "admin"), createOrder);

export default router;
