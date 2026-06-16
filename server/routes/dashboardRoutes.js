import express from "express";
import {
  getDashboardStats,
  getChartData,
  resetTodayData,
} from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/chart", getChartData);
router.post("/reset-today", resetTodayData);

export default router;
