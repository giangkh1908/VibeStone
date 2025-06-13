import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import userManagementRouter from "./routes/userRoutes.js";
import foodRouter from "./routes/foodRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";
import feedbackRouter from "./routes/feedbackRoute.js";

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
  origin: ['https://www.vibestoneoficial.store', 'http://localhost:5173', 'https://vibestone.vercel.app', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token', 'x-requested-with'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

// Apply CORS before routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/users", userManagementRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api", analyzeRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("API Working");
});

// Test endpoint để kiểm tra
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Đã xảy ra lỗi server: ' + err.message
  });
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);