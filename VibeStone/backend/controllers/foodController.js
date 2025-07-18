import foodModel from "../models/foodModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

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
    const foodId = req.body.id;
    const food = await foodModel.findById(foodId);
    
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    // Update fields
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
    };

    // If there's a new image, update it
    if (req.cloudinaryUrl) {
      // Delete the old image from Cloudinary if it exists
      if (food.cloudinary_id) {
        await cloudinary.uploader.destroy(food.cloudinary_id);
      }
      
      // Add new image data
      updateData.image = req.cloudinaryUrl;
      updateData.cloudinary_id = req.cloudinaryPublicId;
    }

    await foodModel.findByIdAndUpdate(foodId, updateData);
    res.json({ success: true, message: "Food Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating food" });
  }
};

export { listFood, addFood, removeFood, editFood };