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

// Get all notifications (admin)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { Notification, User } = global.models;
    const { type, isRead, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (type) {
      where.type = type;
    }
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const notifications = await Notification.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get unread count
    const unreadCount = await Notification.count({
      where: { isRead: false }
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// Get unread notifications count (admin)
router.get('/unread-count', authenticateAdmin, async (req, res) => {
  try {
    const { Notification } = global.models;
    const count = await Notification.count({
      where: { isRead: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { Notification } = global.models;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ isRead: true });

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateAdmin, async (req, res) => {
  try {
    const { Notification } = global.models;

    await Notification.update(
      { isRead: true },
      { where: { isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { Notification } = global.models;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
});

// Create notification (for internal use)
router.post('/', async (req, res) => {
  try {
    const { type, title, message, userId, referenceId, referenceType, priority, actionRequired } = req.body;

    const { Notification } = global.models;

    const notification = await Notification.create({
      type,
      title,
      message,
      userId,
      referenceId,
      referenceType,
      priority: priority || 'normal',
      actionRequired: actionRequired || false,
      isRead: false
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
});

module.exports = router;
