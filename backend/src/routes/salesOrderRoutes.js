const express = require('express');
const {
  getSalesOrders,
  createSalesOrder,
  confirmSalesOrder
} = require('../controllers/salesOrderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getSalesOrders)
  .post(protect, createSalesOrder);

router
  .route('/:id/confirm')
  .post(protect, confirmSalesOrder);

module.exports = router;
