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
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      unitTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Unit type for this pack product (e.g., kg, g, piece)'
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
