const express = require('express');
const router = express.Router();
const { Category, PackType, Pack, Product } = require('../models');

// Image base URL - configure based on environment
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'https://freshgrupo-server.onrender.com/images';

// Helper function to construct full image URL
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL (Cloudinary or external), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the image base URL
  return `${IMAGE_BASE_URL}/${imagePath}`;
};

// GET /api/public/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'image'],
      order: [['id', 'ASC']]
    });

    // Transform to include full image URLs
    const categoriesWithImageUrls = categories.map(cat => ({
      ...cat.toJSON(),
      image: getFullImageUrl(cat.image)
    }));

    res.status(200).json(categoriesWithImageUrls);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/public/pack-types
router.get('/pack-types', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const where = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }
    const packTypes = await PackType.findAll({
      where,
      include: [{ model: Category, as: 'Category', attributes: ['id', 'name'] }],
      attributes: ['id', 'name', 'duration', 'basePrice', 'categoryId', 'sizeLabel', 'persons', 'days', 'itemCount', 'weight', 'targetAudience', 'includesExotic', 'color'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(packTypes);
  } catch (error) {
    console.error('Error fetching pack types:', error);
    res.status(500).json({ error: 'Failed to fetch pack types' });
  }
});

// GET /api/public/categories/:categoryId/packs
router.get('/categories/:categoryId/packs', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { packTypeId } = req.query;
    const where = { isActive: true, categoryId };

    if (packTypeId) where.packTypeId = packTypeId;

    const packs = await Pack.findAll({
      where,
      attributes: ['id', 'name', 'description', 'content', 'basePrice', 'finalPrice', 'validFrom', 'validUntil'],
      include: [{
        model: PackType,
        attributes: ['id', 'name', 'duration', 'basePrice']
      }, {
        model: Product,
        through: { attributes: ['unitPrice', 'quantity'] }, // Include PackProduct junction table data
        attributes: ['id', 'name', 'description', 'price', 'image', 'categoryId', 'unitTypeId', 'quantity', 'isAvailable', 'stock']
      }],
      order: [['name', 'ASC']]
    });

    // Transform to include full image URLs for products
    const packsWithImageUrls = packs.map(pack => {
      const packData = pack.toJSON();
      // Transform products to have full image URLs
      if (packData.Products && Array.isArray(packData.Products)) {
        packData.Products = packData.Products.map(product => ({
          ...product,
          image: getFullImageUrl(product.image)
        }));
      }
      return packData;
    });

    res.status(200).json(packsWithImageUrls);
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

// GET /api/public/packs/:packId - Get pack details by ID
router.get('/packs/:packId', async (req, res) => {
  try {
    const { packId } = req.params;
    
    const pack = await Pack.findByPk(packId, {
      attributes: ['id', 'name', 'description', 'content', 'basePrice', 'finalPrice', 'validFrom', 'validUntil', 'categoryId', 'packTypeId'],
      include: [
        {
          model: PackType,
          attributes: ['id', 'name', 'duration', 'basePrice', 'sizeLabel', 'persons', 'days', 'itemCount', 'weight', 'targetAudience', 'includesExotic', 'color']
        },
        {
          model: Product,
          through: { attributes: ['unitPrice', 'quantity'] },
          attributes: ['id', 'name', 'description', 'price', 'image', 'categoryId', 'unitTypeId', 'quantity', 'isAvailable', 'stock']
        }
      ]
    });

    if (!pack) {
      return res.status(404).json({ error: 'Pack not found' });
    }

    // Transform to include full image URLs for products
    const packData = pack.toJSON();
    if (packData.Products && Array.isArray(packData.Products)) {
      packData.Products = packData.Products.map(product => ({
        ...product,
        image: getFullImageUrl(product.image)
      }));
    }

    res.status(200).json(packData);
  } catch (error) {
    console.error('Error fetching pack details:', error);
    res.status(500).json({ error: 'Failed to fetch pack details' });
  }
});

// GET /api/public/categories/:categoryId/products
router.get('/categories/:categoryId/products', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await Product.findAll({
      where: { categoryId, isAvailable: true },
      attributes: ['id', 'name', 'description', 'price', 'image', 'categoryId', 'unitTypeId', 'quantity', 'isAvailable', 'stock'],
      order: [['name', 'ASC']]
    });

    // Transform to include full image URLs
    const productsWithImageUrls = products.map(product => ({
      ...product.toJSON(),
      image: getFullImageUrl(product.image)
    }));

    res.status(200).json(productsWithImageUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/public/offers - Get banner/offers for carousel (dynamic from database)
router.get('/offers', async (req, res) => {
  try {
    // Fetch active categories to use as offers/banners
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'image', 'description'],
      order: [['id', 'ASC']],
      limit: 5
    });

    // Transform to offer format with full image URLs
    const offers = categories.map((cat, index) => ({
      id: cat.id,
      category: cat.name,
      image: getFullImageUrl(cat.image),
      discount: ['20% OFF', '15% OFF', '25% OFF', '30% OFF', '10% OFF'][index % 5],
      title: `${cat.name} - Fresh Delivery`
    }));

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

module.exports = router;