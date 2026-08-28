const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const StockMovement = require('../models/StockMovement');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    // Basic Counts
    const totalProducts = await Product.countDocuments();
    
    // Low Stock Items (where currentStock <= reorderLevel)
    // To do this properly, we can aggregate Product
    const products = await Product.find();
    let lowStockCount = 0;
    let totalInventoryValue = 0;

    products.forEach(p => {
      if (p.currentStock <= p.reorderLevel) lowStockCount++;
      totalInventoryValue += p.currentStock * p.costPrice;
    });

    // Recent Sales
    const recentSales = await SalesOrder.find({ status: 'Confirmed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customer', 'name');

    // Recent Stock Movements
    const recentMovements = await StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('product', 'name');

    // Revenue this month (simplistic approach)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const salesThisMonth = await SalesOrder.find({
      status: 'Confirmed',
      createdAt: { $gte: startOfMonth }
    });

    const revenueThisMonth = salesThisMonth.reduce((acc, so) => acc + so.totalAmount, 0);

    // Sales over last 6 months for chart
    const monthlySales = await SalesOrder.aggregate([
      { $match: { status: 'Confirmed' } },
      { 
        $group: { 
          _id: { $month: "$createdAt" }, 
          total: { $sum: "$totalAmount" } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Map month numbers to names for chart
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesDataChart = monthlySales.map(m => ({
      name: monthNames[m._id - 1],
      Sales: m.total
    }));

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        totalInventoryValue,
        revenueThisMonth,
        recentSales,
        recentMovements,
        salesDataChart
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// style: minor formatting update 7
