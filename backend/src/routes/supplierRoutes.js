const express = require('express');
const {
  getSuppliers,
  createSupplier,
  updateSupplier
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getSuppliers)
  .post(protect, authorize('Admin', 'Manager'), createSupplier);

router
  .route('/:id')
  .put(protect, authorize('Admin', 'Manager'), updateSupplier);

module.exports = router;

// style: minor formatting update 40
