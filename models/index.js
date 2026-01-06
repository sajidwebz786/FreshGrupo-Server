'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '/../config/config.json'))[env];

const db = {};
let sequelize;

/**
 * Initialize Sequelize
 */
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

/**
 * Load all models
 */
fs.readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js'
  )
  .forEach(file => {
    const modelFactory = require(path.join(__dirname, file));

    // ✅ SAFETY CHECK
    if (typeof modelFactory !== 'function') {
      throw new Error(
        `Model file ${file} does not export a function (sequelize, DataTypes)`
      );
    }

    const model = modelFactory(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

/**
 * Run associations
 */
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/**
 * Export
 */
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
