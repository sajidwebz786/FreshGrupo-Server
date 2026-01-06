'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pack extends Model {
    static associate(models) {
      Pack.belongsTo(models.Category, {
        foreignKey: 'categoryId'
      });

      Pack.belongsTo(models.PackType, {
        foreignKey: 'packTypeId'
      });

      Pack.hasMany(models.Cart, {
        foreignKey: 'packId'
      });

      Pack.hasMany(models.Order, {
        foreignKey: 'packId'
      });

      Pack.belongsToMany(models.Product, {
        through: models.PackProduct,
        foreignKey: 'packId'
      });
    }
  }

  Pack.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      packTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      finalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      validFrom: {
        type: DataTypes.DATE,
        allowNull: false
      },
      validUntil: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      sequelize,           // ✅ REQUIRED
      modelName: 'Pack',
      tableName: 'Packs',
      timestamps: true
    }
  );

  return Pack;
};
