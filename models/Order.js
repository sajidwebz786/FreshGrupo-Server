const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isCustom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    customPackName: {
      type: DataTypes.STRING(255),
    },
    customPackItems: {
      type: DataTypes.TEXT, // JSON string
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    packId: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'Processing',
    },
  }, {
    timestamps: true,
  });

  Order.associate = (models) => {
    Order.hasOne(models.Payment, { foreignKey: 'orderId', as: 'payment' });
    Order.hasMany(models.OrderDetail, { foreignKey: 'orderId', as: 'details' });
  };

  return Order;
};