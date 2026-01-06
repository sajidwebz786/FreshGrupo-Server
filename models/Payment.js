'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      razorpayPaymentId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      razorpayOrderId: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR'
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true
      }
    },
    {
      sequelize,            // ✅ REQUIRED
      modelName: 'Payment',
      tableName: 'Payments',
      timestamps: true
    }
  );

  return Payment;
};
