const express = require('express');
const {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder
} = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getPurchaseOrders)
  .post(protect, authorize('Admin', 'Manager'), createPurchaseOrder);

router
  .route('/:id/receive')
  .post(protect, authorize('Admin', 'Manager', 'Staff'), receivePurchaseOrder);

module.exports = router;
