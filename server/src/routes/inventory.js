import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/inventory/products
router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, lowStock } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE p.is_active = true';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      where += ` AND pc.id = $${params.length}`;
    }
    if (lowStock === 'true') {
      where += ' AND p.quantity_in_stock <= p.reorder_level';
    }

    params.push(limit, offset);

    const result = await query(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ${where}
      ORDER BY p.name
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ${where}
    `, params.slice(0, -2));

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/products
router.post('/products', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { sku, name, description, categoryId, unitPrice, costPrice, quantityInStock, reorderLevel, unit } = req.body;

    const result = await query(`
      INSERT INTO products (sku, name, description, category_id, unit_price, cost_price, quantity_in_stock, reorder_level, unit)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [sku, name, description, categoryId, unitPrice, costPrice, quantityInStock, reorderLevel, unit]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/inventory/products/:id
router.put('/products/:id', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { name, description, unitPrice, costPrice, reorderLevel, unit, isActive } = req.body;

    const result = await query(`
      UPDATE products
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          unit_price = COALESCE($3, unit_price),
          cost_price = COALESCE($4, cost_price),
          reorder_level = COALESCE($5, reorder_level),
          unit = COALESCE($6, unit),
          is_active = COALESCE($7, is_active),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [name, description, unitPrice, costPrice, reorderLevel, unit, isActive, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/inventory/transactions
router.post('/transactions', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const { productId, type, quantity, notes } = req.body;

    const txResult = await query(`
      INSERT INTO inventory_transactions (product_id, type, quantity, notes, performed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [productId, type, quantity, notes, req.user.id]);

    const quantityChange = type === 'in' || type === 'return' ? quantity : -quantity;
    await query(`
      UPDATE products SET quantity_in_stock = quantity_in_stock + $1, updated_at = NOW()
      WHERE id = $2
    `, [quantityChange, productId]);

    res.status(201).json(txResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/inventory/categories
router.get('/categories', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT pc.*, COUNT(p.id) as product_count
      FROM product_categories pc
      LEFT JOIN products p ON pc.id = p.category_id AND p.is_active = true
      GROUP BY pc.id ORDER BY pc.name
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
