const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UnitType = sequelize.define('UnitType', {
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
}, {
  timestamps: true
});

// Define associations for UnitType model
UnitType.associate = (models) => {
  UnitType.hasMany(models.Product, { foreignKey: 'unitTypeId' });
};

module.exports = UnitType;