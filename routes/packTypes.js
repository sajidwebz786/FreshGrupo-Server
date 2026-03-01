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

// Get all pack types (public)
router.get('/', async (req, res) => {
  try {
    const { PackType } = global.models;
    const packTypes = await PackType.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });
    res.json(packTypes);
  } catch (error) {
    console.error('Error fetching pack types:', error);
    res.status(500).json({ message: 'Failed to fetch pack types', error: error.message });
  }
});

// Get all pack types (admin - including inactive)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { PackType } = global.models;
    const packTypes = await PackType.findAll({
      order: [['id', 'ASC']]
    });
    res.json(packTypes);
  } catch (error) {
    console.error('Error fetching pack types:', error);
    res.status(500).json({ message: 'Failed to fetch pack types', error: error.message });
  }
});

// Get single pack type
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { PackType } = global.models;
    const packType = await PackType.findByPk(id);

    if (!packType) {
      return res.status(404).json({ message: 'Pack type not found' });
    }

    res.json(packType);
  } catch (error) {
    console.error('Error fetching pack type:', error);
    res.status(500).json({ message: 'Failed to fetch pack type', error: error.message });
  }
});

// Create pack type (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { 
      name, 
      duration, 
      basePrice, 
      sizeLabel, 
      persons, 
      days, 
      fruitCount, 
      weight, 
      targetAudience,
      includesExotic 
    } = req.body;

    const { PackType } = global.models;

    const packType = await PackType.create({
      name,
      duration,
      basePrice: parseFloat(basePrice),
      sizeLabel,
      persons,
      days,
      fruitCount,
      weight,
      targetAudience,
      includesExotic: includesExotic || false,
      isActive: true
    });

    res.status(201).json(packType);
  } catch (error) {
    console.error('Error creating pack type:', error);
    res.status(500).json({ message: 'Failed to create pack type', error: error.message });
  }
});

// Update pack type (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      duration, 
      basePrice, 
      sizeLabel, 
      persons, 
      days, 
      fruitCount, 
      weight, 
      targetAudience,
      includesExotic,
      isActive 
    } = req.body;

    const { PackType } = global.models;

    const packType = await PackType.findByPk(id);
    if (!packType) {
      return res.status(404).json({ message: 'Pack type not found' });
    }

    await packType.update({
      name: name || packType.name,
      duration: duration || packType.duration,
      basePrice: parseFloat(basePrice) || packType.basePrice,
      sizeLabel: sizeLabel !== undefined ? sizeLabel : packType.sizeLabel,
      persons: persons !== undefined ? persons : packType.persons,
      days: days !== undefined ? days : packType.days,
      fruitCount: fruitCount !== undefined ? fruitCount : packType.fruitCount,
      weight: weight !== undefined ? weight : packType.weight,
      targetAudience: targetAudience !== undefined ? targetAudience : packType.targetAudience,
      includesExotic: includesExotic !== undefined ? includesExotic : packType.includesExotic,
      isActive: isActive !== undefined ? isActive : packType.isActive
    });

    res.json(packType);
  } catch (error) {
    console.error('Error updating pack type:', error);
    res.status(500).json({ message: 'Failed to update pack type', error: error.message });
  }
});

// Delete pack type (admin) - soft delete
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { PackType } = global.models;

    const packType = await PackType.findByPk(id);
    if (!packType) {
      return res.status(404).json({ message: 'Pack type not found' });
    }

    await packType.update({ isActive: false });

    res.json({ message: 'Pack type deactivated successfully' });
  } catch (error) {
    console.error('Error deleting pack type:', error);
    res.status(500).json({ message: 'Failed to delete pack type', error: error.message });
  }
});

module.exports = router;
