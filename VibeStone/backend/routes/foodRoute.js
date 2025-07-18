// filepath: d:\Study\VibeStone\VibeStone\VibeStone\backend\routes\foodRoute.js
import express from "express";
import { listFood, addFood, removeFood, editFood } from "../controllers/foodController.js";

const router = express.Router();

router.get("/list", listFood);
router.post("/add", addFood);
router.post("/remove", removeFood);
router.post("/edit", editFood);  // ← Bỏ middleware upload, chỉ xử lý JSON

export default router;