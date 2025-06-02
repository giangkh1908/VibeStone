// filepath: d:\Study\VibeStone\VibeStone\VibeStone\backend\routes\foodRoute.js
import express from "express";
import { listFood, addFood, removeFood, editFood } from "../controllers/foodController.js";
import { upload, uploadToCloudinary } from "../middleware/upload.js";

const router = express.Router();

router.get("/list", listFood);
router.post("/add", upload.single('image'), uploadToCloudinary, addFood);
router.post("/remove", removeFood);
router.post("/edit", upload.single('image'), uploadToCloudinary, editFood);

export default router;