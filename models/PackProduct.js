'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PackProduct extends Model {
    static associate(models) {
      PackProduct.belongsTo(models.Pack, {
        foreignKey: 'packId'
      });

      PackProduct.belongsTo(models.Product, {
        foreignKey: 'productId'
      });

      PackProduct.belongsTo(models.UnitType, {
        foreignKey: 'unitTypeId',
        as: 'UnitType'
      });
    }
  }

  PackProduct.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      packId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1,
        comment: 'Quantity can be decimal (e.g., 0.5 for 1/2 KG, 500 for 500g, 0.25 for 1/4 KG)'
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      unitTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Unit type for this pack product (e.g., kg, g, piece)'
      },
      notes: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional notes for price variation (e.g., small, medium, large PC)'
      }
    },
    {
      sequelize,                 // ✅ REQUIRED
      modelName: 'PackProduct',
      tableName: 'PackProducts', // join table
      timestamps: true
    }
  );

  return PackProduct;
};
