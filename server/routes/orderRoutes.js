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
router.get("/count", authorize("waiter"), getWaiterOrderCount);
router.get("/recent", authorize("admin"), getRecentOrders);
router.post("/", authorize("waiter"), createOrder);

export default router;
