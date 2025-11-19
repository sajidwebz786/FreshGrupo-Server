# Fresh Groupo API Server

A Node.js/Express API server for the Fresh Groupo application with PostgreSQL database integration using Sequelize ORM.

## Features

- RESTful API endpoints for users, categories, and products
- PostgreSQL database integration with Sequelize
- Sample data seeding
- CORS enabled for cross-origin requests
- Environment-based configuration

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