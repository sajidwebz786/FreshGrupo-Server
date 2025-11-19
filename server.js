const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins for development
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection and sync models
const sequelize = require("./config/database");

let modelsLoaded = false;

(async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // 1️⃣ Load all models BEFORE sync
    const models = require('./models/index');
    global.models = models;

    global.User = models.User;
    global.Category = models.Category;
    global.Product = models.Product;
    global.UnitType = models.UnitType;
    global.PackType = models.PackType;
    global.Pack = models.Pack;
    global.PackProduct = models.PackProduct;
    global.Cart = models.Cart;
    global.Order = models.Order;
    global.Payment = models.Payment;

    // 2️⃣ Setup associations
    Object.values(models)
      .filter(model => model.associate)
      .forEach(model => model.associate(models));

    console.log('🔗 Associations applied.');

    // 3️⃣ Sync database AFTER models load
    await sequelize.sync({  });

    console.log('📦 Database synced with models.');

    // 4️⃣ Load seed function
    global.seedDatabase = require('./seeders/seedData');

    modelsLoaded = true;

  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
})();

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Fresh Groupo API Server is running!" });
});

// API base route
app.get("/api", (req, res) => {
  res.json({
    message: "Fresh Groupo API Server is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      products: "/api/products",
      packs: "/api/packs",
      cart: "/api/cart",
      orders: "/api/orders",
      payments: "/api/payments",
      public: "/api/public",
    },
  });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route works!" });
});

