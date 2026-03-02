# Fresh Groupo API Server

A Node.js/Express API server for the Fresh Groupo application with PostgreSQL database integration using Sequelize ORM.

## Features

- RESTful API endpoints for users, categories, and products
- PostgreSQL database integration with Sequelize
- Sample data seeding
- CORS enabled for cross-origin requests
- Environment-based configuration
- **Ready for Render.com deployment**

## 🚀 Render.com Deployment

### Option 1: Deploy with Blueprint (Recommended)

1. Push your code to a GitHub repository
2. Log in to [Render.com](https://render.com)
3. Go to "Blueprints" and create a new blueprint
4. Connect your GitHub repository
5. Select the `render.yaml` file from `FreshGrupo-Server/`
6. Click "Apply Blueprint"

Render will automatically create:
- PostgreSQL database (free tier)
- Web service

### Option 2: Manual Deployment

1. Create a PostgreSQL database on Render.com
2. Create a Web Service
3. Configure environment variables:
   - `DATABASE_URL`: Connection string from your PostgreSQL database
   - `NODE_ENV`: production
   - `PORT`: 3001
   - `SEED_ON_STARTUP`: true (for first deployment only)
   - `JWT_SECRET`: Generate a secure random string
   - `RAZORPAY_KEY_ID`: Your Razorpay key
   - `RAZORPAY_KEY_SECRET`: Your Razorpay secret
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
4. Build Command: `npm install`
5. Start Command: `npm start`

### After Deployment

1. The server will auto-seed the database on first startup (if `SEED_ON_STARTUP=true`)
2. After seeding, set `SEED_ON_STARTUP=false` to prevent re-seeding
3. Access your API at: `https://your-service-name.onrender.com`
4. Health check: `https://your-service-name.onrender.com/health`

### Default Login Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@freshgrupo.com | Welcome@919 |
| Customer | john@example.com | password123 |
| Delivery | delivery@freshgrupo.com | delivery123 |

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Database credentials (username: postgres, password: infiny, database: freshdb)

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env` file (already configured with your credentials)

## Usage

### Start the server
```bash
npm start
```

### Start in development mode (with nodemon)
```bash
npm run dev
```

### Seed the database with sample data
```bash
npm run seed
```

Or via API endpoint:
```bash
curl -X POST http://localhost:3001/api/seed
```

### Auto-seed on startup
Set `SEED_ON_STARTUP=true` in your `.env` file to automatically seed the database when the server starts.

## API Endpoints

### Base URL: `http://localhost:3001`

- `GET /` - Server status
- `GET /health` - Health check
- `POST /api/seed` - Seed database with sample data

### Users
- `GET /api/users` - Get all users (passwords excluded)

### Categories
- `GET /api/categories` - Get all categories

### Products
- `GET /api/products` - Get all products with category information
- `GET /api/products/:id` - Get product by ID with category information
- `GET /api/categories/:id/products` - Get products by category ID

## Database Models

### User
- id (Primary Key)
- name
- email (unique)
- phone
- password
- role (customer, admin, delivery)
- isActive
- timestamps

### Category
- id (Primary Key)
- name
- description
- image
- isActive
- timestamps

### Product
- id (Primary Key)
- name
- description
- price
- image
- categoryId (Foreign Key)
- packType (single, pack, bundle)
- packSize
- isAvailable
- stock
- timestamps

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| NODE_ENV | development | Environment mode |
| DB_HOST | localhost | Database host |
| DB_NAME | freshgrupo-db | Database name |
| DB_USER | postgres | Database username |
| DB_PASSWORD | infiny | Database password |
| DB_DIALECT | postgres | Database dialect |
| SEED_ON_STARTUP | false | Auto-seed database on startup |

## Project Structure

```
server/
├── config/
│   └── database.js          # Database configuration
├── models/
│   ├── index.js            # Model associations
│   ├── User.js             # User model
│   ├── Category.js         # Category model
│   └── Product.js          # Product model
├── routes/                 # API routes (future use)
├── seeders/
│   └── seedData.js         # Sample data seeder
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
├── server.js               # Main server file
└── README.md               # This file
```

## Development

The server is configured to:
- Connect to PostgreSQL database using Sequelize ORM
- Provide RESTful API endpoints
- Include sample data for testing
- Support environment-based configuration
- Enable CORS for frontend integration

## Notes

- The database tables will be created automatically when the server starts
- Sample data includes users, categories, and products relevant to a grocery delivery app
- Passwords are excluded from user API responses for security
- The server includes proper error handling and logging