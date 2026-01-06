'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PackType extends Model {
    static associate(models) {
      PackType.hasMany(models.Pack, {
        foreignKey: 'packTypeId'
      });
    }
  }

  PackType.init(
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
      duration: {
        type: DataTypes.ENUM('weekly', 'bi-weekly', 'monthly'),
        allowNull: false
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,             // ✅ REQUIRED
      modelName: 'PackType',
      tableName: 'PackTypes',
      timestamps: true
    }
  );

  return PackType;
};
