const Warehouse = require('../models/Warehouse');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json({ success: true, count: warehouses.length, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private (Admin, Manager)
exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json({ success: true, data: warehouse });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// style: minor formatting update 16
