const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get user's orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { orders }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// Create new order from cart
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cart.items) {
      const product = cartItem.product;
      
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        price: product.price
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress
    });

    await order.save();

    // Update product stock
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      product.stock -= cartItem.quantity;
      await product.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// Update order status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('user', 'username email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

module.exports = router;
