const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token. Accepts token from multiple locations for compatibility:
// - Authorization header (Bearer)
// - x-access-token header
// - req.query.token
// - req.body.token
const authenticateToken = (req, res, next) => {
  // Try common locations for token
  let token = null;
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      token = parts[1];
    } else {
      token = authHeader; // fallback if header contains token only
    }
  }

  if (!token) token = req.headers['x-access-token'] || req.query.token || req.body.token;

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get or create wallet for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { Wallet, User } = global.models;
    const userId = req.user.id;

    let wallet = await Wallet.findOne({ where: { userId } });

    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0.00,
        totalCreditsEarned: 0.00,
        totalCreditsSpent: 0.00
      });
    }

    // Get recent transactions
    const { WalletTransaction } = global.models;
    const transactions = await WalletTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        totalCreditsEarned: wallet.totalCreditsEarned,
        totalCreditsSpent: wallet.totalCreditsSpent
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balanceBefore: t.balanceBefore,
        balanceAfter: t.balanceAfter,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Failed to fetch wallet', error: error.message });
  }
});

// Get credit packages
router.get('/packages', async (req, res) => {
  try {
    const { CreditPackage } = global.models;
    const packages = await CreditPackage.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['credits', 'ASC']]
    });
    // Append a pseudo-package that indicates a manual/custom amount option
    const pkgList = packages.map(p => p);
    pkgList.push({
      id: null,
      name: 'Custom Amount',
      credits: null,
      price: null,
      bonusCredits: 0,
      isManual: true
    });

    res.json(pkgList);
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    res.status(500).json({ message: 'Failed to fetch credit packages', error: error.message });
  }
});

// Create Razorpay order for credit purchase
router.post('/purchase/create-order', authenticateToken, async (req, res) => {
  try {
    const { packageId, amount } = req.body;
    const userId = req.user.id;

    const { CreditPackage, Wallet, WalletTransaction, Notification, User } = global.models;

    let credits = 0;
    let actualAmount = 0;

    if (packageId) {
      const creditPackage = await CreditPackage.findByPk(packageId);
      if (!creditPackage || !creditPackage.isActive) {
        return res.status(404).json({ message: 'Credit package not found' });
      }
      credits = creditPackage.credits + creditPackage.bonusCredits;
      actualAmount = parseFloat(creditPackage.price);
    } else if (amount) {
      // Custom amount - 1 credit per rupee
      credits = parseInt(amount);
      actualAmount = parseFloat(amount);
    } else {
      return res.status(400).json({ message: 'Package ID or amount required' });
    }

    // Create Razorpay order
    const razorpayOrder = await global.razorpay.orders.create({
      amount: Math.round(actualAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `credit_purchase_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        credits: credits.toString(),
        type: 'credit_purchase'
      }
    });

    // Create pending transaction
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const transaction = await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'credit_purchase',
      amount: credits,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      description: `Credit purchase: ${credits} credits`,
      status: 'pending'
    });

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      credits,
      transactionId: transaction.id
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Verify payment and add credits
router.post('/purchase/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, transactionId } = req.body;
    const userId = req.user.id;

    const { Wallet, WalletTransaction, User, Notification } = global.models;

    // Verify the payment with Razorpay
    const payment = await global.razorpay.payments.fetch(razorpayPaymentId);
    
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Payment not captured' });
    }

    // Update transaction
    const transaction = await WalletTransaction.findByPk(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0.00
      });
    }

    const credits = parseFloat(transaction.amount);
    const newBalance = parseFloat(wallet.balance) + credits;

    // Update wallet
    await wallet.update({
      balance: newBalance,
      totalCreditsEarned: parseFloat(wallet.totalCreditsEarned) + credits
    });

    // Update transaction
    await transaction.update({
      balanceAfter: newBalance,
      status: 'completed',
      razorpayPaymentId,
      paymentId: razorpayPaymentId
    });

    // Create notification for admin
    const user = await User.findByPk(userId);
    
    await Notification.create({
      type: 'credit_purchase',
      title: 'Credit Purchase',
      message: `${user?.name || 'User'} purchased ${credits} credits for ₹${payment.amount / 100}`,
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
      creditsAdded: credits
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
});

// Add credits manually (admin use)
router.post('/add-credits', authenticateToken, async (req, res) => {
  try {
    const { userId, credits, description } = req.body;
    const adminId = req.user.id;

    // Check if admin
    const admin = await global.models.User.findByPk(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add credits manually' });
    }

    const { Wallet, WalletTransaction } = global.models;

    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0.00
      });
    }

    const newBalance = parseFloat(wallet.balance) + parseFloat(credits);

    await wallet.update({
      balance: newBalance,
      totalCreditsEarned: parseFloat(wallet.totalCreditsEarned) + parseFloat(credits)
    });

    await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'reward',
      amount: credits,
      balanceBefore: wallet.balance - credits,
      balanceAfter: newBalance,
      description: description || 'Admin added credits',
      status: 'completed'
    });

    res.json({
      success: true,
      newBalance,
      creditsAdded: parseFloat(credits)
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    res.status(500).json({ message: 'Failed to add credits', error: error.message });
  }
});

// Spend credits (for purchasing packs)
router.post('/spend', authenticateToken, async (req, res) => {
  try {
    const { orderId, credits } = req.body;
    const userId = req.user.id;

    const { Wallet, WalletTransaction } = global.models;

    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (parseFloat(wallet.balance) < parseFloat(credits)) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(credits);

    await wallet.update({
      balance: newBalance,
      totalCreditsSpent: parseFloat(wallet.totalCreditsSpent) + parseFloat(credits)
    });

    await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'credit_spent',
      amount: -parseFloat(credits),
      balanceBefore: wallet.balance + parseFloat(credits),
      balanceAfter: newBalance,
      orderId,
      description: `Spent ${credits} credits for order #${orderId}`,
      status: 'completed'
    });

    res.json({
      success: true,
      newBalance,
      creditsSpent: parseFloat(credits)
    });
  } catch (error) {
    console.error('Error spending credits:', error);
    res.status(500).json({ message: 'Failed to spend credits', error: error.message });
  }
});

// Get transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { WalletTransaction } = global.models;

    const transactions = await WalletTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message });
  }
});

