import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import departmentRoutes from './routes/departments.js';
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';
import financeRoutes from './routes/finance.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
});
app.use('/api/', limiter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// --- Public Routes ---
app.use('/api/auth', authRoutes);

// --- Protected Routes ---
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/departments', authenticateToken, departmentRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/finance', authenticateToken, financeRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);

// --- Error Handler ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 ERP Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

export default app;
