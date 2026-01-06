'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UnitType extends Model {
    static associate(models) {
      UnitType.hasMany(models.Product, {
        foreignKey: 'unitTypeId'
      });
    }
  }

  UnitType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      abbreviation: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,              // ✅ REQUIRED
      modelName: 'UnitType',
      tableName: 'UnitTypes',
      timestamps: true
    }
  );

  return UnitType;
};
