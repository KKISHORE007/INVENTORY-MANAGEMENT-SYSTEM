const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Please add a SKU'],
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    unit: {
      type: String,
      enum: ['pcs', 'kg', 'box', 'liters', 'meters'],
      default: 'pcs',
    },
    costPrice: {
      type: Number,
      required: [true, 'Please add a cost price'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please add a selling price'],
    },
    taxPercent: {
      type: Number,
      default: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
    },
    currentStock: {
      type: Number,
      default: 0, // Should typically be updated via Inventory movements, not directly here, but kept for quick caching/reference.
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);

// style: minor formatting update 22
