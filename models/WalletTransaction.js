'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {
    static associate(models) {
      WalletTransaction.belongsTo(models.Wallet, {
        foreignKey: 'walletId'
      });

      WalletTransaction.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      WalletTransaction.belongsTo(models.Order, {
        foreignKey: 'orderId',
        allowNull: true
      });
    }
  }

  WalletTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('credit_purchase', 'credit_spent', 'credit_earned', 'credit_refund', 'reward'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      balanceBefore: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      balanceAfter: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      paymentMethod: {
        type: DataTypes.ENUM('online', 'wallet', 'razorpay'),
        allowNull: true
      },
      paymentId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending'
      },
      razorpayPaymentId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'WalletTransaction',
      tableName: 'WalletTransactions',
      timestamps: true
    }
  );

  return WalletTransaction;
};
