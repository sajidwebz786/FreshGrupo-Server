const express = require('express');
const { User } = require('../models');

const router = express.Router();

// Get all users with optional role filter
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const whereClause = role ? { role } : {};

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'phone', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'isActive', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { name, email, phone, address, role, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updated] = await User.update(updateData, {
      where: { id: userId }
    });

    if (updated === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'isActive', 'createdAt']
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const deleted = await User.destroy({
      where: { id: userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle user status
router.patch('/:id/status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;