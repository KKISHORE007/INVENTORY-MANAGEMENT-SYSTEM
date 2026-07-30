const mongoose = require('mongoose');

const soItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  sellingPrice: {
    type: Number,
    required: true,
  }
});

const salesOrderSchema = new mongoose.Schema(
  {
    soNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.ObjectId, // Warehouse from which stock is deducted
      ref: 'Warehouse',
      required: true,
    },
    items: [soItemSchema],
    status: {
      type: String,
      enum: ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Draft',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
