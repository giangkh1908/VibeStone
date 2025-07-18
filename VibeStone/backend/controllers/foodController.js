import foodModel from "../models/foodModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// list all food
const listFood = async (req, res) => {
  try {
    const data = await foodModel.find({});
    res.json({ success: true, data: data });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// add food - chỉ lưu thông tin, không upload
const addFood = async (req, res) => {
  try {
    console.log("Add Food: Starting process...");
    
    const { name, price, description, category, imageUrl, cloudinaryId } = req.body;

    if (!imageUrl) {
      return res.json({ success: false, message: "Image URL is required" });
    }

    const food = new foodModel({
      name,
      price,
      description,
      category,
      image: imageUrl,
      cloudinary_id: cloudinaryId
    });

    console.log("Add Food: Saving to database...");
    await food.save();
    console.log("Add Food: Successfully saved to database.");
    
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log("Add Food: Error:", error);
    res.json({ success: false, message: "Error adding food" });
  }
};

// remove food
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    
    // Delete the image from Cloudinary if it exists
    if (food.cloudinary_id) {
      await cloudinary.uploader.destroy(food.cloudinary_id);
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// edit food
const editFood = async (req, res) => {
  try {
    console.log("Edit Food: Starting process...");
    console.log("Request body:", req.body);
    
    const foodId = req.body.id;
    
    // Kiểm tra ID có được gửi không
    if (!foodId) {
      console.log("Edit Food: No ID provided");
      return res.json({ success: false, message: "Food ID is required" });
    }

    // Kiểm tra ID có đúng format ObjectId không
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      console.log("Edit Food: Invalid ObjectId format:", foodId);
      return res.json({ success: false, message: "Invalid Food ID format" });
    }

    console.log("Edit Food: Looking for food with ID:", foodId);
    const food = await foodModel.findById(foodId);
    
    if (!food) {
      console.log("Edit Food: Food not found in database");
      return res.json({ success: false, message: "Food not found" });
    }

    console.log("Edit Food: Found food:", food.name);

    // Update fields
    const updateData = {
      name: req.body.name || food.name,
      price: req.body.price || food.price,
      description: req.body.description || food.description,
      category: req.body.category || food.category,
    };

    // If there's a new image URL (for direct Cloudinary upload)
    if (req.body.imageUrl) {
      console.log("Edit Food: Updating with new image URL");
      // Delete the old image from Cloudinary if it exists
      if (food.cloudinary_id) {
        await cloudinary.uploader.destroy(food.cloudinary_id);
      }
      
      updateData.image = req.body.imageUrl;
      updateData.cloudinary_id = req.body.cloudinaryId;
    }
    // If there's a new image from middleware (old method)
    else if (req.cloudinaryUrl) {
      console.log("Edit Food: Updating with middleware image");
      // Delete the old image from Cloudinary if it exists
      if (food.cloudinary_id) {
        await cloudinary.uploader.destroy(food.cloudinary_id);
      }
      
      updateData.image = req.cloudinaryUrl;
      updateData.cloudinary_id = req.cloudinaryPublicId;
    }

    console.log("Edit Food: Update data:", updateData);
    
    await foodModel.findByIdAndUpdate(foodId, updateData);
    console.log("Edit Food: Update successful");
    
    res.json({ success: true, message: "Food Updated Successfully" });
  } catch (error) {
    console.log("Edit Food: Error:", error);
    res.json({ success: false, message: "Error updating food: " + error.message });
  }
};

export { listFood, addFood, removeFood, editFood };