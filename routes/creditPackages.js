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

// Get all credit packages (public)
router.get('/', async (req, res) => {
  try {
    const { CreditPackage } = global.models;
    const packages = await CreditPackage.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['credits', 'ASC']]
    });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    res.status(500).json({ message: 'Failed to fetch credit packages', error: error.message });
  }
});

// Get all credit packages (admin - including inactive)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { CreditPackage } = global.models;
    const packages = await CreditPackage.findAll({
      order: [['sortOrder', 'ASC'], ['credits', 'ASC']]
    });
    res.json(packages);
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    res.status(500).json({ message: 'Failed to fetch credit packages', error: error.message });
  }
});

// Create credit package (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, credits, price, bonusCredits, description, isPopular, sortOrder } = req.body;

    const { CreditPackage } = global.models;

    const creditPackage = await CreditPackage.create({
      name,
      credits: parseInt(credits),
      price: parseFloat(price),
      bonusCredits: parseInt(bonusCredits) || 0,
      description,
      isPopular: isPopular || false,
      sortOrder: parseInt(sortOrder) || 0,
      isActive: true
    });

    res.status(201).json(creditPackage);
  } catch (error) {
    console.error('Error creating credit package:', error);
    res.status(500).json({ message: 'Failed to create credit package', error: error.message });
  }
});

// Update credit package (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, credits, price, bonusCredits, description, isPopular, sortOrder, isActive } = req.body;

    const { CreditPackage } = global.models;

    const creditPackage = await CreditPackage.findByPk(id);
    if (!creditPackage) {
      return res.status(404).json({ message: 'Credit package not found' });
    }

    await creditPackage.update({
      name: name || creditPackage.name,
      credits: parseInt(credits) || creditPackage.credits,
      price: parseFloat(price) || creditPackage.price,
      bonusCredits: parseInt(bonusCredits) || creditPackage.bonusCredits,
      description: description || creditPackage.description,
      isPopular: isPopular !== undefined ? isPopular : creditPackage.isPopular,
      sortOrder: parseInt(sortOrder) || creditPackage.sortOrder,
      isActive: isActive !== undefined ? isActive : creditPackage.isActive
    });

    res.json(creditPackage);
  } catch (error) {
    console.error('Error updating credit package:', error);
    res.status(500).json({ message: 'Failed to update credit package', error: error.message });
  }
});

// Delete credit package (admin) - soft delete
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { CreditPackage } = global.models;

    const creditPackage = await CreditPackage.findByPk(id);
    if (!creditPackage) {
      return res.status(404).json({ message: 'Credit package not found' });
    }

    await creditPackage.update({ isActive: false });

    res.json({ message: 'Credit package deactivated successfully' });
  } catch (error) {
    console.error('Error deleting credit package:', error);
    res.status(500).json({ message: 'Failed to delete credit package', error: error.message });
  }
});

// Get single credit package
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { CreditPackage } = global.models;

    const creditPackage = await CreditPackage.findByPk(id);
    if (!creditPackage) {
      return res.status(404).json({ message: 'Credit package not found' });
    }

    res.json(creditPackage);
  } catch (error) {
    console.error('Error fetching credit package:', error);
    res.status(500).json({ message: 'Failed to fetch credit package', error: error.message });
  }
});

module.exports = router;
