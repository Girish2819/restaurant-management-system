import express from "express";
import { getExpenses, createExpense } from "../controllers/expenseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/", getExpenses);
router.post("/", createExpense);

export default router;
