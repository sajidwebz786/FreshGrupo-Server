const { DataTypes, Model } = require('sequelize');

class Payment extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id',
        },
      },
      razorpayPaymentId: {
        type: DataTypes.STRING(255),
      },
      razorpayOrderId: {
        type: DataTypes.STRING(255),
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(10),
        defaultValue: 'INR',
      },
      status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending', // pending, completed, failed
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
      },
    }, {
      sequelize,
      modelName: 'Payment',
      timestamps: true,
    });
  }

  static associate(models) {
    Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  }
}

module.exports = Payment;