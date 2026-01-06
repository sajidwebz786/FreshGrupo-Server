'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'userId' });
      Cart.belongsTo(models.Pack, { foreignKey: 'packId' });
    }
  }

  Cart.init(
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
      packId: {
        type: DataTypes.INTEGER,
        allowNull: true
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
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      isCustom: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      customPackName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customPackItems: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,              // ✅ THIS IS THE FIX
      modelName: 'Cart',
      tableName: 'Carts',     // optional but recommended
      timestamps: true
    }
  );

  return Cart;
};