// Deduct credits (for wallet payment - no order needed)
router.post('/deduct', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    const userId = req.user.id;

    const { Wallet, WalletTransaction } = global.models;

    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (parseFloat(wallet.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

    await wallet.update({
      balance: newBalance,
      totalCreditsSpent: parseFloat(wallet.totalCreditsSpent) + parseFloat(amount)
    });

    const transaction = await WalletTransaction.create({
      walletId: wallet.id,
      userId,
      type: 'deduction',
      amount: -parseFloat(amount),
      balanceBefore: wallet.balance + parseFloat(amount),
      balanceAfter: newBalance,
      description: description || `Deducted ${amount} credits`,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Credits deducted successfully',
      newBalance,
      creditsDeducted: parseFloat(amount),
      transaction
    });
  } catch (error) {
    console.error('Error deducting credits:', error);
    res.status(500).json({ message: 'Failed to deduct credits', error: error.message });
  }
});

// Get wallet by user ID (for admin or direct access)
// Get wallet by user ID (for admin or direct access)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId: paramUserId } = req.params;
    const { Wallet } = global.models;

    // If requester is admin they may fetch any user's wallet by ID.
    // Otherwise, use the authenticated user's id and ignore the param to avoid requiring the client to resend it.
    const requesterId = req.user && req.user.id;
    const requesterRole = req.user && req.user.role;

    let targetUserId;
    if (requesterRole === 'admin' && paramUserId) {
      targetUserId = parseInt(paramUserId, 10);
    } else {
      targetUserId = requesterId;
    }

    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID not available' });
    }

    let wallet = await Wallet.findOne({ where: { userId: targetUserId } });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: parseInt(targetUserId, 10),
        balance: 0.00,
        totalCreditsEarned: 0.00,
        totalCreditsSpent: 0.00
      });
    }

    res.json({ wallet });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ message: 'Failed to fetch wallet', error: error.message });
  }
});

module.exports = router;
