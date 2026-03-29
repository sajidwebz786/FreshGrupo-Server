require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const db = require('./models');

// ==============================
// Razorpay Initialization
// ==============================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

// ✅ FIX: make razorpay globally accessible
global.razorpay = razorpay;

const app = express();
const PORT = process.env.PORT || 3001;

// ==============================
// Middleware
// ==============================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory for product images
const uploadsDir = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsDir)) {
  app.use('/images', express.static(uploadsDir));
  console.log('📁 Serving static images from /images route');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

// Cloudinary storage configuration
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your-cloud-name') {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'fresh-grupo',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    }
  });
} else {
  // Fallback to memory storage if Cloudinary not configured
  storage = multer.memoryStorage();
}

const upload = multer({ storage: storage });

// ==============================
// Database Init and Server Start
// ==============================
(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection established.');

    global.models = db;
    global.User = db.User;
    global.Category = db.Category;
    global.Product = db.Product;
    global.UnitType = db.UnitType;
    global.PackType = db.PackType;
    global.Pack = db.Pack;
    global.PackProduct = db.PackProduct;
    global.Cart = db.Cart;
    global.Order = db.Order;
    global.Payment = db.Payment;
    global.Address = db.Address;
    global.DeleteRequest = db.DeleteRequest;
    // New wallet/credits models
    global.Wallet = db.Wallet;
    global.WalletTransaction = db.WalletTransaction;
    global.CreditPackage = db.CreditPackage;
    global.Notification = db.Notification;
    global.RewardConfig = db.RewardConfig;

    console.log('🔗 Associations already applied.');

    await db.sequelize.sync({ alter: true });
    console.log('📦 Database synced.');

    global.seedDatabase = require('./seeders/seedData');

    // ==============================
    // Routes
    // ==============================
    app.use('/api/orders', require('./routes/orders'));
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/public', require('./routes/public'));
    app.use('/api/cart', require('./routes/cart'));
    app.use('/api/addresses', require('./routes/addresses'));

     app.use('/api/users', require('./routes/users'));
    
    // New wallet/credits routes
    app.use('/api/wallet', require('./routes/wallet'));
    app.use('/api/admin/wallet', require('./routes/adminWallet'));
    app.use('/api/credit-packages', require('./routes/creditPackages'));
    app.use('/api/notifications', require('./routes/notifications'));
    app.use('/api/reward-config', require('./routes/rewardConfig'));
    app.use('/api/pack-types', require('./routes/packTypes'));
    app.use('/api/unit-types', require('./routes/unitTypes'));
    app.use('/api/admin', require('./routes/adminMaintenance'));
    app.use('/api/payments', require('./routes/payments'));

    // ==============================
    // Delete Request Routes (for Staff approval workflow)
    // ==============================
    app.get('/api/delete-requests', async (req, res) => {
      try {
        const { DeleteRequest, User } = global.models;
        const requests = await DeleteRequest.findAll({
          include: [
            { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'approver', attributes: ['id', 'name', 'email'] }
          ],
          order: [['createdAt', 'DESC']]
        });
        res.json(requests);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/delete-requests', async (req, res) => {
      try {
        const { DeleteRequest, User } = global.models;
        const { entityType, entityId, entityName, requestNote, requestedBy } = req.body;

        // Check if user is staff
        const user = await User.findByPk(requestedBy);
        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
          return res.status(403).json({ message: 'Only staff can request deletions' });
        }

        // Check if request already exists
        const existingRequest = await DeleteRequest.findOne({
          where: {
            entityType,
            entityId,
            status: 'pending'
          }
        });

        if (existingRequest) {
          return res.status(400).json({ message: 'Delete request already exists for this item' });
        }

        const deleteRequest = await DeleteRequest.create({
          entityType,
          entityId,
          entityName,
          requestedBy,
          requestNote,
          status: 'pending'
        });

        res.status(201).json({ message: 'Delete request submitted for admin approval', request: deleteRequest });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.patch('/api/delete-requests/:id/approve', async (req, res) => {
      try {
        const { DeleteRequest, User, Product, Pack, Category, PackType, UnitType } = global.models;
        const { approvedBy, approvalNote } = req.body;
        const requestId = parseInt(req.params.id);

        // Check if user is admin
        const adminUser = await User.findByPk(approvedBy);
        if (!adminUser || adminUser.role !== 'admin') {
          return res.status(403).json({ message: 'Only admin can approve delete requests' });
        }

        const deleteRequest = await DeleteRequest.findByPk(requestId);
        if (!deleteRequest) {
          return res.status(404).json({ message: 'Delete request not found' });
        }

        if (deleteRequest.status !== 'pending') {
          return res.status(400).json({ message: 'Request already processed' });
        }

        // Perform the actual soft delete based on entity type
        let model;
        switch (deleteRequest.entityType) {
          case 'product':
            model = Product;
            await model.update({ isAvailable: false }, { where: { id: deleteRequest.entityId } });
            break;
          case 'pack':
            model = Pack;
            await model.update({ isActive: false }, { where: { id: deleteRequest.entityId } });
            break;
          case 'category':
            model = Category;
            await model.update({ isActive: false }, { where: { id: deleteRequest.entityId } });
            break;
          case 'packType':
            model = PackType;
            await model.update({ isActive: false }, { where: { id: deleteRequest.entityId } });
            break;
          case 'unitType':
            model = UnitType;
            await model.destroy({ where: { id: deleteRequest.entityId } });
            break;
          default:
            return res.status(400).json({ message: 'Invalid entity type' });
        }

        // Update request status
        await deleteRequest.update({
          status: 'approved',
          approvedBy,
          approvalNote
        });

        res.json({ message: 'Delete request approved and item marked as inactive' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.patch('/api/delete-requests/:id/reject', async (req, res) => {
      try {
        const { DeleteRequest, User } = global.models;
        const { approvedBy, approvalNote } = req.body;
        const requestId = parseInt(req.params.id);

        // Check if user is admin
        const adminUser = await User.findByPk(approvedBy);
        if (!adminUser || adminUser.role !== 'admin') {
          return res.status(403).json({ message: 'Only admin can reject delete requests' });
        }

        const deleteRequest = await DeleteRequest.findByPk(requestId);
        if (!deleteRequest) {
          return res.status(404).json({ message: 'Delete request not found' });
        }

        if (deleteRequest.status !== 'pending') {
          return res.status(400).json({ message: 'Request already processed' });
        }

        await deleteRequest.update({
          status: 'rejected',
          approvedBy,
          approvalNote
        });

        res.json({ message: 'Delete request rejected' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Get pending delete requests count
    app.get('/api/delete-requests/pending-count', async (req, res) => {
      try {
        const { DeleteRequest } = global.models;
        const count = await DeleteRequest.count({
          where: { status: 'pending' }
        });
        res.json({ count });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Health & Base
    // ==============================
    app.get('/', (_, res) => {
      res.json({ message: 'Fresh Grupo API Server is running!' });
    });

    app.get('/health', (_, res) => {
      res.json({ status: 'OK', time: new Date().toISOString() });
    });

    // ==============================
    // Category Routes
    // ==============================
    app.get('/api/categories', async (_, res) => {
      try {
        res.json(await Category.findAll());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/categories', upload.single('image'), async (req, res) => {
      try {
        const categoryData = { ...req.body };
        if (req.file) {
          if (req.file.path) {
            categoryData.image = req.file.path; // Cloudinary URL
          } else {
            // Memory storage, skip image for now
            console.log('Image uploaded to memory, skipping save');
          }
        }
        const category = await Category.create(categoryData);
        res.json(category);
      } catch (e) {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
          res.status(400).json({ error: e.errors ? e.errors.map(err => err.message).join(', ') : e.message });
        } else {
          res.status(500).json({ error: e.message });
        }
      }
    });

    app.put('/api/categories/:id', upload.single('image'), async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        const categoryData = { ...req.body };
        if (req.file) {
          if (req.file.path) {
            categoryData.image = req.file.path; // Cloudinary URL
          } else {
            // Memory storage, skip image for now
            console.log('Image uploaded to memory, skipping save');
          }
        }
        const [updated] = await Category.update(categoryData, { where: { id: categoryId } });
        if (updated) {
          const category = await Category.findByPk(categoryId);
          res.json(category);
        } else {
          res.status(404).json({ error: 'Category not found' });
        }
      } catch (e) {
        if (e.name === 'SequelizeValidationError' || e.name === 'SequelizeUniqueConstraintError') {
          res.status(400).json({ error: e.errors ? e.errors.map(err => err.message).join(', ') : e.message });
        } else {
          res.status(500).json({ error: e.message });
        }
      }
    });

    app.delete('/api/categories/:id', async (req, res) => {
      try {
        const categoryId = parseInt(req.params.id);
        if (isNaN(categoryId)) {
          return res.status(400).json({ error: 'Invalid category ID' });
        }
        // Soft delete - mark as inactive
        const [updated] = await Category.update(
          { isActive: false },
          { where: { id: categoryId } }
        );
        if (updated) {
          res.json({ message: 'Category marked as inactive' });
        } else {
          res.status(404).json({ error: 'Category not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Toggle category status
    app.patch('/api/categories/:id/toggle-status', async (req, res) => {
      try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        const newStatus = !category.isActive;
        await category.update({ isActive: newStatus });
        res.json({ message: `Category ${newStatus ? 'activated' : 'deactivated'} successfully`, isActive: newStatus });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Unit Type Routes
    // ==============================
    app.get('/api/unit-types', async (_, res) => {
      try {
        res.json(await UnitType.findAll());
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/unit-types', async (req, res) => {
      try {
        const unitType = await UnitType.create(req.body);
        res.json(unitType);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/unit-types/:id', async (req, res) => {
      try {
        const [updated] = await UnitType.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const unitType = await UnitType.findByPk(req.params.id);
          res.json(unitType);
        } else {
          res.status(404).json({ error: 'UnitType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/unit-types/:id', async (req, res) => {
      try {
        // Soft delete - mark as inactive by adding a flag or just return message
        const unitType = await UnitType.findByPk(req.params.id);
        if (!unitType) {
          return res.status(404).json({ error: 'UnitType not found' });
        }
        // For now, we'll just return a message that it's marked inactive
        // You could add an isActive field to UnitType model if needed
        res.json({ message: 'UnitType deleted successfully' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Toggle unit type status
    app.patch('/api/unit-types/:id/toggle-status', async (req, res) => {
      try {
        const unitType = await UnitType.findByPk(req.params.id);
        if (!unitType) {
          return res.status(404).json({ error: 'UnitType not found' });
        }
        const newStatus = !unitType.isActive;
        await unitType.update({ isActive: newStatus });
        res.json({ message: `UnitType ${newStatus ? 'activated' : 'deactivated'} successfully`, isActive: newStatus });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Product Routes
    // ==============================
    app.get('/api/products', async (_, res) => {
      try {
        const products = await Product.findAll({
          include: [
            { model: Category },
            { model: UnitType }
          ],
        });
        res.json(products);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/products', upload.single('image'), async (req, res) => {
      try {
        const productData = { ...req.body };
        if (req.file) {
          productData.image = req.file.path; // Cloudinary URL
        }
        const product = await Product.create(productData);
        res.status(201).json({ message: 'Product created successfully', product });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/products/:id', upload.single('image'), async (req, res) => {
      try {
        const productData = { ...req.body };
        if (req.file) {
          productData.image = req.file.path; // Cloudinary URL
        }
        const [updated] = await Product.update(productData, { where: { id: req.params.id } });
        if (updated) {
          const product = await Product.findByPk(req.params.id, {
            include: [
              { model: Category },
              { model: UnitType }
            ],
          });
          res.json({ message: 'Product updated successfully', product });
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/products/:id', async (req, res) => {
      try {
        // Soft delete - mark as inactive
        const [updated] = await Product.update(
          { isAvailable: false },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'Product marked as inactive' });
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Get deactivated products
    app.get('/api/products/deactivated', async (req, res) => {
      try {
        const { Product, Category, UnitType } = global.models;
        const products = await Product.findAll({
          where: { isAvailable: false },
          include: [
            { model: Category },
            { model: UnitType }
          ],
          order: [['updatedAt', 'DESC']]
        });
        res.json(products);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Activate a product
    app.patch('/api/products/:id/activate', async (req, res) => {
      try {
        const { Product } = global.models;
        const [updated] = await Product.update(
          { isAvailable: true },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'Product activated successfully' });
        } else {
          res.status(404).json({ error: 'Product not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Toggle product status
    app.patch('/api/products/:id/toggle-status', async (req, res) => {
      try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        const newStatus = product.isActive === false;
        await product.update({ isActive: newStatus });
        res.json({ message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully`, isActive: newStatus });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Routes (IMPORTANT)
    // ==============================
    app.get('/api/packs', async (_, res) => {
      try {
        const packs = await Pack.findAll({
          include: [
            { model: Category },
            { model: PackType },
            {
              model: Product,
              through: { attributes: ['quantity', 'unitPrice'] },
              include: [UnitType],
            },
          ],
        });
        res.json(packs);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.get('/api/packs/:id', async (req, res) => {
      try {
        const packId = parseInt(req.params.id);
        if (isNaN(packId)) {
          return res.status(400).json({ error: 'Invalid pack ID' });
        }

        const pack = await Pack.findByPk(packId, {
          include: [
            { model: Category },
            { model: PackType },
            {
              model: Product,
              as: 'Products',
              include: [
                { model: UnitType, as: 'UnitType' }
              ],
            },
          ],
        });

        if (!pack) {
          return res.status(404).json({ error: 'Pack not found' });
        }

        // Fetch PackProducts separately to get the correct UnitType for each pack product
        const packProducts = await PackProduct.findAll({
          where: { packId },
          include: [
            { model: UnitType, as: 'UnitType' }
          ]
        });

        // Map packProducts to nest them within each Product
        if (pack.Products && pack.Products.length) {
          pack.Products = pack.Products.map(product => {
            // Find the corresponding PackProduct for this product
            const packProduct = packProducts.find(pp => pp.productId === product.id);
            if (packProduct) {
              // Add PackProduct data to the product
              // This includes quantity, unitPrice from PackProduct table, and the correct UnitType
              product.PackProduct = packProduct.toJSON();
            }
            return product;
          });
        }

        res.json(pack);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/packs', async (req, res) => {
      try {
        const pack = await Pack.create(req.body);
        res.json(pack);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/packs/:id', async (req, res) => {
      try {
        const [updated] = await Pack.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const pack = await Pack.findByPk(req.params.id, {
            include: [
              { model: Category },
              { model: PackType },
              {
                model: Product,
                through: { attributes: ['quantity', 'unitPrice'] },
                include: [UnitType],
              },
            ],
          });
          res.json(pack);
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/packs/:id', async (req, res) => {
      try {
        // Soft delete - mark as inactive
        const [updated] = await Pack.update(
          { isActive: false },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'Pack marked as inactive' });
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Get deactivated packs
    app.get('/api/packs/deactivated', async (req, res) => {
      try {
        const { Pack, Category, PackType, Product, UnitType } = global.models;
        const packs = await Pack.findAll({
          where: { isActive: false },
          include: [
            { model: Category },
            { model: PackType },
            {
              model: Product,
              through: { attributes: ['quantity', 'unitPrice'] },
              include: [UnitType],
            },
          ],
          order: [['updatedAt', 'DESC']]
        });
        res.json(packs);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Activate a pack
    app.patch('/api/packs/:id/activate', async (req, res) => {
      try {
        const { Pack } = global.models;
        const [updated] = await Pack.update(
          { isActive: true },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'Pack activated successfully' });
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Deactivate a pack
    app.patch('/api/packs/:id/deactivate', async (req, res) => {
      try {
        const { Pack } = global.models;
        const [updated] = await Pack.update(
          { isActive: false },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'Pack deactivated successfully' });
        } else {
          res.status(404).json({ error: 'Pack not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Toggle pack status
    app.patch('/api/packs/:id/toggle-status', async (req, res) => {
      try {
        const { Pack } = global.models;
        const pack = await Pack.findByPk(req.params.id);
        if (!pack) {
          return res.status(404).json({ error: 'Pack not found' });
        }
        const newStatus = !pack.isActive;
        await pack.update({ isActive: newStatus });
        res.json({ message: `Pack ${newStatus ? 'activated' : 'deactivated'} successfully`, isActive: newStatus });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Type Routes
    // ==============================
    app.get('/api/pack-types', async (req, res) => {
      try {
        const { categoryId } = req.query;
        const where = {};
        if (categoryId) {
          where.categoryId = categoryId;
        }
        const packTypes = await PackType.findAll({
          where,
          include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
          order: [['id', 'ASC']]
        });
        res.json(packTypes);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/pack-types', async (req, res) => {
      try {
        const packType = await PackType.create(req.body);
        res.json(packType);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.put('/api/pack-types/:id', async (req, res) => {
      try {
        const [updated] = await PackType.update(req.body, { where: { id: req.params.id } });
        if (updated) {
          const packType = await PackType.findByPk(req.params.id);
          res.json(packType);
        } else {
          res.status(404).json({ error: 'PackType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/pack-types/:id', async (req, res) => {
      try {
        // Soft delete - mark as inactive
        const [updated] = await PackType.update(
          { isActive: false },
          { where: { id: req.params.id } }
        );
        if (updated) {
          res.json({ message: 'PackType marked as inactive' });
        } else {
          res.status(404).json({ error: 'PackType not found' });
        }
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // Toggle pack type status
    app.patch('/api/pack-types/:id/toggle-status', async (req, res) => {
      try {
        const packType = await PackType.findByPk(req.params.id);
        if (!packType) {
          return res.status(404).json({ error: 'PackType not found' });
        }
        const newStatus = !packType.isActive;
        await packType.update({ isActive: newStatus });
        res.json({ message: `PackType ${newStatus ? 'activated' : 'deactivated'} successfully`, isActive: newStatus });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Pack Product Routes
    // ==============================
    app.post('/api/pack-products/bulk', async (req, res) => {
      try {
        const { packId, products } = req.body;
        console.log('Bulk create pack products:', { packId, products });

        // Validate packId
        if (!packId || isNaN(packId)) {
          return res.status(400).json({ error: 'Invalid packId' });
        }

        // Check if pack exists
        const packExists = await Pack.findByPk(parseInt(packId));
        if (!packExists) {
          return res.status(400).json({ error: 'Pack not found' });
        }

        // Validate products
        if (!Array.isArray(products) || products.length === 0) {
          return res.status(400).json({ error: 'Products array is required' });
        }

        for (const p of products) {
          if (!p.productId || !p.quantity || !p.unitPrice) {
            return res.status(400).json({ error: 'Invalid product data: missing productId, quantity, or unitPrice' });
          }
          const qty = parseFloat(p.quantity);
          if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ error: 'Quantity must be greater than 0' });
          }
          if (parseFloat(p.unitPrice) <= 0) {
            return res.status(400).json({ error: 'Unit price must be greater than 0' });
          }
          // Check if product exists
          const productExists = await Product.findByPk(parseInt(p.productId));
          if (!productExists) {
            return res.status(400).json({ error: `Product with id ${p.productId} not found` });
          }
        }

        // Delete existing pack products first (for update)
        await PackProduct.destroy({ where: { packId: parseInt(packId) } });

        const packProducts = products.map(p => ({
          packId: parseInt(packId),
          productId: parseInt(p.productId),
          quantity: parseFloat(p.quantity) || 1,
          unitPrice: parseFloat(p.unitPrice),
          unitTypeId: p.unitTypeId ? parseInt(p.unitTypeId) : null,
          notes: p.notes || null,
        }));

        console.log('Mapped pack products:', packProducts);

        const created = await PackProduct.bulkCreate(packProducts, { validate: true });
        res.json({ message: 'Pack products updated successfully', products: created });
      } catch (e) {
        console.error('Error in bulk create pack products:', e);
        res.status(500).json({ error: e.message });
      }
    });

    app.get('/api/packs/:packId/products', async (req, res) => {
      try {
        const packProducts = await PackProduct.findAll({
          where: { packId: req.params.packId },
          include: [Product, { model: db.UnitType, as: 'UnitType' }],
        });
        res.json(packProducts);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.delete('/api/packs/:packId/products', async (req, res) => {
      try {
        await PackProduct.destroy({ where: { packId: req.params.packId } });
        res.json({ message: 'Pack products deleted' });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Razorpay Routes (UNCHANGED)
    // ==============================
    app.post('/api/create-razorpay-order', async (req, res) => {
      try {
        const { amount, orderId } = req.body;

        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(amount * 100),
          currency: 'INR',
          receipt: `order_${orderId}`,
          payment_capture: 1,
        });

        await Order.update(
          { paymentStatus: 'processing' },
          { where: { id: orderId } }
        );

        res.json({
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        });

      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post('/api/verify-payment', async (req, res) => {
      try {
        const {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
          amount,
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          return res.status(400).json({ message: 'Invalid signature' });
        }

        await Payment.create({
          orderId,
          amount,
          paymentMethod: 'razorpay',
          status: 'completed',
          transactionId: razorpay_payment_id,
        });

        await Order.update(
          { paymentStatus: 'completed', status: 'confirmed' },
          { where: { id: orderId } }
        );

        res.json({ success: true });

      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    // ==============================
    // Error Handlers
    // ==============================
    app.use((err, req, res, next) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'File upload error: ' + err.message });
      }
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.use((_, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // ==============================
    // Server Start
    // ==============================
    app.listen(PORT, '0.0.0.0', async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`SEED_ON_STARTUP: ${process.env.SEED_ON_STARTUP}`);

      if (process.env.SEED_ON_STARTUP === 'true') {
        console.log('🌱 Starting database seeding...');
        try {
          await global.seedDatabase(true); // Force drop and recreate tables
          console.log('✅ Database seeding completed');
        } catch (error) {
          console.error('❌ Database seeding failed:', error);
        }
      }
    });

  } catch (err) {
    console.error('❌ Database init failed:', err);
    process.exit(1);
  }
})();

module.exports = app;
