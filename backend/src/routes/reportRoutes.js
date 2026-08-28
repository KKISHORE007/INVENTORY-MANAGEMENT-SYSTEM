const express = require('express');
const {
  getStockValuation,
  getLowStock,
  getSalesReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stock-valuation', protect, authorize('Admin', 'Manager'), getStockValuation);
router.get('/low-stock', protect, authorize('Admin', 'Manager'), getLowStock);
router.get('/sales', protect, authorize('Admin', 'Manager'), getSalesReport);

module.exports = router;

// style: minor formatting update 37
