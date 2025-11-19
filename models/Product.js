const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  unitTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'UnitTypes',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 1
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true
});

// Define associations for Product model
Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
  Product.belongsTo(models.UnitType, { foreignKey: 'unitTypeId' });
  Product.belongsToMany(models.Pack, { through: models.PackProduct, foreignKey: 'productId' });
};

module.exports = Product;