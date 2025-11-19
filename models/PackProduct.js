const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PackProduct = sequelize.define('PackProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  packId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true
});

// Define associations for PackProduct model
PackProduct.associate = (models) => {
  PackProduct.belongsTo(models.Pack, { foreignKey: 'packId' });
  PackProduct.belongsTo(models.Product, { foreignKey: 'productId' });
};

module.exports = PackProduct;