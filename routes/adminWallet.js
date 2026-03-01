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

// Get all wallets (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { Wallet, User } = global.models;
    const { limit = 50, offset = 0, userId } = req.query;

    const where = {};
    if (userId) {
      where.userId = userId;
    }

    const wallets = await Wallet.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count
    const totalCount = await Wallet.count({ where });

    res.json({
      wallets,
      totalCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ message: 'Failed to fetch wallets', error: error.message });
  }
});

// Get wallet by user ID (admin)
router.get('/user/:userId', authenticateAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { Wallet, User, WalletTransaction } = global.models;

    const wallet = await Wallet.findOne({
      where: { userId },
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] }
      ]
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Get transactions for this wallet
    const transactions = await WalletTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      wallet,
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Failed to fetch wallet', error: error.message });
  }
});

// Get all transactions (admin)
router.get('/transactions', authenticateAdmin, async (req, res) => {
  try {
    const { WalletTransaction, User, Order } = global.models;
    const { limit = 100, offset = 0, type, userId } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }
    if (userId) {
      where.userId = userId;
    }

    const transactions = await WalletTransaction.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Order, as: 'Order', attributes: ['id', 'status', 'totalAmount'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get total count
    const totalCount = await WalletTransaction.count({ where });

    // Get summary stats
    const stats = await WalletTransaction.findAll({
      where: { status: 'completed' },
      attributes: [
        'type',
        [global.models.sequelize.fn('SUM', global.models.sequelize.col('amount')), 'totalAmount'],
        [global.models.sequelize.fn('COUNT', global.models.sequelize.col('id')), 'count']
      ],
      group: ['type']
    });

    res.json({
      transactions,
      totalCount,
      stats,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

// Add credits to user wallet manually (admin)
router.post('/add-credits', authenticateAdmin, async (req, res) => {
  try {
    const { userId, credits, description } = req.body;
    const adminId = req.user.id;

    const { Wallet, WalletTransaction } = global.models;

    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0.00
      });
    }

    const creditsNum = parseFloat(credits);
    const newBalance = parseFloat(wallet.balance) + creditsNum;

    await wallet.update({
      balance: newBalance,
      totalCreditsEarned: parseFloat(wallet.totalCreditsEarned) + creditsNum
    });

    const transaction = await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'reward',
      amount: creditsNum,
      balanceBefore: wallet.balance - creditsNum,
      balanceAfter: newBalance,
      description: description || `Admin added ${creditsNum} credits`,
      status: 'completed'
    });

    // Create notification for admin dashboard
    const { Notification, User } = global.models;
    const user = await User.findByPk(userId);
    
    await Notification.create({
      type: 'wallet',
      title: 'Credits Added by Admin',
      message: `Admin added ${creditsNum} credits to ${user?.name || 'User'}'s wallet`,
      userId,
      referenceId: transaction.id,
      referenceType: 'wallet_transaction',
      priority: 'normal',
      actionRequired: false
    });

    res.json({
      success: true,
      message: 'Credits added successfully',
      newBalance,
      creditsAdded: creditsNum
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ message: 'Failed to add credits', error: error.message });
  }
});

// Get wallet statistics (admin)
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const { Wallet, WalletTransaction } = global.models;

    // Total wallets
    const totalWallets = await Wallet.count();

    // Total balance across all wallets
    const totalBalanceResult = await Wallet.findAll({
      attributes: [
        [global.models.sequelize.fn('SUM', global.models.sequelize.col('balance')), 'total']
      ]
    });
    const totalBalance = totalBalanceResult[0]?.dataValues?.total || 0;

    // Today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await WalletTransaction.count({
      where: {
        createdAt: {
          [global.models.sequelize.Op.gte]: today
        },
        status: 'completed'
      }
    });

    // Total credits purchased today
    const todayPurchases = await WalletTransaction.sum('amount', {
      where: {
        type: 'credit_purchase',
        status: 'completed',
        createdAt: {
          [global.models.sequelize.Op.gte]: today
        }
      }
    }) || 0;

    // Total credits earned from rewards today
    const todayRewards = await WalletTransaction.sum('amount', {
      where: {
        type: 'reward',
        status: 'completed',
        createdAt: {
          [global.models.sequelize.Op.gte]: today
        }
      }
    }) || 0;

    // Recent transactions count by type
    const transactionStats = await WalletTransaction.findAll({
      where: { status: 'completed' },
      attributes: [
        'type',
        [global.models.sequelize.fn('COUNT', global.models.sequelize.col('id')), 'count'],
        [global.models.sequelize.fn('SUM', global.models.sequelize.col('amount')), 'total']
      ],
      group: ['type']
    });

    res.json({
      totalWallets: totalWallets || 0,
      totalBalance: parseFloat(totalBalance) || 0,
      todayTransactions: todayTransactions || 0,
      todayPurchases: parseFloat(todayPurchases) || 0,
      todayRewards: parseFloat(todayRewards) || 0,
      transactionStats
    });
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({ message: 'Failed to fetch wallet stats', error: error.message });
  }
});

module.exports = router;
