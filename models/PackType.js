const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PackType = sequelize.define('PackType', {
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
}, {
  timestamps: true
});

// Define associations for PackType model
PackType.associate = (models) => {
  PackType.hasMany(models.Pack, { foreignKey: 'packTypeId' });
};

module.exports = PackType;