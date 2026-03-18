import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/finance/accounts
router.get('/accounts', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT * FROM accounts WHERE is_active = true ORDER BY code
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/finance/invoices
router.get('/invoices', async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';

    if (status) {
      params.push(status);
      where += ` AND i.status = $${params.length}`;
    }

    params.push(limit, offset);

    const result = await query(`
      SELECT i.*, c.name as customer_name, so.order_number
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN sales_orders so ON i.order_id = so.id
      ${where}
      ORDER BY i.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/finance/invoices
router.post('/invoices', authorizeRoles('admin', 'accountant'), async (req, res, next) => {
  try {
    const { orderId, customerId, dueDate, amount } = req.body;

    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

    const result = await query(`
      INSERT INTO invoices (invoice_number, order_id, customer_id, due_date, amount)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [invoiceNumber, orderId, customerId, dueDate, amount]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/finance/invoices/:id/pay
router.patch('/invoices/:id/pay', authorizeRoles('admin', 'accountant'), async (req, res, next) => {
  try {
    const { amount } = req.body;

    const invoice = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!invoice.rows[0]) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const newPaid = parseFloat(invoice.rows[0].paid_amount) + amount;
    const newStatus = newPaid >= parseFloat(invoice.rows[0].amount) ? 'paid' : 'partial';

    const result = await query(`
      UPDATE invoices SET paid_amount = $1, status = $2 WHERE id = $3 RETURNING *
    `, [newPaid, newStatus, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/finance/expenses
router.get('/expenses', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT e.*, d.name as department_name,
             u.first_name || ' ' || u.last_name as created_by_name
      FROM expenses e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/finance/expenses
router.post('/expenses', async (req, res, next) => {
  try {
    const { category, amount, description, expenseDate, accountId, departmentId } = req.body;

    const expenseNumber = `EXP-${Date.now().toString(36).toUpperCase()}`;

    const result = await query(`
      INSERT INTO expenses (expense_number, category, amount, description, expense_date, account_id, department_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [expenseNumber, category, amount, description, expenseDate, accountId, departmentId, req.user.id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/finance/summary
router.get('/summary', async (req, res, next) => {
  try {
    const [revenue, expenses, receivables, payables] = await Promise.all([
      query("SELECT COALESCE(SUM(total_amount), 0) as total FROM sales_orders WHERE status = 'delivered'"),
      query("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = 'paid'"),
      query("SELECT COALESCE(SUM(amount - paid_amount), 0) as total FROM invoices WHERE status IN ('unpaid', 'partial')"),
      query("SELECT COALESCE(SUM(total_amount), 0) as total FROM purchase_orders WHERE status = 'ordered'"),
    ]);

    res.json({
      totalRevenue: parseFloat(revenue.rows[0].total),
      totalExpenses: parseFloat(expenses.rows[0].total),
      accountsReceivable: parseFloat(receivables.rows[0].total),
      accountsPayable: parseFloat(payables.rows[0].total),
      netProfit: parseFloat(revenue.rows[0].total) - parseFloat(expenses.rows[0].total),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
