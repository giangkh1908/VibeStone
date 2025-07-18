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

// add food
    const addFood = async (req, res) => {
  try {
    console.log("Add Food: Starting process...");
    // Use the Cloudinary URL instead of local file path
    const imageUrl = req.cloudinaryUrl;
    const imageId = req.cloudinaryPublicId;

    if (!imageUrl) {
      console.log("Add Food: No Cloudinary URL found. Image upload might have failed.");
      return res.json({ success: false, message: "Image upload failed or no image provided." });
    }

    console.log("Add Food: Cloudinary URL obtained:", imageUrl);

    const data = new foodModel({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: imageUrl, // Store the Cloudinary URL
      cloudinary_id: imageId // Store the Cloudinary public ID for later operations
    });

    console.log("Add Food: Attempting to save to database...");
    await data.save();
    console.log("Add Food: Successfully saved to database.");
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log("Add Food: Error during process:", error);
    res.json({ success: false, message: "Error" });
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