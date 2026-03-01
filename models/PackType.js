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
        type: DataTypes.ENUM('small', 'medium', 'large', 'custom'),
        allowNull: false
      },
      sizeLabel: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Visual size label like Small, Medium, Large'
      },
      persons: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Number of persons (e.g., 1-2 Persons, 3-4 Persons)'
      },
      days: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Duration in days (e.g., 3-4 Days, 1 Week)'
      },
      fruitCount: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Number of fruits (e.g., 4-5 Seasonal Fruits)'
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Approximate weight (e.g., Approx 3-4 Kg)'
      },
      targetAudience: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Target audience (e.g., Basic Family Consumption)'
      },
      includesExotic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether pack includes exotic fruits'
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
