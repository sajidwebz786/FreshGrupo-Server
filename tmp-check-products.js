const db = require('./models');

(async () => {
  await db.sequelize.authenticate();
  const products = await db.Product.findAll({ limit: 5 });
  console.log(products.map(p => ({ id: p.id, name: p.name, categoryId: p.categoryId, categoryType: typeof p.categoryId }))); 
  await db.sequelize.close();
})();
