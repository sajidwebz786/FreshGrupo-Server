/**
 * This script clears all packs and pack-product relationships, and resets their auto-increment IDs.
 *
 * Use this when you want to start adding packs from scratch (pack id should begin at 1),
 * without touching products/categories (so any image updates you made on products remain intact).
 *
 * Run: node scripts/resetPacksOnly.js
 */

require('dotenv').config();
const db = require('../models');

async function resetPacks() {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Make sure associations are applied
    await db.sequelize.sync();

    console.log('🧹 Clearing packs and pack-product relationships...');

    // Truncate pack-related tables and restart identities
    await db.sequelize.query('TRUNCATE "PackProducts" RESTART IDENTITY CASCADE;');
    await db.sequelize.query('TRUNCATE "Packs" RESTART IDENTITY CASCADE;');
    await db.sequelize.query('TRUNCATE "PackTypes" RESTART IDENTITY CASCADE;');

    console.log('✅ Packs cleared and IDs reset. You can now create packs starting from ID=1.');

    await db.sequelize.close();
    console.log('🔌 Connection closed.');
  } catch (error) {
    console.error('❌ Error resetting packs:', error);
    throw error;
  }
}

module.exports = {
  resetPacks,
};

// If run directly, execute the reset
if (require.main === module) {
  resetPacks().catch(() => process.exit(1));
}
