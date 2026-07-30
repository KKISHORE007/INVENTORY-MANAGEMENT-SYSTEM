const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a warehouse name'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    contactPerson: {
      type: String,
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

module.exports = mongoose.model('Warehouse', warehouseSchema);
