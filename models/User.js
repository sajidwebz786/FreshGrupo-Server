'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Cart, {
        foreignKey: 'userId'
      });

      User.hasMany(models.Order, {
        foreignKey: 'userId'
      });

      User.hasMany(models.Payment, {
        foreignKey: 'userId'
      });
    }
  }

  User.init(
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('customer', 'admin', 'delivery'),
        defaultValue: 'customer'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      sequelize,        // ✅ REQUIRED
      modelName: 'User',
      tableName: 'User', // matches freezeTableName behavior
      timestamps: true
    }
  );

  return User;
};
