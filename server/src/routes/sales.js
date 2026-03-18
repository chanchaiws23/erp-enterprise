import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/sales/orders
router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';

    if (status) {
      params.push(status);
      where += ` AND so.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (so.order_number ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    params.push(limit, offset);

    const result = await query(`
      SELECT so.*, c.name as customer_name, c.company,
             u.first_name || ' ' || u.last_name as sales_person_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.sales_person_id = u.id
      ${where}
      ORDER BY so.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countResult = await query(`
      SELECT COUNT(*) as total FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
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

// GET /api/sales/orders/:id
router.get('/orders/:id', async (req, res, next) => {
  try {
    const orderResult = await query(`
      SELECT so.*, c.name as customer_name, c.company, c.email as customer_email,
             u.first_name || ' ' || u.last_name as sales_person_name
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN users u ON so.sales_person_id = u.id
      WHERE so.id = $1
    `, [req.params.id]);

    if (!orderResult.rows[0]) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await query(`
      SELECT soi.*, p.name as product_name, p.sku
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      WHERE soi.order_id = $1
    `, [req.params.id]);

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/sales/orders
router.post('/orders', async (req, res, next) => {
  try {
    const { customerId, dueDate, items, notes } = req.body;

    const orderNumber = `SO-${Date.now().toString(36).toUpperCase()}`;
    let subtotal = 0;

    for (const item of items) {
      subtotal += item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
    }

    const taxAmount = subtotal * 0.07;
    const totalAmount = subtotal + taxAmount;

    const orderResult = await query(`
      INSERT INTO sales_orders (order_number, customer_id, sales_person_id, due_date, subtotal, tax_amount, total_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [orderNumber, customerId, req.user.id, dueDate, subtotal, taxAmount, totalAmount, notes]);

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      const total = item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100);
      await query(`
        INSERT INTO sales_order_items (order_id, product_id, quantity, unit_price, discount_percent, total)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderId, item.productId, item.quantity, item.unitPrice, item.discountPercent || 0, total]);
    }

    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/sales/orders/:id/status
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await query(`
      UPDATE sales_orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `, [status, req.params.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/sales/customers
router.get('/customers', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT c.*,
        COUNT(so.id) as total_orders,
        COALESCE(SUM(so.total_amount), 0) as total_spent
      FROM customers c
      LEFT JOIN sales_orders so ON c.id = so.customer_id AND so.status != 'cancelled'
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/sales/customers
router.post('/customers', async (req, res, next) => {
  try {
    const { name, email, phone, company, address, taxId, creditLimit } = req.body;

    const result = await query(`
      INSERT INTO customers (name, email, phone, company, address, tax_id, credit_limit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, email, phone, company, address, taxId, creditLimit]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
