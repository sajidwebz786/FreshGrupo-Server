'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderPackContent = sequelize.define(
    'OrderPackContent',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      productName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Unit type abbreviation like KG, PC, DOZEN etc.'
      },
      unitPrice: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
      }
    },
    {
      tableName: 'OrderPackContents',
      timestamps: true
    }
  );

  OrderPackContent.associate = models => {
    OrderPackContent.belongsTo(models.Order, {
      foreignKey: 'orderId'
    });
  };

  return OrderPackContent;
};
