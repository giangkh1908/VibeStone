import Product from "../models/productModel.js";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";

// list all products
const listProducts = async (req, res) => {
  try {
    const data = await Product.find({});
    res.json({ success: true, data: data });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// add product
const addProduct = async (req, res) => {
  try {
    // Use the Cloudinary URL instead of local file path
    const imageUrl = req.cloudinaryUrl;
    const imageId = req.cloudinaryPublicId;

    const data = new Product({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: imageUrl, // Store the Cloudinary URL
      cloudinary_id: imageId // Store the Cloudinary public ID for later operations
    });

    await data.save();
    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove product
const removeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.body.id);
    
    // Delete the image from Cloudinary if it exists
    if (product.cloudinary_id) {
      await cloudinary.uploader.destroy(product.cloudinary_id);
    }

    await Product.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// edit product
const editProduct = async (req, res) => {
  try {
    const productId = req.body.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
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
      if (product.cloudinary_id) {
        await cloudinary.uploader.destroy(product.cloudinary_id);
      }
      
      // Add new image data
      updateData.image = req.cloudinaryUrl;
      updateData.cloudinary_id = req.cloudinaryPublicId;
    }

    await Product.findByIdAndUpdate(productId, updateData);
    res.json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating product" });
  }
};

export { listProducts, addProduct, removeProduct, editProduct };