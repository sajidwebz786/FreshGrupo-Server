const express = require('express');
const router = express.Router();
const { Category } = require('../models');

// GET /api/public/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'image'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;