// Test database connection and models
app.get("/api/test-db", async (req, res) => {
  try {
    console.log("Testing database connection and models...");

    if (!global.models) {
      return res.status(500).json({ error: "Models not loaded yet" });
    }

    // Test User model
    const userCount = await global.User.count();
    console.log("User count:", userCount);

    // Test Category model
    const categoryCount = await global.Category.count();
    console.log("Category count:", categoryCount);

    // Test Pack model
    const packCount = await global.Pack.count();
    console.log("Pack count:", packCount);

    // Test Cart model
    const cartCount = await global.Cart.count();
    console.log("Cart count:", cartCount);

    res.json({
      message: "Database test successful",
      counts: {
        users: userCount,
        categories: categoryCount,
        packs: packCount,
        carts: cartCount,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test specific user cart
app.get("/api/test-cart/:userId", async (req, res) => {
  try {
    if (!global.models) {
      return res.status(500).json({ error: "Models not loaded yet" });
    }

    const userId = req.params.userId;
    console.log("Testing cart for user ID:", userId);

    // Check if user exists
    const user = await global.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's cart
    const cartItems = await global.Cart.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: global.Pack,
          include: [
            { model: global.Category, attributes: ["id", "name"] },
            { model: global.PackType, attributes: ["id", "name", "duration"] },
          ],
          attributes: ["id", "name", "finalPrice"],
        },
      ],
    });

    console.log("Cart items for user:", cartItems.length);

    res.json({
      message: "Cart test successful",
      user: { id: user.id, name: user.name, email: user.email },
      cartItems: cartItems,
    });
  } catch (error) {
    console.error("Cart test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test adding item to cart
app.post("/api/test-add-to-cart", async (req, res) => {
  try {
    const { userId, packId, quantity = 1 } = req.body;

    console.log("Test adding to cart:", { userId, packId, quantity });

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if pack exists
    const pack = await Pack.findByPk(packId);
    if (!pack) {
      return res.status(404).json({ error: "Pack not found" });
    }

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, packId, isActive: true },
    });

    if (existingCartItem) {
      // Update quantity
      await existingCartItem.update({
        quantity: existingCartItem.quantity + quantity,
        totalPrice: (existingCartItem.quantity + quantity) * pack.finalPrice,
      });
      res.json({ message: "Cart item updated", cartItem: existingCartItem });
    } else {
      // Create new cart item
      const cartItem = await Cart.create({
        userId,
        packId,
        quantity,
        unitPrice: pack.finalPrice,
        totalPrice: quantity * pack.finalPrice,
      });
      res.status(201).json({ message: "Cart item created", cartItem });
    }
  } catch (error) {
    console.error("Test add to cart error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Seed database route
app.post("/api/seed", async (req, res) => {
  try {
    console.log("Seeding database...");
    await seedDatabase();
    console.log("Database seeded successfully");
    res.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Error seeding database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Force sync and seed database
app.post("/api/force-sync", async (req, res) => {
  try {
    console.log("Force syncing database...");
    await sequelize.sync({ force: true });
    console.log("Database synced, now seeding...");
    await seedDatabase();
    console.log("Database force synced and seeded successfully");
    res.json({ message: "Database force synced and seeded successfully!" });
  } catch (error) {
    console.error("Error force syncing database:", error);
    res.status(500).json({ error: error.message });
  }
});

// Simple registration test
app.post("/register", (req, res) => {
  console.log("POST /register - Request received");
  console.log("Request body:", req.body);
  res.status(201).json({
    message: "Registration endpoint works!",
    data: req.body,
  });
});

// Test route
app.get("/test", (req, res) => {
  console.log("GET /test - Request received");
  res.json({ message: "Test route works!" });
});

// API test route
app.get("/api/test", (req, res) => {
  console.log("GET /api/test - Request received");
  res.json({ message: "API test route works!" });
});

// Simple API route
app.get("/api/simple", (req, res) => {
  console.log("GET /api/simple - Request received");
  res.json({ message: "Simple API route works!" });
});

// Test POST route
app.post("/api/test-post", (req, res) => {
  console.log("POST /api/test-post - Request received");
  res.json({ message: "POST API route works!", data: req.body });
});

// Test route without /api prefix
app.post("/test-post", (req, res) => {
  console.log("POST /test-post - Request received");
  res.json({ message: "POST route works!", data: req.body });
});

// Test route with different name
app.post("/test-register", (req, res) => {
  console.log("POST /test-register - Request received");
  res.json({ message: "Test register route works!", data: req.body });
});

// Test route with GET method
app.get("/test-register", (req, res) => {
  console.log("GET /test-register - Request received");
  res.json({ message: "GET test register route works!" });
});

// Test route with simple name
app.get("/hello", (req, res) => {
  console.log("GET /hello - Request received");
  res.json({ message: "Hello route works!" });
});

// Test route with root level
app.get("/status", (req, res) => {
  console.log("GET /status - Request received");
  res.json({ message: "Status route works!", status: "ok" });
});

// Test route with different path
app.get("/api/status", (req, res) => {
  console.log("GET /api/status - Request received");
  res.json({ message: "API Status route works!", status: "ok" });
});

// Test route with simple API path
app.get("/api/health", (req, res) => {
  console.log("GET /api/health - Request received");
  res.json({ message: "API Health route works!", status: "healthy" });
});

// Test route with different method
app.post("/api/health", (req, res) => {
  console.log("POST /api/health - Request received");
  res.json({
    message: "POST API Health route works!",
    status: "healthy",
    data: req.body,
  });
});

// Test route with different name
app.post("/api/test", (req, res) => {
  console.log("POST /api/test - Request received");
  res.json({ message: "POST API test route works!", data: req.body });
});

// Test route with simple name
app.post("/test", (req, res) => {
  console.log("POST /test - Request received");
  res.json({ message: "POST test route works!", data: req.body });
});

// Test route with different name
app.post("/debug", (req, res) => {
  console.log("POST /debug - Request received");
  res.json({ message: "POST debug route works!", data: req.body });
});

// Test route with GET method
app.get("/debug", (req, res) => {
  console.log("GET /debug - Request received");
  res.json({ message: "GET debug route works!" });
});

// Test route with simple name
app.get("/ping", (req, res) => {
  console.log("GET /ping - Request received");
  res.json({ message: "GET ping route works!" });
});

// User registration route
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("=== REGISTRATION REQUEST RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("Client IP:", req.ip || req.connection.remoteAddress);

    if (!global.models) {
      console.log("❌ Models not loaded");
      return res.status(500).json({ message: "Server not fully initialized" });
    }

    const { name, email, password } = req.body;
    console.log("Extracted data:", {
      name,
      email,
      password: password ? "[HIDDEN]" : undefined,
    });

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await global.User.findOne({ where: { email } });
    if (existingUser) {
      console.log("User already exists");
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    console.log("Hashing password...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    console.log("Creating user...");
    const user = await global.User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer", // Default role for mobile app users
      isActive: true,
    });

    console.log("User created successfully:", user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log("Registration completed successfully");
    console.log("Sending response:", {
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("=== REGISTRATION ERROR ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST RECEIVED ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    console.log("Client IP:", req.ip || req.connection.remoteAddress);

    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ User found:", user.id);

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("❌ Invalid password for user:", user.id);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("✅ Password valid for user:", user.id);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    console.log("✅ Login successful for user:", user.id);
    console.log("Sending response:", {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Admin-only login route (for admin portal)
app.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Category CRUD routes
app.post("/api/categories", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.update(req.body);
      res.json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.destroy();
      res.json({ message: "Category deleted successfully" });
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Product CRUD routes
app.post("/api/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const productWithCategory = await Product.findByPk(product.id, {
      include: [Category],
    });
    res.status(201).json(productWithCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(req.body);
      const updatedProduct = await Product.findByPk(product.id, {
        include: [Category],
      });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.destroy();
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User management routes
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      const updatedUser = await User.findByPk(user.id, {
        attributes: { exclude: ["password"] },
      });
      res.json(updatedUser);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/users/:id/status", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update({ isActive: !user.isActive });
      res.json({ message: "User status updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Apply authentication middleware to protected routes
// app.use('/api/categories', authenticateToken);
// app.use('/api/products', authenticateToken);
// app.use('/api/users', authenticateToken);
// app.use('/api/packs', authenticateToken);
// app.use('/api/pack-types', authenticateToken);
// app.use('/api/cart', authenticateToken);
// app.use('/api/orders', authenticateToken);
// app.use('/api/payments', authenticateToken);

// Public API Routes (for mobile app)
app.get("/api/public/categories", async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isAvailable: true },
      include: [Category],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category],
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/categories/:id/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.id, isAvailable: true },
      include: [Category],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected API Routes (for admin portal)
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [Category],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [Category],
    });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/categories/:id/products", async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { categoryId: req.params.id },
      include: [Category],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cart routes
app.get("/api/cart/:userId", async (req, res) => {
  try {
    console.log("Fetching cart for user ID:", req.params.userId);
    const cartItems = await Cart.findAll({
      where: { userId: req.params.userId, isActive: true },
      include: [
        {
          model: Pack,
          include: [
            { model: Category, attributes: ["id", "name"] },
            { model: PackType, attributes: ["id", "name", "duration"] },
          ],
          attributes: ["id", "name", "finalPrice"],
        },
      ],
    });

    console.log("Cart items found:", cartItems.length);
    console.log("Cart items data:", JSON.stringify(cartItems, null, 2));
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart", async (req, res) => {
  try {
    const { userId, packId, quantity } = req.body;

    console.log("=== ADD TO CART REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log(
      "Adding to cart for user:",
      userId,
      "pack:",
      packId,
      "quantity:",
      quantity
    );

    // Validate required fields
    if (!userId || !packId || !quantity) {
      console.error("Missing required fields:", { userId, packId, quantity });
      return res
        .status(400)
        .json({ error: "userId, packId, and quantity are required" });
    }

    // Get pack details
    const pack = await Pack.findByPk(packId);
    if (!pack) {
      console.error("Pack not found with ID:", packId);
      return res.status(404).json({ error: "Pack not found" });
    }

    console.log("Pack found:", pack.name, "Price:", pack.finalPrice);

    // Check if item already exists in cart
    const existingCartItem = await Cart.findOne({
      where: { userId, packId, isActive: true },
    });

    console.log(
      "Existing cart item check:",
      existingCartItem ? "Found" : "Not found"
    );

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      const newTotalPrice = newQuantity * pack.finalPrice;

      console.log("Updating existing item:", {
        oldQuantity: existingCartItem.quantity,
        newQuantity,
        newTotalPrice,
      });

      await existingCartItem.update({
        quantity: newQuantity,
        totalPrice: newTotalPrice,
      });

      console.log("Cart item updated successfully");
      res.json(existingCartItem);
    } else {
      // Create new cart item
      const newCartItem = {
        userId,
        packId,
        quantity,
        unitPrice: pack.finalPrice,
        totalPrice: quantity * pack.finalPrice,
      };

      console.log("Creating new cart item:", newCartItem);

      const cartItem = await Cart.create(newCartItem);

      console.log("Cart item created successfully with ID:", cartItem.id);
      res.status(201).json(cartItem);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findByPk(req.params.id);

    if (cartItem) {
      await cartItem.update({
        quantity,
        totalPrice: quantity * cartItem.unitPrice,
      });
      res.json(cartItem);
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (cartItem) {
      await cartItem.update({ isActive: false });
      res.json({ message: "Cart item removed successfully" });
    } else {
      res.status(404).json({ error: "Cart item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Order routes
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Pack, include: [Category, PackType] },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Pack, include: [Category, PackType] },
      ],
    });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { userId, packId, quantity, deliveryAddress } = req.body;

    // Get pack details
    const pack = await Pack.findByPk(packId);
    if (!pack) {
      return res.status(404).json({ error: "Pack not found" });
    }

    // Create order
    const order = await Order.create({
      userId,
      packId,
      quantity,
      unitPrice: pack.finalPrice,
      totalAmount: quantity * pack.finalPrice,
      deliveryAddress,
      status: "pending",
    });

    // Clear cart for this user and pack
    await Cart.update(
      { isActive: false },
      { where: { userId, packId, isActive: true } }
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (order) {
      await order.update({ status });
      res.json(order);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment routes
app.get("/api/payments", async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, attributes: ["name", "email"] },
        { model: Order, attributes: ["id"] },
      ],
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;

    // Get order details
    const order = await Order.findByPk(orderId, { include: [User] });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create payment
    const payment = await Payment.create({
      orderId,
      userId: order.userId,
      amount: order.totalAmount,
      paymentMethod,
      status: "completed", // For demo purposes
      transactionId: "TXN_" + Date.now(),
    });

    // Update order payment status
    await order.update({ paymentStatus: "completed" });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Razorpay payment routes
app.post("/api/create-razorpay-order", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `order_${orderId}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update order with Razorpay order ID
    await Order.update(
      { paymentStatus: "processing" },
      { where: { id: orderId } }
    );

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "your_key_secret"
      )
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment verified successfully
      const payment = await Payment.create({
        orderId,
        userId: req.user.id,
        amount: req.body.amount,
        paymentMethod: "card",
        status: "completed",
        transactionId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        gatewayResponse: JSON.stringify(req.body),
      });

      // Update order status
      await Order.update(
        { paymentStatus: "completed", status: "confirmed" },
        { where: { id: orderId } }
      );

      res.json({ status: "success", payment });
    } else {
      // Payment verification failed
      await Payment.create({
        orderId,
        userId: req.user.id,
        amount: req.body.amount,
        paymentMethod: "card",
        status: "failed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        gatewayResponse: JSON.stringify(req.body),
      });

      res
        .status(400)
        .json({ status: "failed", message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public routes for mobile app
app.get("/api/public/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      where: { isActive: true },
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/categories/:id/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      where: {
        categoryId: req.params.id,
        isActive: true,
      },
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unit Type routes
app.get("/api/unit-types", async (req, res) => {
  try {
    const unitTypes = await UnitType.findAll();
    res.json(unitTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/unit-types", async (req, res) => {
  try {
    const unitType = await UnitType.create(req.body);
    res.status(201).json(unitType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/unit-types/:id", async (req, res) => {
  try {
    const unitType = await UnitType.findByPk(req.params.id);
    if (unitType) {
      await unitType.update(req.body);
      res.json(unitType);
    } else {
      res.status(404).json({ error: "Unit Type not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/unit-types/:id", async (req, res) => {
  try {
    const unitType = await UnitType.findByPk(req.params.id);
    if (unitType) {
      await unitType.destroy();
      res.json({ message: "Unit Type deleted successfully" });
    } else {
      res.status(404).json({ error: "Unit Type not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pack Type routes
app.get("/api/pack-types", async (req, res) => {
  try {
    const packTypes = await PackType.findAll();
    res.json(packTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pack-types", async (req, res) => {
  try {
    const packType = await PackType.create(req.body);
    res.status(201).json(packType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/pack-types/:id", async (req, res) => {
  try {
    const packType = await PackType.findByPk(req.params.id);
    if (packType) {
      await packType.update(req.body);
      res.json(packType);
    } else {
      res.status(404).json({ error: "Pack Type not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pack routes
app.get("/api/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
        {
          model: Product,
          through: { attributes: ["quantity", "unitPrice"] },
          attributes: ["name", "price"],
        },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
        {
          model: Product,
          through: { attributes: ["quantity", "unitPrice"] },
          attributes: ["name", "price"],
        },
      ],
    });
    if (pack) {
      res.json(pack);
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/packs", async (req, res) => {
  try {
    const pack = await Pack.create(req.body);
    res.status(201).json(pack);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id);
    if (pack) {
      await pack.update(req.body);
      res.json(pack);
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/packs/:id", async (req, res) => {
  try {
    const pack = await Pack.findByPk(req.params.id);
    if (pack) {
      // Delete associated pack products first
      await PackProduct.destroy({ where: { packId: req.params.id } });
      await pack.destroy();
      res.json({ message: "Pack deleted successfully" });
    } else {
      res.status(404).json({ error: "Pack not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pack Product routes
app.get("/api/packs/:id/products", async (req, res) => {
  try {
    const packProducts = await PackProduct.findAll({
      where: { packId: req.params.id },
      include: [{ model: Product, include: [Category] }],
    });
    res.json(packProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pack-products/bulk", async (req, res) => {
  try {
    const { packId, products } = req.body;

    // Delete existing pack products for this pack
    await PackProduct.destroy({ where: { packId } });

    // Create new pack products
    const packProducts = await PackProduct.bulkCreate(
      products.map((product) => ({
        packId,
        productId: product.productId,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
      }))
    );

    res.status(201).json(packProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/packs/:id/products", async (req, res) => {
  try {
    const result = await PackProduct.destroy({
      where: { packId: req.params.id },
    });
    res.json({
      message: "Pack products deleted successfully",
      deletedCount: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public routes for mobile app
app.get("/api/public/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      where: { isActive: true },
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/public/categories/:id/packs", async (req, res) => {
  try {
    const packs = await Pack.findAll({
      where: {
        categoryId: req.params.id,
        isActive: true,
      },
      include: [
        { model: Category, attributes: ["name"] },
        { model: PackType, attributes: ["name", "duration"] },
      ],
    });
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes should be defined before error handlers

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, "0.0.0.0", async () => {

  // Wait for models to be loaded before seeding
  const maxWaitTime = 100000; // 10 seconds
  const startTime = Date.now();

  while (!modelsLoaded && Date.now() - startTime < maxWaitTime) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (modelsLoaded) {
    if (process.env.SEED_ON_STARTUP === "true") {
      try {

        await global.seedDatabase();

      } catch (error) {
        console.error("❌ Error seeding database on startup:", error);
      }
    } else {
      console.log("ℹ Database seeding skipped.");
    }
  } else {
    console.error("❌ Models not loaded within timeout period");
  }
});

module.exports = app;
