'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RewardConfig extends Model {
    static associate(models) {
      // RewardConfig has no direct associations
    }
  }

  RewardConfig.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rewardPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 5.00,
        comment: 'Percentage of order amount to give as credits'
      },
      minOrderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Minimum order amount to earn rewards'
      },
      maxRewardCredits: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
        comment: 'Maximum credits that can be earned per order'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'RewardConfig',
      tableName: 'RewardConfigs',
      timestamps: true
    }
  );

  return RewardConfig;
};
