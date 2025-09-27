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
const facebookDataDeletionRoute = require('./routes/facebookDataDeletion');

// app config
const app = express();
const port = process.env.PORT || 5000;
// middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:5000',
    'https://vibe-stone-admin.vercel.app',
    'https://www.vibestoneoficial.store'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token']
}));
app.options('*', cors());
// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api", analyzeRoutes);
app.use('/api', facebookDataDeletionRoute);

// Remove the static uploads middleware since we're using Cloudinary
// app.use("/images", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    message: "API Working - VibeStone Backend",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Backend kết nối thành công!",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
});