require('dotenv').config();

async function updatePackTypeNullable() {
  try {
    const models = require('./models/index');
    const { Pack } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    // First, alter the column to allow NULL
    await models.sequelize.query(`
      ALTER TABLE "Packs" ALTER COLUMN "packTypeId" DROP NOT NULL;
    `);
    console.log('✓ Altered packTypeId column to allow NULL');

    // Update all packs to set packTypeId to NULL (since pack name is now the type)
    await models.sequelize.query(`
      UPDATE "Packs" 
      SET "packTypeId" = NULL 
      WHERE "packTypeId" IS NOT NULL
    `);
    console.log('✓ Updated packs to remove packTypeId');

    console.log('');
    console.log('The packTypeId column is now nullable.');
    console.log('Pack name now serves as the pack type (e.g., "Small Fruit Pack", "Medium Fruit Pack").');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePackTypeNullable();
