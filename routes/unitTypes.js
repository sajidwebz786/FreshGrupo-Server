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

// Get all unit types (public)
router.get('/', async (req, res) => {
  try {
    const { UnitType } = global.models;
    const unitTypes = await UnitType.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']]
    });
    res.json(unitTypes);
  } catch (error) {
    console.error('Error fetching unit types:', error);
    res.status(500).json({ message: 'Failed to fetch unit types', error: error.message });
  }
});

// Get all unit types (admin - including inactive)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { UnitType } = global.models;
    const unitTypes = await UnitType.findAll({
      order: [['id', 'ASC']]
    });
    res.json(unitTypes);
  } catch (error) {
    console.error('Error fetching unit types:', error);
    res.status(500).json({ message: 'Failed to fetch unit types', error: error.message });
  }
});

// Create unit type
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { UnitType } = global.models;
    const { name, abbreviation, description } = req.body;

    if (!name || !abbreviation) {
      return res.status(400).json({ message: 'Name and abbreviation are required' });
    }

    const unitType = await UnitType.create({
      name,
      abbreviation,
      description: description || ''
    });

    res.status(201).json(unitType);
  } catch (error) {
    console.error('Error creating unit type:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Unit type with this name or abbreviation already exists' });
    } else {
      res.status(500).json({ message: 'Failed to create unit type', error: error.message });
    }
  }
});

// Update unit type
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { UnitType } = global.models;
    const { id } = req.params;
    const { name, abbreviation, description, isActive } = req.body;

    const unitType = await UnitType.findByPk(id);
    if (!unitType) {
      return res.status(404).json({ message: 'Unit type not found' });
    }

    await unitType.update({
      name: name || unitType.name,
      abbreviation: abbreviation || unitType.abbreviation,
      description: description !== undefined ? description : unitType.description,
      isActive: isActive !== undefined ? isActive : unitType.isActive
    });

    res.json(unitType);
  } catch (error) {
    console.error('Error updating unit type:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({ message: 'Unit type with this name or abbreviation already exists' });
    } else {
      res.status(500).json({ message: 'Failed to update unit type', error: error.message });
    }
  }
});

// Delete unit type (soft delete)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { UnitType } = global.models;
    const { id } = req.params;

    const unitType = await UnitType.findByPk(id);
    if (!unitType) {
      return res.status(404).json({ message: 'Unit type not found' });
    }

    // Check if unit type is used by any products
    const { Product } = global.models;
    const productCount = await Product.count({
      where: { unitTypeId: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete unit type as it is used by existing products. Deactivate it instead.'
      });
    }

    await unitType.update({ isActive: false });
    res.json({ message: 'Unit type deactivated successfully' });
  } catch (error) {
    console.error('Error deleting unit type:', error);
    res.status(500).json({ message: 'Failed to delete unit type', error: error.message });
  }
});

module.exports = router;