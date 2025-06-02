import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import analyzeRouter from "./routes/analyze.js";

// app config
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'https://www.vibestoneoficial.store/', // domain
    'https://vibestoneoficial.store',
    'https://vibe-stone-frontend.vercel.app', // Thay bằng URL frontend thực tế
    'http://localhost:5173',
    'http://localhost:5174'
  ]
}));

// db connection
connectDB();

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api", analyzeRouter);

// Remove the static uploads middleware since we're using Cloudinary
// app.use("/images", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);