require('dotenv').config();

async function insertPackProducts() {
  try {
    const models = require('./models/index');
    const { PackProduct, Pack, Product } = models;

    await models.sequelize.authenticate();
    console.log('Database connected.');

    await models.sequelize.sync();
    console.log('Database synced.');

    const existingAssociations = await PackProduct.count();
    if (existingAssociations > 0) {
      console.log(`Pack-product associations already exist: ${existingAssociations}`);
      return;
    }

    // Get all packs and products
    const packs = await Pack.findAll();
    const products = await Product.findAll();

    console.log(`Found ${packs.length} packs and ${products.length} products.`);

    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
      if (!productsByCategory[product.categoryId]) {
        productsByCategory[product.categoryId] = [];
      }
      productsByCategory[product.categoryId].push(product);
    });

    // Create associations: add 2-3 products to each pack from the same category
    const associations = [];
    packs.forEach(pack => {
      const categoryProducts = productsByCategory[pack.categoryId] || [];
      if (categoryProducts.length > 0) {
        // Add 2-3 products per pack
        const numProducts = Math.min(3, categoryProducts.length);
        for (let i = 0; i < numProducts; i++) {
          const product = categoryProducts[i];
          associations.push({
            packId: pack.id,
            productId: product.id,
            quantity: Math.floor(Math.random() * 5) + 1, // Random quantity 1-5
            unitPrice: product.price
          });
        }
      }
    });

    await PackProduct.bulkCreate(associations);
    console.log(`Inserted ${associations.length} pack-product associations.`);

    await models.sequelize.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

insertPackProducts();