const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT', 'TRANSFER'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true, // positive for IN, negative for OUT if we want, or just absolute value + type. Let's use absolute value.
    },
    reason: {
      type: String, // e.g., 'damaged', 'lost', 'expired', 'recount', 'purchase', 'sale'
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['PO', 'SO', 'MANUAL'], // Purchase Order, Sales Order, Manual Adjustment
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.ObjectId, // ID of PO or SO if applicable
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StockMovement', stockMovementSchema);

// style: minor formatting update 26
