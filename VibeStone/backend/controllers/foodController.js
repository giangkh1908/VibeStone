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
    console.log("=== Edit Food Debug ===");
    console.log("Request body:", req.body);
    console.log("All form fields:", Object.keys(req.body));
    console.log("ID value:", req.body.id);
    console.log("ID type:", typeof req.body.id);
    
    const foodId = req.body.id;
    
    if (!foodId) {
      console.log("❌ Food ID is missing in request body");
      return res.json({ success: false, message: "Food ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      console.log("❌ Invalid ObjectId format:", foodId);
      return res.json({ success: false, message: "Invalid Food ID format" });
    }

    console.log("✅ Looking for food with ID:", foodId);
    const food = await foodModel.findById(foodId);
    
    if (!food) {
      console.log("❌ Food not found in database");
      return res.json({ success: false, message: "Food not found" });
    }

    console.log("✅ Found food:", food.name);
    
    // Update logic...
    const updateData = {
      name: req.body.name || food.name,
      price: req.body.price || food.price,
      description: req.body.description || food.description,
      category: req.body.category || food.category,
    };

    // Handle image update if present
    if (req.cloudinaryUrl) {
      if (food.cloudinary_id) {
        await cloudinary.uploader.destroy(food.cloudinary_id);
      }
      updateData.image = req.cloudinaryUrl;
      updateData.cloudinary_id = req.cloudinaryPublicId;
    }

    console.log("✅ Updating with data:", updateData);
    await foodModel.findByIdAndUpdate(foodId, updateData);
    
    console.log("✅ Update successful");
    res.json({ success: true, message: "Food Updated Successfully" });
    
  } catch (error) {
    console.log("❌ Edit Food Error:", error);
    res.json({ success: false, message: "Error updating food: " + error.message });
  }
};

export { listFood, addFood, removeFood, editFood };