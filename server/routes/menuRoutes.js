import express from "express";
import {
  getMenuItems,
  createMenuItem,
  deleteMenuItem,
  updateMenuItem,
} from "../controllers/menuController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.get("/", getMenuItems);
router.post("/", authorize("admin"), createMenuItem);
router.put("/:id", authorize("admin"), updateMenuItem);
router.delete("/:id", authorize("admin"), deleteMenuItem);

export default router;
