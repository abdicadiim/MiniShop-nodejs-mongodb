const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all products (public route)
router.get('/', async (req, res) => {
  try {
    const { category, featured, page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// Get single product (public route)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// Create new product (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image, stock, featured } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, category, and stock are required'
      });
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      image: image || 'https://via.placeholder.com/300x200?text=No+Image',
      stock,
      featured: featured || false
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating product'
    });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, price, category, image, stock, featured } = req.body;

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = stock;
    if (featured !== undefined) product.featured = featured;

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating product'
    });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting product'
    });
  }
});

module.exports = router;
