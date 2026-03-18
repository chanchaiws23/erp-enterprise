import { Router } from 'express';
import { query } from '../config/database.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res, next) => {
  try {
    const [employees, products, orders, revenue, lowStock, pendingLeaves, recentOrders, departmentStats] =
      await Promise.all([
        query('SELECT COUNT(*) as count FROM employees WHERE status = $1', ['active']),
        query('SELECT COUNT(*) as count FROM products WHERE is_active = true'),
        query("SELECT COUNT(*) as count FROM sales_orders WHERE status != 'cancelled'"),
        query("SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE status = 'delivered'"),
        query('SELECT COUNT(*) as count FROM products WHERE quantity_in_stock <= reorder_level AND is_active = true'),
        query("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'"),
        query(`
          SELECT so.order_number, c.name as customer_name, so.total_amount, so.status, so.order_date
          FROM sales_orders so
          LEFT JOIN customers c ON so.customer_id = c.id
          ORDER BY so.created_at DESC LIMIT 5
        `),
        query(`
          SELECT d.name, d.code, COUNT(e.id) as employee_count, d.budget
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
          WHERE d.is_active = true
          GROUP BY d.id
          ORDER BY d.name
        `),
      ]);

    res.json({
      overview: {
        totalEmployees: parseInt(employees.rows[0].count),
        totalProducts: parseInt(products.rows[0].count),
        totalOrders: parseInt(orders.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].total),
        lowStockAlerts: parseInt(lowStock.rows[0].count),
        pendingLeaveRequests: parseInt(pendingLeaves.rows[0].count),
      },
      recentOrders: recentOrders.rows,
      departmentStats: departmentStats.rows,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/charts/revenue
router.get('/charts/revenue', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        TO_CHAR(order_date, 'YYYY-MM') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as order_count
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

export default router;
