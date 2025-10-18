const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total items in cart
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Calculate total price
cartSchema.methods.getTotalPrice = function() {
  return this.items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
};

module.exports = mongoose.model('Cart', cartSchema);
