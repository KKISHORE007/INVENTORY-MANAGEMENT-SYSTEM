const { Parser } = require('json2csv');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const SalesOrder = require('../models/SalesOrder');

// Helper to send CSV
const sendCSV = (res, filename, data, fields) => {
  try {
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(filename);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Could not generate CSV' });
  }
};

// @desc    Download Stock Valuation Report (CSV)
// @route   GET /api/reports/stock-valuation
// @access  Private
exports.getStockValuation = async (req, res) => {
  try {
    const products = await Product.find().populate('category', 'name');
    
    const data = products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category?.name || 'N/A',
      CurrentStock: p.currentStock,
      CostPrice: p.costPrice,
      TotalValue: (p.currentStock * p.costPrice).toFixed(2)
    }));

    const fields = ['SKU', 'Name', 'Category', 'CurrentStock', 'CostPrice', 'TotalValue'];
    sendCSV(res, `stock-valuation-${Date.now()}.csv`, data, fields);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Low Stock Report (CSV)
// @route   GET /api/reports/low-stock
// @access  Private
exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.find({ 
      $expr: { $lte: ["$currentStock", "$reorderLevel"] } 
    }).populate('category', 'name');
    
    const data = products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category?.name || 'N/A',
      CurrentStock: p.currentStock,
      ReorderLevel: p.reorderLevel,
      Deficit: p.reorderLevel - p.currentStock
    }));

    const fields = ['SKU', 'Name', 'Category', 'CurrentStock', 'ReorderLevel', 'Deficit'];
    sendCSV(res, `low-stock-${Date.now()}.csv`, data, fields);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Download Sales Report (CSV)
// @route   GET /api/reports/sales
// @access  Private
exports.getSalesReport = async (req, res) => {
  try {
    const sos = await SalesOrder.find({ status: 'Confirmed' })
      .populate('customer', 'name');
    
    const data = sos.map(so => ({
      OrderNumber: so.soNumber,
      Date: new Date(so.createdAt).toLocaleDateString(),
      Customer: so.customer?.name || 'N/A',
      Status: so.status,
      TotalAmount: so.totalAmount.toFixed(2),
      ItemsCount: so.items.length
    }));

    const fields = ['OrderNumber', 'Date', 'Customer', 'Status', 'TotalAmount', 'ItemsCount'];
    sendCSV(res, `sales-report-${Date.now()}.csv`, data, fields);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
