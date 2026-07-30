const express = require('express');
const {
  getWarehouses,
  createWarehouse,
} = require('../controllers/warehouseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getWarehouses)
  .post(protect, authorize('Admin', 'Manager'), createWarehouse);

module.exports = router;
