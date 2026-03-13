/**
 * FreshGrupo - Fix Pack Products to show only category-specific products
 */

require('dotenv').config();
const db = require('./models');

async function fixPackProducts() {
  try {
    console.log('🔌 Connecting...');
    await db.sequelize.authenticate();

    // Delete all existing pack-product associations
    await db.PackProduct.destroy({ where: {} });
    console.log('✅ Deleted all pack-product associations');

    // Get all packs with their categories
    const packs = await db.Pack.findAll({ 
      include: [{ model: db.Category, as: 'Category' }],
      order: [['id', 'ASC']]
    });
    console.log('Found ' + packs.length + ' packs');

    // Get all products
    const products = await db.Product.findAll();
    
    // Group products by category
    const productsByCategory = {};
    for (const p of products) {
      if (!productsByCategory[p.categoryId]) {
        productsByCategory[p.categoryId] = [];
      }
      productsByCategory[p.categoryId].push(p);
    }

    // For each pack, only add products from the SAME category
    const packProducts = [];
    for (const pack of packs) {
      const categoryId = pack.categoryId;
      const categoryProducts = productsByCategory[categoryId] || [];
      
      console.log(`Pack "${pack.name}" (Category ${categoryId}): ${categoryProducts.length} products`);
      
      for (const p of categoryProducts) {
        packProducts.push({
          packId: pack.id,
          productId: p.id,
          quantity: 1,
          unitPrice: p.price
        });
      }
    }

    // Bulk create the pack-product associations
    await db.PackProduct.bulkCreate(packProducts);
    console.log('✅ Created ' + packProducts.length + ' pack-product associations');

    // Verify
    const totalPP = await db.PackProduct.count();
    console.log('\nTotal Pack-Products: ' + totalPP);

    await db.sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixPackProducts();
