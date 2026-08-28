const cron = require('node-cron');
const Product = require('../models/Product');
const Notification = require('../models/Notification'); // We'll need a simple notification model
const User = require('../models/User');

const checkLowStock = async () => {
  try {
    const products = await Product.find({ isActive: true });
    
    for (let product of products) {
      if (product.currentStock <= product.reorderLevel) {
        // Create an in-app notification (we can add email here later using Nodemailer)
        
        // Find admins/managers to notify
        const admins = await User.find({ role: { $in: ['Admin', 'Manager'] } });
        
        for (let admin of admins) {
           // We should probably check if a notification already exists and is unread to avoid spam,
           // but for simplicity, we'll just create it.
           // In a real prod environment, maybe daily summaries are better.
        }
        
        console.log(`Low stock alert for ${product.name}. Current: ${product.currentStock}, Reorder Level: ${product.reorderLevel}`);
      }
    }
  } catch (error) {
    console.error('Error in low stock cron job:', error);
  }
};

// Run every day at 8:00 AM
const initCronJobs = () => {
  cron.schedule('0 8 * * *', () => {
    console.log('Running daily low stock check...');
    checkLowStock();
  });
};

module.exports = initCronJobs;

// style: minor formatting update 17
