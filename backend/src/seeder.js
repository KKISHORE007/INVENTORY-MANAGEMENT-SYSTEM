const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const connectDB = require('./config/db');

// Load Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Warehouse = require('./models/Warehouse');
const Supplier = require('./models/Supplier');
const Customer = require('./models/Customer');

const users = [
  {
    name: 'Admin User',
    email: 'admin@inventory.com',
    password: 'password123',
    role: 'Admin'
  },
  {
    name: 'Manager User',
    email: 'manager@inventory.com',
    password: 'password123',
    role: 'Manager'
  },
  {
    name: 'Staff User',
    email: 'staff@inventory.com',
    password: 'password123',
    role: 'Staff'
  }
];

const categories = [
  { name: 'Electronics', description: 'Gadgets and electronic devices' },
  { name: 'Office Supplies', description: 'Stationery and office equipment' },
  { name: 'Furniture', description: 'Desks, chairs, and tables' }
];

const warehouses = [
  { name: 'Main HQ Warehouse', location: 'New York, NY', capacity: 10000 },
  { name: 'West Coast Depot', location: 'Los Angeles, CA', capacity: 15000 }
];

const suppliers = [
  { name: 'TechSource Inc', contactName: 'John Doe', email: 'john@techsource.com', phone: '555-1234', address: '123 Tech Lane' },
  { name: 'OfficeWorld', contactName: 'Jane Smith', email: 'jane@officeworld.com', phone: '555-5678', address: '456 Business Blvd' }
];

const customers = [
  { name: 'Acme Corp', email: 'buyer@acmecorp.com', phone: '555-9999', address: '789 Corporate Way' },
  { name: 'Global Tech', email: 'purchasing@globaltech.com', phone: '555-8888', address: '321 Innovation Dr' }
];

// Import into DB
const importData = async () => {
  try {
    await connectDB();
    // Clear DB
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Warehouse.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();

    // Create Admin if not exists
    await User.create(users);

    const createdCategories = await Category.create(categories);
    await Warehouse.create(warehouses);
    await Supplier.create(suppliers);
    await Customer.create(customers);

    // Create dummy products
    const products = [
      {
        name: 'Wireless Mouse',
        sku: 'ELEC-MOU-001',
        description: 'Ergonomic wireless mouse',
        category: createdCategories[0]._id,
        costPrice: 15,
        sellingPrice: 30,
        reorderLevel: 50,
        currentStock: 120
      },
      {
        name: 'Mechanical Keyboard',
        sku: 'ELEC-KEY-002',
        description: 'RGB Mechanical Keyboard',
        category: createdCategories[0]._id,
        costPrice: 45,
        sellingPrice: 90,
        reorderLevel: 20,
        currentStock: 15 // Low stock on purpose
      }
    ];

    await Product.create(products);

    console.log('Data Imported successfully! ✅');
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

// Delete data from DB
const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Warehouse.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();

    console.log('Data Destroyed! 💥');
    process.exit();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
