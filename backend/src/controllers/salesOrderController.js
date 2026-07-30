const SalesOrder = require('../models/SalesOrder');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// @desc    Get all sales orders
// @route   GET /api/sales-orders
// @access  Private
exports.getSalesOrders = async (req, res) => {
  try {
    const sos = await SalesOrder.find()
      .populate('customer', 'name')
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku');
    res.status(200).json({ success: true, count: sos.length, data: sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create sales order
// @route   POST /api/sales-orders
// @access  Private
exports.createSalesOrder = async (req, res) => {
  try {
    const { customer, warehouse, items, notes } = req.body;
    
    // Check inventory levels before creating
    for (let item of items) {
      const inventory = await Inventory.findOne({ product: item.product, warehouse });
      if (!inventory || inventory.quantity < item.quantity) {
        const prod = await Product.findById(item.product);
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product: ${prod.name}. Available: ${inventory ? inventory.quantity : 0}, Requested: ${item.quantity}` 
        });
      }
    }

    const count = await SalesOrder.countDocuments();
    const soNumber = `SO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.sellingPrice;
    });

    const so = await SalesOrder.create({
      soNumber,
      customer,
      warehouse,
      items,
      totalAmount,
      createdBy: req.user.id,
      notes,
      status: 'Draft'
    });

    res.status(201).json({ success: true, data: so });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Confirm SO (Deduct Stock)
// @route   POST /api/sales-orders/:id/confirm
// @access  Private
exports.confirmSalesOrder = async (req, res) => {
  try {
    const so = await SalesOrder.findById(req.params.id);
    
    if (!so) {
      return res.status(404).json({ success: false, message: 'Sales Order not found' });
    }

    if (so.status !== 'Draft') {
      return res.status(400).json({ success: false, message: `Cannot confirm SO in ${so.status} status` });
    }

    // Verify stock one last time and deduct
    for (let item of so.items) {
      const inventory = await Inventory.findOne({ product: item.product, warehouse: so.warehouse });
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: 'Stock changed. Insufficient stock for one or more items.' });
      }
    }

    // Deduct stock
    for (let item of so.items) {
      const inventory = await Inventory.findOne({ product: item.product, warehouse: so.warehouse });
      inventory.quantity -= item.quantity;
      await inventory.save();

      // Create Stock Movement
      await StockMovement.create({
        product: item.product,
        warehouse: so.warehouse,
        type: 'OUT',
        quantity: item.quantity,
        reason: 'Sales Order',
        referenceType: 'SO',
        referenceId: so._id,
        performedBy: req.user.id
      });
    }

    so.status = 'Confirmed';
    await so.save();

    // Update Product Total Stock Cache
    for (let item of so.items) {
      const inventories = await Inventory.find({ product: item.product });
      const totalStock = inventories.reduce((acc, curr) => acc + curr.quantity, 0);
      await Product.findByIdAndUpdate(item.product, { currentStock: totalStock });
    }

    res.status(200).json({ success: true, data: so });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
