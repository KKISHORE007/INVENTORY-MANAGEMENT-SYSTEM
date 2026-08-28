const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    batchNo: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate product entries per warehouse (if not using batch numbers). 
// If using batch numbers, we'd need a compound index on product + warehouse + batchNo.
inventorySchema.index({ product: 1, warehouse: 1, batchNo: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);

// style: minor formatting update 21
