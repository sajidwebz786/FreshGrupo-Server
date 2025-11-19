const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pack = sequelize.define('Pack', {
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
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  packTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'PackTypes',
      key: 'id'
    }
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
}, {
  timestamps: true
});

// Define associations for Pack model
Pack.associate = (models) => {
  Pack.belongsTo(models.Category, { foreignKey: 'categoryId' });
  Pack.belongsTo(models.PackType, { foreignKey: 'packTypeId' });
  Pack.hasMany(models.Cart, { foreignKey: 'packId' });
  Pack.hasMany(models.Order, { foreignKey: 'packId' });
  Pack.belongsToMany(models.Product, { through: models.PackProduct, foreignKey: 'packId' });
};

module.exports = Pack;