const express = require('express');
const router = express.Router();
const { Category, PackType, Pack, Product } = require('../models');

// GET /api/public/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'image'],
      order: [['id', 'ASC']]
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/public/pack-types
router.get('/pack-types', async (req, res) => {
  try {
    const packTypes = await PackType.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'duration', 'basePrice'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(packTypes);
  } catch (error) {
    console.error('Error fetching pack types:', error);
    res.status(500).json({ error: 'Failed to fetch pack types' });
  }
});

// GET /api/public/categories/:categoryId/packs
router.get('/categories/:categoryId/packs', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { packTypeId } = req.query;
    const where = { isActive: true, categoryId };

    if (packTypeId) where.packTypeId = packTypeId;

    const packs = await Pack.findAll({
      where,
      attributes: ['id', 'name', 'description', 'basePrice', 'finalPrice', 'validFrom', 'validUntil'],
      include: [{
        model: PackType,
        attributes: ['id', 'name', 'duration', 'basePrice']
      }, {
        model: Product,
        through: { attributes: [] },
        attributes: ['id', 'name', 'description', 'price', 'image', 'categoryId', 'unitTypeId', 'quantity', 'isAvailable', 'stock']
      }],
      order: [['name', 'ASC']]
    });

    res.status(200).json(packs);
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

module.exports = router;