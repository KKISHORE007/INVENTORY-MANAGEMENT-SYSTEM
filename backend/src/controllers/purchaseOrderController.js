const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('supplier', 'name')
      .populate('warehouse', 'name')
      .populate('items.product', 'name sku');
    res.status(200).json({ success: true, count: pos.length, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private (Admin, Manager)
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, warehouse, items, expectedDeliveryDate, notes } = req.body;
    
    // Generate simple PO number
    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    let totalAmount = 0;
    items.forEach(item => {
      totalAmount += item.quantity * item.costPrice;
    });

    const po = await PurchaseOrder.create({
      poNumber,
      supplier,
      warehouse,
      items,
      totalAmount,
      createdBy: req.user.id,
      expectedDeliveryDate,
      notes,
      status: 'Ordered'
    });

    res.status(201).json({ success: true, data: po });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Receive PO items (Update stock)
// @route   POST /api/purchase-orders/:id/receive
// @access  Private (Admin, Manager, Staff)
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (po.status === 'Received' || po.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot receive items for PO in ${po.status} status` });
    }

    // In a full implementation, we'd take a payload specifying WHICH items and HOW MANY are being received.
    // For simplicity in this demo, we will receive all pending quantities for all items.
    
    for (let item of po.items) {
      const pendingQty = item.quantity - item.receivedQuantity;
      
      if (pendingQty > 0) {
        // Find or create inventory
        let inventory = await Inventory.findOne({ product: item.product, warehouse: po.warehouse });
        if (!inventory) {
          inventory = new Inventory({ product: item.product, warehouse: po.warehouse, quantity: 0 });
        }
        
        inventory.quantity += pendingQty;
        await inventory.save();

        // Create Stock Movement
        await StockMovement.create({
          product: item.product,
          warehouse: po.warehouse,
          type: 'IN',
          quantity: pendingQty,
          reason: 'PO Receipt',
          referenceType: 'PO',
          referenceId: po._id,
          performedBy: req.user.id
        });

        item.receivedQuantity = item.quantity;
      }
    }

    po.status = 'Received';
    await po.save();

    // Update Product Total Stock Cache
    for (let item of po.items) {
      const inventories = await Inventory.find({ product: item.product });
      const totalStock = inventories.reduce((acc, curr) => acc + curr.quantity, 0);
      await Product.findByIdAndUpdate(item.product, { currentStock: totalStock });
    }

    res.status(200).json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
