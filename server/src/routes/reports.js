import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/reports/sales-by-month
router.get('/sales-by-month', authorizeRoles('admin', 'manager', 'accountant'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        TO_CHAR(order_date, 'YYYY-MM') as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as avg_order_value
      FROM sales_orders
      WHERE status != 'cancelled'
        AND order_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(order_date, 'YYYY-MM')
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/top-products
router.get('/top-products', authorizeRoles('admin', 'manager'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT p.name, p.sku,
        SUM(soi.quantity) as total_sold,
        SUM(soi.total) as total_revenue
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      JOIN sales_orders so ON soi.order_id = so.id
      WHERE so.status != 'cancelled'
      GROUP BY p.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/employee-summary
router.get('/employee-summary', authorizeRoles('admin', 'hr'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        d.name as department,
        COUNT(e.id) as headcount,
        COALESCE(AVG(e.salary), 0) as avg_salary,
        COALESCE(SUM(e.salary), 0) as total_salary_cost,
        COUNT(CASE WHEN e.status = 'on_leave' THEN 1 END) as on_leave
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE d.is_active = true
      GROUP BY d.id
      ORDER BY d.name
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/inventory-valuation
router.get('/inventory-valuation', authorizeRoles('admin', 'manager', 'accountant'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        pc.name as category,
        COUNT(p.id) as product_count,
        SUM(p.quantity_in_stock) as total_units,
        SUM(p.quantity_in_stock * p.cost_price) as total_cost_value,
        SUM(p.quantity_in_stock * p.unit_price) as total_retail_value,
        COUNT(CASE WHEN p.quantity_in_stock <= p.reorder_level THEN 1 END) as low_stock_items
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = true
      GROUP BY pc.id
      ORDER BY total_retail_value DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/financial-overview
router.get('/financial-overview', authorizeRoles('admin', 'accountant'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        a.type,
        COUNT(*) as account_count,
        SUM(a.balance) as total_balance
      FROM accounts a
      WHERE a.is_active = true
      GROUP BY a.type
      ORDER BY a.type
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
