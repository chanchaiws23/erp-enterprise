import { Router } from 'express';
import { query } from '../config/database.js';
import { authorizeRoles } from '../middleware/auth.js';

const router = Router();

// GET /api/departments
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT d.*, COUNT(e.id) as employee_count,
             u.first_name || ' ' || u.last_name as manager_name
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.is_active = true
      GROUP BY d.id, u.first_name, u.last_name
      ORDER BY d.name
    `);

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/departments
router.post('/', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { name, code, description, managerId, budget } = req.body;

    const result = await query(`
      INSERT INTO departments (name, code, description, manager_id, budget)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, code, description, managerId, budget]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/departments/:id
router.put('/:id', authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { name, description, managerId, budget } = req.body;

    const result = await query(`
      UPDATE departments
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          manager_id = COALESCE($3, manager_id),
          budget = COALESCE($4, budget)
      WHERE id = $5
      RETURNING *
    `, [name, description, managerId, budget, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
