const Return = require('../models/Return');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// @desc    Get all returns
// @route   GET /api/returns
// @access  Private
exports.getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('customer', 'name')
      .populate('salesOrder', 'soNumber')
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku');
    res.status(200).json({ success: true, count: returns.length, data: returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create return
// @route   POST /api/returns
// @access  Private
exports.createReturn = async (req, res) => {
  try {
    const { salesOrder, customer, warehouse, items, refundAmount, notes } = req.body;
    
    const count = await Return.countDocuments();
    const returnNumber = `RET-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const newReturn = await Return.create({
      returnNumber,
      salesOrder,
      customer,
      warehouse,
      items,
      refundAmount: refundAmount || 0,
      createdBy: req.user.id,
      notes,
      status: 'Pending'
    });

    res.status(201).json({ success: true, data: newReturn });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Process Return (Stock-In Resellable Items)
// @route   POST /api/returns/:id/process
// @access  Private
exports.processReturn = async (req, res) => {
  try {
    const returnDoc = await Return.findById(req.params.id);
    
    if (!returnDoc) {
      return res.status(404).json({ success: false, message: 'Return not found' });
    }

    if (returnDoc.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot process return in ${returnDoc.status} status` });
    }

    // Process each item
    for (let item of returnDoc.items) {
      // Only return 'Resellable' items to active inventory. 
      // Damaged items might go to a quarantine warehouse in a real system, but for now we'll just log them and not increase active stock.
      if (item.condition === 'Resellable') {
        let inventory = await Inventory.findOne({ product: item.product, warehouse: returnDoc.warehouse });
        if (!inventory) {
          inventory = new Inventory({ product: item.product, warehouse: returnDoc.warehouse, quantity: 0 });
        }
        
        inventory.quantity += item.quantity;
        await inventory.save();

        // Create Stock Movement
        await StockMovement.create({
          product: item.product,
          warehouse: returnDoc.warehouse,
          type: 'IN', // Return is an inward movement
          quantity: item.quantity,
          reason: 'Customer Return',
          referenceType: 'MANUAL', // Could make 'RET' a type in StockMovement schema later
          referenceId: returnDoc._id,
          performedBy: req.user.id
        });
      }
    }

    returnDoc.status = 'Processed';
    await returnDoc.save();

    // Update Product Total Stock Cache for resellable items
    for (let item of returnDoc.items) {
      if (item.condition === 'Resellable') {
        const inventories = await Inventory.find({ product: item.product });
        const totalStock = inventories.reduce((acc, curr) => acc + curr.quantity, 0);
        await Product.findByIdAndUpdate(item.product, { currentStock: totalStock });
      }
    }

    res.status(200).json({ success: true, data: returnDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// style: minor formatting update 12
