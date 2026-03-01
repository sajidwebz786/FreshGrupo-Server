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

// Get reward configuration (public)
router.get('/', async (req, res) => {
  try {
    const { RewardConfig } = global.models;
    const config = await RewardConfig.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(config || { rewardPercentage: 5, minOrderAmount: 0, maxRewardCredits: 100 });
  } catch (error) {
    console.error('Error fetching reward config:', error);
    res.status(500).json({ message: 'Failed to fetch reward config', error: error.message });
  }
});

// Get reward configuration (admin)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const { RewardConfig } = global.models;
    const configs = await RewardConfig.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(configs);
  } catch (error) {
    console.error('Error fetching reward configs:', error);
    res.status(500).json({ message: 'Failed to fetch reward configs', error: error.message });
  }
});

// Update reward configuration (admin)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rewardPercentage, minOrderAmount, maxRewardCredits, isActive, description } = req.body;

    const { RewardConfig } = global.models;

    let config = await RewardConfig.findByPk(id);
    if (!config) {
      // Create new config if doesn't exist
      config = await RewardConfig.create({
        name: 'Default Reward',
        rewardPercentage: parseFloat(rewardPercentage) || 5,
        minOrderAmount: parseFloat(minOrderAmount) || 0,
        maxRewardCredits: parseInt(maxRewardCredits) || 100,
        isActive: isActive !== undefined ? isActive : true,
        description
      });
    } else {
      await config.update({
        rewardPercentage: parseFloat(rewardPercentage) || config.rewardPercentage,
        minOrderAmount: parseFloat(minOrderAmount) !== undefined ? parseFloat(minOrderAmount) : config.minOrderAmount,
        maxRewardCredits: parseInt(maxRewardCredits) || config.maxRewardCredits,
        isActive: isActive !== undefined ? isActive : config.isActive,
        description: description || config.description
      });
    }

    res.json(config);
  } catch (error) {
    console.error('Error updating reward config:', error);
    res.status(500).json({ message: 'Failed to update reward config', error: error.message });
  }
});

// Create reward configuration (admin)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { name, rewardPercentage, minOrderAmount, maxRewardCredits, isActive, description } = req.body;

    const { RewardConfig } = global.models;

    const config = await RewardConfig.create({
      name: name || 'Default Reward',
      rewardPercentage: parseFloat(rewardPercentage) || 5,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
      maxRewardCredits: parseInt(maxRewardCredits) || 100,
      isActive: isActive !== undefined ? isActive : true,
      description
    });

    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating reward config:', error);
    res.status(500).json({ message: 'Failed to create reward config', error: error.message });
  }
});

// Calculate reward credits for an order
router.post('/calculate', async (req, res) => {
  try {
    const { orderAmount } = req.body;

    const { RewardConfig } = global.models;
    const config = await RewardConfig.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (!config) {
      return res.json({ rewardCredits: 0, message: 'No active reward configuration' });
    }

    if (parseFloat(orderAmount) < parseFloat(config.minOrderAmount)) {
      return res.json({ 
        rewardCredits: 0, 
        message: `Minimum order amount of ₹${config.minOrderAmount} required for rewards` 
      });
    }

    let rewardCredits = Math.floor((parseFloat(orderAmount) * parseFloat(config.rewardPercentage)) / 100);
    
    // Cap at max reward credits
    if (rewardCredits > parseInt(config.maxRewardCredits)) {
      rewardCredits = parseInt(config.maxRewardCredits);
    }

    res.json({
      rewardCredits,
      orderAmount: parseFloat(orderAmount),
      rewardPercentage: config.rewardPercentage,
      maxRewardCredits: config.maxRewardCredits
    });
  } catch (error) {
    console.error('Error calculating reward:', error);
    res.status(500).json({ message: 'Failed to calculate reward', error: error.message });
  }
});

module.exports = router;
