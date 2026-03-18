import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 12);
    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@erp.com', passwordHash, 'System', 'Admin', 'admin']);

    // Create departments
    const departments = [
      ['Human Resources', 'HR', 'Manages employee relations and recruitment', 500000],
      ['Engineering', 'ENG', 'Software development and technical operations', 2000000],
      ['Sales', 'SALES', 'Revenue generation and client management', 800000],
      ['Finance', 'FIN', 'Financial planning and accounting', 300000],
      ['Marketing', 'MKT', 'Brand management and lead generation', 600000],
      ['Operations', 'OPS', 'Day-to-day business operations', 400000],
    ];

    for (const [name, code, desc, budget] of departments) {
      await query(`
        INSERT INTO departments (name, code, description, budget)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code) DO NOTHING
      `, [name, code, desc, budget]);
    }

    // Create sample employees
    const employees = [
      ['somchai@erp.com', 'Somchai', 'Jaidee', 'manager', 'EMP001', 'ENG', 'Senior Developer', 85000],
      ['somying@erp.com', 'Somying', 'Suksai', 'employee', 'EMP002', 'SALES', 'Sales Executive', 55000],
      ['pranee@erp.com', 'Pranee', 'Rakdee', 'hr', 'EMP003', 'HR', 'HR Manager', 72000],
      ['wichai@erp.com', 'Wichai', 'Khamdee', 'accountant', 'EMP004', 'FIN', 'Senior Accountant', 68000],
      ['naree@erp.com', 'Naree', 'Somboon', 'employee', 'EMP005', 'MKT', 'Marketing Specialist', 50000],
      ['prasit@erp.com', 'Prasit', 'Thongdee', 'manager', 'EMP006', 'OPS', 'Operations Manager', 78000],
    ];

    for (const [email, firstName, lastName, role, empCode, deptCode, position, salary] of employees) {
      const hash = await bcrypt.hash('password123', 12);
      const userResult = await query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET first_name = $3
        RETURNING id
      `, [email, hash, firstName, lastName, role]);

      const deptResult = await query('SELECT id FROM departments WHERE code = $1', [deptCode]);

      await query(`
        INSERT INTO employees (user_id, employee_code, department_id, position, hire_date, salary)
        VALUES ($1, $2, $3, $4, CURRENT_DATE - INTERVAL '1 year' * (RANDOM() * 5 + 1), $5)
        ON CONFLICT (employee_code) DO NOTHING
      `, [userResult.rows[0].id, empCode, deptResult.rows[0]?.id, position, salary]);
    }

    // Create product categories
    const categories = [
      ['Electronics', 'Electronic devices and components'],
      ['Office Supplies', 'General office supplies and stationery'],
      ['Furniture', 'Office and industrial furniture'],
      ['Software', 'Software licenses and subscriptions'],
    ];

    for (const [name, desc] of categories) {
      await query(`
        INSERT INTO product_categories (name, description)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [name, desc]);
    }

    // Create sample products
    const products = [
      ['SKU-LAPTOP-001', 'MacBook Pro 16"', 1, 79900, 65000, 25, 5],
      ['SKU-MONITOR-001', 'Dell UltraSharp 27"', 1, 18900, 14000, 40, 10],
      ['SKU-KEYBOARD-001', 'Mechanical Keyboard RGB', 1, 3500, 1800, 100, 20],
      ['SKU-PAPER-001', 'A4 Paper (5 reams)', 2, 550, 380, 200, 50],
      ['SKU-PEN-001', 'Ballpoint Pen (Box/12)', 2, 180, 90, 300, 50],
      ['SKU-DESK-001', 'Standing Desk Electric', 3, 15900, 9500, 15, 5],
      ['SKU-CHAIR-001', 'Ergonomic Office Chair', 3, 12900, 7200, 30, 10],
      ['SKU-LICENSE-001', 'Microsoft 365 Business', 4, 4200, 3200, 999, 10],
    ];

    for (const [sku, name, catId, price, cost, qty, reorder] of products) {
      await query(`
        INSERT INTO products (sku, name, category_id, unit_price, cost_price, quantity_in_stock, reorder_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (sku) DO NOTHING
      `, [sku, name, catId, price, cost, qty, reorder]);
    }

    // Create customers
    const customers = [
      ['Thai Digital Corp', 'contact@thaidigital.co.th', '02-123-4567', 'Thai Digital Corporation Co.,Ltd', 500000],
      ['Siam Solutions', 'info@siamsolutions.com', '02-987-6543', 'Siam Solutions Co.,Ltd', 300000],
      ['Bangkok Tech', 'sales@bangkoktech.co.th', '02-555-8888', 'Bangkok Tech International', 1000000],
      ['Northern Supplies', 'order@northernsupplies.com', '053-111-2222', 'Northern Supplies Co.,Ltd', 200000],
    ];

    for (const [name, email, phone, company, limit] of customers) {
      await query(`
        INSERT INTO customers (name, email, phone, company, credit_limit)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [name, email, phone, company, limit]);
    }

    // Create chart of accounts
    const accounts = [
      ['1000', 'Cash and Bank', 'asset'],
      ['1100', 'Accounts Receivable', 'asset'],
      ['1200', 'Inventory', 'asset'],
      ['1500', 'Fixed Assets', 'asset'],
      ['2000', 'Accounts Payable', 'liability'],
      ['2100', 'Accrued Expenses', 'liability'],
      ['3000', 'Owner Equity', 'equity'],
      ['3100', 'Retained Earnings', 'equity'],
      ['4000', 'Sales Revenue', 'revenue'],
      ['4100', 'Service Revenue', 'revenue'],
      ['5000', 'Cost of Goods Sold', 'expense'],
      ['5100', 'Salaries Expense', 'expense'],
      ['5200', 'Rent Expense', 'expense'],
      ['5300', 'Utilities Expense', 'expense'],
      ['5400', 'Marketing Expense', 'expense'],
    ];

    for (const [code, name, type] of accounts) {
      await query(`
        INSERT INTO accounts (code, name, type)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO NOTHING
      `, [code, name, type]);
    }

    console.log('✅ Database seeded successfully');
    console.log('');
    console.log('📋 Login credentials:');
    console.log('   Admin: admin@erp.com / admin123');
    console.log('   Employee: somchai@erp.com / password123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
