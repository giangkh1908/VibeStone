import express from "express";
import { listProducts, addProduct, removeProduct, editProduct } from "../controllers/productController.js";
import { upload, uploadToCloudinary } from "../middleware/upload.js";

const productRouter = express.Router();

productRouter.get("/list", listProducts);
productRouter.post("/add", upload.single('image'), uploadToCloudinary, addProduct);
productRouter.post("/remove", removeProduct);
productRouter.post("/edit", upload.single('image'), uploadToCloudinary, editProduct);

export default productRouter;