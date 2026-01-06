'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Each order belongs to a user
      Order.belongsTo(models.User, { foreignKey: 'userId' });

      // Each order has one payment
      Order.hasOne(models.Payment, { foreignKey: 'orderId', as: 'payment' });

      // Remove all references to OrderDetail
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
        allowNull: false,
        defaultValue: 'cod'
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
      paymentStatus: {
  type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
  defaultValue: 'pending'
}

    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true
    }
  );

  return Order;
};
