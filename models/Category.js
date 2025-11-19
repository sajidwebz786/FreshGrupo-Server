const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.ENUM('Vegetables', 'Fruits', 'Groceries'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

// Define associations for Category model
Category.associate = (models) => {
  Category.hasMany(models.Product, { foreignKey: 'categoryId' });
  Category.hasMany(models.Pack, { foreignKey: 'categoryId' });
};

module.exports = Category;