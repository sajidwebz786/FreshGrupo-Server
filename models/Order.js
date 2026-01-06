'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.hasOne(models.Payment, {
        foreignKey: 'orderId',
        as: 'payment'
      });

      Order.hasMany(models.OrderDetail, {
        foreignKey: 'orderId',
        as: 'details'
      });
    }
  }

  Order.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      deliveryAddress: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      isCustom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customPackName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      customPackItems: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      packId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Processing'
      }
    },
    {
      sequelize,           // ✅ REQUIRED
      modelName: 'Order',
      tableName: 'Orders', // optional but recommended
      timestamps: true
    }
  );

  return Order;
};
