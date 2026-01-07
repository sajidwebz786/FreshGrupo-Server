const express = require('express');
const router = express.Router();
const { Address } = require('../models');

// Get all addresses for a user
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Create new address
router.post('/', async (req, res) => {
  try {
    const { userId, type, name, address, isDefault } = req.body;

    if (isDefault) {
      // Remove default from other addresses
      await Address.update({ isDefault: false }, { where: { userId } });
    }

    const newAddress = await Address.create({
      userId,
      type,
      name,
      address,
      isDefault
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, name, address, isDefault } = req.body;

    const addressRecord = await Address.findByPk(id);
    if (!addressRecord) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (isDefault) {
      // Remove default from other addresses
      await Address.update({ isDefault: false }, { where: { userId: addressRecord.userId } });
    }

    await addressRecord.update({ type, name, address, isDefault });

    res.json(addressRecord);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Address.destroy({ where: { id } });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;