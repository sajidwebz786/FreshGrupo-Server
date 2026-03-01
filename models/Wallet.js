'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      Wallet.belongsTo(models.User, {
        foreignKey: 'userId'
      });

      Wallet.hasMany(models.WalletTransaction, {
        foreignKey: 'walletId'
      });
    }
  }

  Wallet.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      },
      balance: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      totalCreditsEarned: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      totalCreditsSpent: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'Wallet',
      tableName: 'Wallets',
      timestamps: true
    }
  );

  return Wallet;
};
