const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// Helper to update product total stock
const updateProductTotalStock = async (productId) => {
  const inventories = await Inventory.find({ product: productId });
  const totalStock = inventories.reduce((acc, curr) => acc + curr.quantity, 0);
  await Product.findByIdAndUpdate(productId, { currentStock: totalStock });
};

// @desc    Get inventory (can filter by warehouse or product)
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
  try {
    const { warehouse, product } = req.query;
    let query = {};
    if (warehouse) query.warehouse = warehouse;
    if (product) query.product = product;

    const inventory = await Inventory.find(query)
      .populate('product', 'name sku')
      .populate('warehouse', 'name location');

    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record Stock Movement (IN/OUT/ADJUSTMENT)
// @route   POST /api/inventory/movement
// @access  Private
exports.recordMovement = async (req, res) => {
  try {
    const { product, warehouse, type, quantity, reason, referenceType, referenceId, batchNo, expiryDate } = req.body;

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid movement type' });
    }

    if (quantity <= 0 && type !== 'ADJUSTMENT') {
       // adjustments can be negative, but IN/OUT quantities should be positive in payload, we handle the math
      return res.status(400).json({ success: false, message: 'Quantity must be positive for IN/OUT' });
    }

    // Find or create inventory record
    let inventory = await Inventory.findOne({ product, warehouse, batchNo: batchNo || null });

    if (!inventory) {
      if (type === 'OUT') {
        return res.status(400).json({ success: false, message: 'Cannot process OUT movement: Inventory record not found' });
      }
      inventory = new Inventory({
        product,
        warehouse,
        quantity: 0,
        batchNo: batchNo || null,
        expiryDate: expiryDate || null,
      });
    }

    let qtyChange = quantity;
    if (type === 'OUT') {
      if (inventory.quantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock in this warehouse' });
      }
      qtyChange = -quantity;
    } else if (type === 'ADJUSTMENT') {
       // For adjustment, quantity could be the exact delta (e.g., -2 or +5)
       // Let's assume the payload 'quantity' is the delta.
       if (inventory.quantity + quantity < 0) {
         return res.status(400).json({ success: false, message: 'Adjustment results in negative stock' });
       }
       qtyChange = quantity; 
    }

    // Update inventory quantity
    inventory.quantity += qtyChange;
    await inventory.save();

    // Create movement record
    const movement = await StockMovement.create({
      product,
      warehouse,
      type,
      quantity: Math.abs(qtyChange), // store absolute value in movement
      reason,
      referenceType: referenceType || 'MANUAL',
      referenceId: referenceId || null,
      performedBy: req.user.id,
    });

    // Update product's total stock cache
    await updateProductTotalStock(product);

    res.status(201).json({ success: true, data: movement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// style: minor formatting update 8
