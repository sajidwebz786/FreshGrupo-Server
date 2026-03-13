const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token and check admin role
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', async (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const dbUser = await global.models.User.findByPk(user.id);
    if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'staff')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.user = user;
    req.dbUser = dbUser;
    next();
  });
};

// WARNING: This endpoint will DROP and RECREATE product/pack tables and reseed default categories/products.
// Use only when you want to completely reset products/packs to a clean known state.
router.post('/reset-products-and-packs', authenticateAdmin, async (req, res) => {
  try {
    const { resetAndSeedCategoriesProducts } = require('../seed-categories-products');
    await resetAndSeedCategoriesProducts();
    res.json({ message: 'Products, packs, and related tables have been reset and reseeded.' });
  } catch (error) {
    console.error('Error resetting products and packs:', error);
    res.status(500).json({ message: 'Failed to reset products and packs.', error: error.message });
  }
});

// Allows resetting packs only (keeps products intact)
router.post('/reset-packs-only', authenticateAdmin, async (req, res) => {
  try {
    const { resetPacks } = require('../scripts/resetPacksOnly');
    await resetPacks();
    res.json({ message: 'Packs and pack-related tables have been cleared. Pack IDs will start from 1.' });
  } catch (error) {
    console.error('Error resetting packs:', error);
    res.status(500).json({ message: 'Failed to reset packs.', error: error.message });
  }
});

module.exports = router;
