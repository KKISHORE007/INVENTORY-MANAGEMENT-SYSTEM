const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Category', categorySchema);
