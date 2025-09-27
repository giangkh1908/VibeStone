import userModel from "../models/userModel.js"

// add to user cart  
const addToCart = async (req, res) => {
   try {
      let userData = await userModel.findOne({_id:req.body.userId});
      let cartData = await userData.cartData;
      if (!cartData[req.body.itemId]) {
         cartData[req.body.itemId] = 1;
      }
      else {
         cartData[req.body.itemId] += 1;
      }
      await userModel.findByIdAndUpdate(req.body.userId, {cartData});
      res.json({ success: true, message: "Added To Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }
}

// remove food from user cart
const removeFromCart = async (req, res) => {
   try {
      let userData = await userModel.findById(req.body.userId);
      let cartData = await userData.cartData;
      if (cartData[req.body.itemId] > 0) {
         cartData[req.body.itemId] -= 1;
      }
      await userModel.findByIdAndUpdate(req.body.userId, {cartData});
      res.json({ success: true, message: "Removed From Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }

}

// get user cart
const getCart = async (req, res) => {
   try {
      let userData = await userModel.findById(req.body.userId);
      let cartData = await userData.cartData;
      res.json({ success: true, cartData:cartData });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }
}

// Set quantity trực tiếp cho sản phẩm
const setCartItemQuantity = async (req, res) => {
    try {
        const { itemId, quantity } = req.body;
        const userId = req.body.userId;

        // Validate quantity
        if (quantity < 0) {
            return res.json({ success: false, message: "Quantity cannot be negative" });
        }

        let userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        if (quantity === 0) {
            // Nếu quantity = 0, xóa sản phẩm khỏi giỏ hàng
            delete cartData[itemId];
        } else {
            // Set quantity trực tiếp
            cartData[itemId] = quantity;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating cart" });
    }
}

// Batch update multiple items
const batchUpdateCart = async (req, res) => {
    try {
        const { items } = req.body; // items = { itemId1: quantity1, itemId2: quantity2, ... }
        const userId = req.body.userId;

        let userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        // Update tất cả items cùng lúc
        for (const [itemId, quantity] of Object.entries(items)) {
            if (quantity <= 0) {
                delete cartData[itemId];
            } else {
                cartData[itemId] = quantity;
            }
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Cart batch updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error batch updating cart" });
    }
}

export { addToCart, removeFromCart, getCart, setCartItemQuantity, batchUpdateCart };