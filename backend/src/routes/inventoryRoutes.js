const express = require('express');
const {
  getInventory,
  recordMovement,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getInventory);
router.route('/movement').post(protect, authorize('Admin', 'Manager', 'Staff'), recordMovement);

module.exports = router;

// style: minor formatting update 34
