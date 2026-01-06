'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Product, {
        foreignKey: 'categoryId'
      });

      Category.hasMany(models.Pack, {
        foreignKey: 'categoryId'
      });
    }
  }

  Category.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,               // ✅ REQUIRED
      modelName: 'Category',
      tableName: 'Categories', // optional but recommended
      timestamps: true
    }
  );

  return Category;
};
