const express = require('express');
const {
  getReturns,
  createReturn,
  processReturn
} = require('../controllers/returnController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getReturns)
  .post(protect, createReturn);

router
  .route('/:id/process')
  .post(protect, authorize('Admin', 'Manager'), processReturn);

module.exports = router;

// style: minor formatting update 38
