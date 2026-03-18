import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/employees
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, department, status } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR e.employee_code ILIKE $${params.length})`;
    }
    if (department) {
      params.push(department);
      where += ` AND d.code = $${params.length}`;
    }
    if (status) {
      params.push(status);
      where += ` AND e.status = $${params.length}`;
    }

    params.push(limit, offset);

    const result = await query(`
      SELECT e.id, e.employee_code, e.position, e.hire_date, e.salary, e.status, e.phone,
             u.id as user_id, u.first_name, u.last_name, u.email, u.role, u.avatar_url,
             d.name as department_name, d.code as department_code
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${where}
      ORDER BY e.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
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

// GET /api/employees/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT e.*, u.first_name, u.last_name, u.email, u.role, u.avatar_url,
             d.name as department_name, d.code as department_code
      FROM employees e
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = $1
    `, [req.params.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees
router.post('/', authorizeRoles('admin', 'hr'), async (req, res, next) => {
  try {
    const { employeeCode, userId, departmentId, position, hireDate, salary, phone, address } = req.body;

    const result = await query(`
      INSERT INTO employees (employee_code, user_id, department_id, position, hire_date, salary, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [employeeCode, userId, departmentId, position, hireDate, salary, phone, address]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/employees/:id
router.put('/:id', authorizeRoles('admin', 'hr', 'manager'), async (req, res, next) => {
  try {
    const { position, departmentId, salary, phone, address, status } = req.body;

    const result = await query(`
      UPDATE employees
      SET position = COALESCE($1, position),
          department_id = COALESCE($2, department_id),
          salary = COALESCE($3, salary),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          status = COALESCE($6, status),
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [position, departmentId, salary, phone, address, status, req.params.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/employees/leave-request
router.post('/leave-request', async (req, res, next) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const result = await query(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [employeeId, leaveType, startDate, endDate, reason]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/employees/leave-requests/all
router.get('/leave-requests/all', authorizeRoles('admin', 'hr', 'manager'), async (req, res, next) => {
  try {
    const result = await query(`
      SELECT lr.*, u.first_name, u.last_name, e.employee_code
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      ORDER BY lr.created_at DESC
      LIMIT 50
    `);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
