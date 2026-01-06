'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId'
      });

      Product.belongsTo(models.UnitType, {
        foreignKey: 'unitTypeId'
      });

      Product.belongsToMany(models.Pack, {
        through: models.PackProduct,
        foreignKey: 'productId'
      });
    }
  }

  Product.init(
    {
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
        allowNull: false
      },
      unitTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
    },
    {
      sequelize,            // ✅ REQUIRED
      modelName: 'Product',
      tableName: 'Products',
      timestamps: true
    }
  );

  return Product;
};
