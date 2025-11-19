// ===============================
// Models Index File
// ===============================

const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const UnitType = require('./UnitType');
const PackType = require('./PackType');
const Pack = require('./Pack');
const PackProduct = require('./PackProduct');
const Cart = require('./Cart');
const Order = require('./Order');
const Payment = require('./Payment');

// Create models object
const models = {
  User,
  Category,
  Product,
  UnitType,
  PackType,
  Pack,
  PackProduct,
  Cart,
  Order,
  Payment
};

// ===============================
// Define Associations
// ===============================

// Category - Product
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// UnitType - Product
UnitType.hasMany(Product, { foreignKey: 'unitTypeId' });
Product.belongsTo(UnitType, { foreignKey: 'unitTypeId' });

// Category - Pack
Category.hasMany(Pack, { foreignKey: 'categoryId' });
Pack.belongsTo(Category, { foreignKey: 'categoryId' });

// PackType - Pack
PackType.hasMany(Pack, { foreignKey: 'packTypeId' });
Pack.belongsTo(PackType, { foreignKey: 'packTypeId' });

// Pack - Product (Many-to-Many)
Pack.belongsToMany(Product, { through: PackProduct, foreignKey: 'packId' });
Product.belongsToMany(Pack, { through: PackProduct, foreignKey: 'productId' });

// User - Cart
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

// Pack - Cart
Pack.hasMany(Cart, { foreignKey: 'packId' });
Cart.belongsTo(Pack, { foreignKey: 'packId' });

// User - Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Pack - Order
Pack.hasMany(Order, { foreignKey: 'packId' });
Order.belongsTo(Pack, { foreignKey: 'packId' });

// Order - Payment
Order.hasMany(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// User - Payment
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Initialize associations for all models that have associate methods
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// ===============================
// Export Models
// ===============================
module.exports = {
  sequelize,
  User,
  Category,
  Product,
  UnitType,
  PackType,
  Pack,
  PackProduct,
  Cart,
  Order,
  Payment
};
