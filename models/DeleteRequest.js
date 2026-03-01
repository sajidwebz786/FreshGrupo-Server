'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeleteRequest extends Model {
    static associate(models) {
      DeleteRequest.belongsTo(models.User, {
        foreignKey: 'requestedBy',
        as: 'requester'
      });
      DeleteRequest.belongsTo(models.User, {
        foreignKey: 'approvedBy',
        as: 'approver'
      });
    }
  }

  DeleteRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      entityType: {
        type: DataTypes.ENUM('product', 'pack', 'category', 'packType', 'unitType'),
        allowNull: false
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      entityName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      requestedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      requestNote: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      approvalNote: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'DeleteRequest',
      tableName: 'DeleteRequests',
      timestamps: true
    }
  );

  return DeleteRequest;
};
