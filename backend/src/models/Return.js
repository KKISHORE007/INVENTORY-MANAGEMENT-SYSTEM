const mongoose = require('mongoose');

const returnItemSchema = new mongoose.Schema({
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
  reason: {
    type: String,
    enum: ['Damaged', 'Wrong Item', 'Customer Changed Mind', 'Other'],
    default: 'Other',
  },
  condition: {
    type: String,
    enum: ['Resellable', 'Damaged'],
    default: 'Resellable',
  }
});

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      required: true,
      unique: true,
    },
    salesOrder: {
      type: mongoose.Schema.ObjectId,
      ref: 'SalesOrder',
      required: true,
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'Customer',
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.ObjectId, // Where the returned items are received
      ref: 'Warehouse',
      required: true,
    },
    items: [returnItemSchema],
    status: {
      type: String,
      enum: ['Pending', 'Processed', 'Rejected'],
      default: 'Pending',
    },
    refundAmount: {
      type: Number,
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

module.exports = mongoose.model('Return', returnSchema);
