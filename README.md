# ERP Enterprise System

<p align="center">
  <strong>Full-Stack Enterprise Resource Planning System</strong><br>
  React + Node.js + PostgreSQL | Monorepo Architecture
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D20-green" alt="Node.js" />
  <img src="https://img.shields.io/badge/react-19-blue" alt="React" />
  <img src="https://img.shields.io/badge/postgresql-16-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED" alt="Docker" />
  <img src="https://img.shields.io/badge/license-MIT-yellow" alt="License" />
</p>

---

## Features

### Modules
| Module | Description | Status |
|--------|-------------|--------|
| **Dashboard** | Overview stats, charts, recent activity | ✅ Done |
| **HR / Employees** | Employee management, leave requests | ✅ Done |
| **Departments** | Organization structure, budgets | ✅ Done |
| **Inventory** | Products, stock levels, categories, low-stock alerts | ✅ Done |
| **Sales** | Sales orders, order tracking, status management | ✅ Done |
| **Customers** | CRM, customer profiles, order history | ✅ Done |
| **Finance** | Invoices, expenses, accounts, P&L summary | ✅ Done |
| **Reports** | Sales analytics, inventory valuation, HR summary | ✅ Done |
| **Settings** | Profile, security, notifications, system info | ✅ Done |

### Technical Highlights
- **Authentication** — JWT-based with role-based access control (RBAC)
- **Roles** — Admin, Manager, Employee, HR, Accountant
- **API** — RESTful with pagination, search, filtering
- **Security** — Rate limiting, CORS, password hashing (bcrypt), SQL parameterized queries
- **Database** — PostgreSQL with migrations, seed data, indexes
- **Docker** — Full containerization with Docker Compose
- **CI/CD** — GitHub Actions for testing + auto-deploy
- **Environment** — Separated Dev / Staging / Production configs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, TailwindCSS 4, React Router 7, Axios, Lucide Icons |
| **Backend** | Node.js 20, Express 4, JWT, bcryptjs |
| **Database** | PostgreSQL 16 |
| **DevOps** | Docker, Docker Compose, GitHub Actions, Nginx |
| **Tools** | ESLint, Conventional Commits, Git Flow |

---

## Project Structure

```
erp-enterprise/
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # React Context (Auth)
│   │   ├── lib/                 # API client, utilities
│   │   └── pages/               # Page components (9 modules)
│   ├── Dockerfile               # Production build
│   ├── Dockerfile.dev           # Development with HMR
│   └── nginx.conf               # Nginx for production serving
│
├── server/                      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/              # Database configuration
│   │   ├── db/                  # Migrations & seed data
│   │   ├── middleware/          # Auth, error handling
│   │   └── routes/              # API routes (8 modules)
│   ├── Dockerfile
│   ├── .env.example
│   ├── .env.development
│   ├── .env.staging
│   └── .env.production
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml               # CI: lint, test, build
│   │   ├── deploy-staging.yml   # CD: auto-deploy to staging
│   │   └── deploy-production.yml # CD: auto-deploy to production
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── docker-compose.yml           # Production compose
├── docker-compose.dev.yml       # Development overrides
├── CONTRIBUTING.md              # Team workflow guide
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** >= 20
- **PostgreSQL** 16 (or use Docker)
- **Git**

### Option 1: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/erp-enterprise.git
cd erp-enterprise

# 2. Install dependencies
npm install
npm install --prefix server
npm install --prefix client

# 3. Setup environment
cp server/.env.example server/.env
# Edit server/.env — set your DATABASE_URL and JWT_SECRET

# 4. Setup database
createdb erp_dev                           # Create database
npm run db:migrate --prefix server         # Run migrations
npm run db:seed --prefix server            # Seed sample data

# 5. Start development servers
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:5173
```

### Option 2: Docker (Recommended)

```bash
# Start everything in one command
docker compose up -d

# Run migrations & seed
docker compose exec server node src/db/migrate.js
docker compose exec server node src/db/seed.js

# Access the app at http://localhost
```

### Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@erp.com | admin123 |
| Manager | somchai@erp.com | password123 |
| HR | pranee@erp.com | password123 |
| Accountant | wichai@erp.com | password123 |
| Employee | somying@erp.com | password123 |

---

## Environment Setup

### Environment Files
```
server/
├── .env.example        ← Template (commit this)
├── .env.development    ← Local dev (DO NOT commit secrets)
├── .env.staging        ← Staging server
└── .env.production     ← Production server
```

### Key Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` / `staging` / `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 64-char string |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/register` | Register | Public |
| GET | `/api/auth/me` | Get current user | Token |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Overview statistics |
| GET | `/api/dashboard/charts/revenue` | Revenue chart data |

### Employees (HR)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (paginated) |
| GET | `/api/employees/:id` | Get employee detail |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| POST | `/api/employees/leave-request` | Submit leave request |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/products` | List products (paginated) |
| POST | `/api/inventory/products` | Create product |
| PUT | `/api/inventory/products/:id` | Update product |
| POST | `/api/inventory/transactions` | Stock in/out |
| GET | `/api/inventory/categories` | List categories |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales/orders` | List orders (paginated) |
| GET | `/api/sales/orders/:id` | Order detail + items |
| POST | `/api/sales/orders` | Create order |
| PATCH | `/api/sales/orders/:id/status` | Update order status |
| GET | `/api/sales/customers` | List customers |
| POST | `/api/sales/customers` | Create customer |

### Finance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/finance/summary` | Financial summary |
| GET | `/api/finance/invoices` | List invoices |
| POST | `/api/finance/invoices` | Create invoice |
| PATCH | `/api/finance/invoices/:id/pay` | Record payment |
| GET | `/api/finance/expenses` | List expenses |
| POST | `/api/finance/expenses` | Create expense |
| GET | `/api/finance/accounts` | Chart of accounts |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/sales-by-month` | Monthly sales report |
| GET | `/api/reports/top-products` | Top selling products |
| GET | `/api/reports/employee-summary` | HR department summary |
| GET | `/api/reports/inventory-valuation` | Stock valuation |
| GET | `/api/reports/financial-overview` | Account balances |

---

## Git Workflow (Team)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed team workflow.

### Quick Reference
```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Commit with convention
git commit -m "feat(sales): add bulk order import"

# Push and create PR
git push origin feature/my-feature
# → Create PR on GitHub: feature/my-feature → develop

# Deploy flow
# develop branch → auto-deploy → Staging
# main branch    → auto-deploy → Production
```

---

## Deployment

### Docker Production
```bash
# On production server
git clone https://github.com/YOUR_USERNAME/erp-enterprise.git
cd erp-enterprise

# Set production env
cp server/.env.production server/.env
# Edit .env with real credentials

# Start
docker compose up -d --build

# Migrations
docker compose exec server node src/db/migrate.js
docker compose exec server node src/db/seed.js
```

### CI/CD Pipeline
```
Push to develop → CI (lint + test + build) → Deploy to Staging
Push to main    → CI (lint + test + build) → Deploy to Production
```

GitHub Secrets required:
- `STAGING_HOST` / `PRODUCTION_HOST` — Server IP
- `DEPLOY_USER` — SSH username
- `SSH_PRIVATE_KEY` — SSH private key

---

## License

MIT License - see [LICENSE](./LICENSE) for details.
