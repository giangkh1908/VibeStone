import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import uploadRouter from "./routes/uploadRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import facebookDataDeletionRoute from "./routes/facebookDataDeletion.js";

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  })
);
app.options("*", cors());

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api", analyzeRoutes);
app.use("/api", facebookDataDeletionRoute);

app.get("/", (req, res) => {
  res.json({
    message: "API Working - VibeStone Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend kết nối thành công!",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware - cập nhật để hiển thị chi tiết lỗi
app.use((err, req, res, next) => {
  console.error("❌ Server Error Details:");
  console.error("Error Message:", err.message);
  console.error("Error Stack:", err.stack);
  console.error("Request URL:", req.url);
  console.error("Request Method:", req.method);
  console.error("Request Body:", req.body);
  console.error("Request Headers:", req.headers);

  res.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi server",
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});

export default app;
