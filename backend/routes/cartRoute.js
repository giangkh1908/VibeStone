import express from 'express';
import { addToCart, removeFromCart, getCart, setCartItemQuantity, batchUpdateCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.js';

const cartRouter = express.Router();

cartRouter.post("/add", authMiddleware, addToCart);
cartRouter.post("/remove", authMiddleware, removeFromCart);
cartRouter.post("/get", authMiddleware, getCart);
cartRouter.post("/set-quantity", authMiddleware, setCartItemQuantity); // API mới
cartRouter.post("/batch-update", authMiddleware, batchUpdateCart); // API batch update

export default cartRouter;