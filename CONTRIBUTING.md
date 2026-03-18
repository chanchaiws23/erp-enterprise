# Contributing to ERP Enterprise

ขอบคุณที่สนใจจะร่วมพัฒนาระบบ ERP Enterprise! เอกสารนี้อธิบายขั้นตอนการทำงานเป็นทีม

---

## Git Branch Strategy

เราใช้ **Git Flow** ในการจัดการ Branch:

```
main (production)        ← โค้ดที่ deploy ขึ้น production แล้ว
  └── develop            ← โค้ดที่พัฒนาเสร็จ (deploy ไป staging)
       ├── feature/*     ← ฟีเจอร์ใหม่
       ├── fix/*         ← แก้ bug
       ├── hotfix/*      ← แก้ bug ด่วนบน production
       └── chore/*       ← งาน refactor, update dependencies
```

### Branch Naming Convention

| Prefix | ใช้เมื่อ | ตัวอย่าง |
|--------|---------|---------|
| `feature/` | เพิ่มฟีเจอร์ใหม่ | `feature/employee-export-csv` |
| `fix/` | แก้ bug | `fix/login-token-expired` |
| `hotfix/` | แก้ bug ด่วนบน production | `hotfix/payment-calculation` |
| `chore/` | งาน maintenance | `chore/update-dependencies` |
| `docs/` | แก้เอกสาร | `docs/api-documentation` |

---

## Workflow การทำงาน

### 1. สร้าง Branch ใหม่จาก `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### 2. เขียนโค้ดและ Commit
```bash
git add .
git commit -m "feat(module): description of change"
```

### 3. Push ขึ้น Remote
```bash
git push origin feature/your-feature-name
```

### 4. สร้าง Pull Request (PR)
- ไปที่ GitHub → สร้าง PR จาก `feature/your-feature-name` → `develop`
- กรอก PR Template ให้ครบ
- Assign reviewer อย่างน้อย 1 คน

### 5. Code Review
- Reviewer ตรวจโค้ดและให้ feedback
- แก้ไขตาม feedback แล้ว push เพิ่ม
- เมื่อ approve แล้ว → Merge

### 6. Deploy
- Merge ไป `develop` → Auto deploy ไป **Staging**
- ทดสอบบน Staging ผ่าน → Merge ไป `main` → Auto deploy ไป **Production**

---

## Commit Message Convention

เราใช้ [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | ใช้เมื่อ | ตัวอย่าง |
|------|---------|---------|
| `feat` | เพิ่มฟีเจอร์ | `feat(hr): add employee export to CSV` |
| `fix` | แก้ bug | `fix(auth): handle expired JWT token` |
| `docs` | แก้เอกสาร | `docs(readme): update installation steps` |
| `style` | แก้ formatting | `style(client): fix indentation` |
| `refactor` | ปรับโค้ดไม่เปลี่ยนพฤติกรรม | `refactor(api): extract validation middleware` |
| `test` | เพิ่ม/แก้ test | `test(sales): add order creation test` |
| `chore` | งาน maintenance | `chore(deps): update express to 4.21` |
| `perf` | ปรับ performance | `perf(db): add index on sales_orders.date` |

### Scopes

| Scope | หมายถึง |
|-------|---------|
| `auth` | Authentication |
| `hr` | HR / Employees module |
| `inventory` | Inventory module |
| `sales` | Sales module |
| `finance` | Finance module |
| `dashboard` | Dashboard |
| `reports` | Reports module |
| `client` | Frontend ทั่วไป |
| `api` | Backend ทั่วไป |
| `db` | Database |
| `ci` | CI/CD |
| `docker` | Docker config |
| `deps` | Dependencies |

### ตัวอย่าง Commit Messages
```
feat(hr): add leave request approval workflow

- Add approve/reject API endpoints
- Update leave request status in database
- Send notification email to employee

Closes #45
```

```
fix(sales): fix tax calculation rounding error

Tax was being rounded before multiplication, causing
1-2 THB discrepancy on large orders.

Fixes #72
```

---

## Code Review Guidelines

### สิ่งที่ Reviewer ดู
1. **Logic** — โค้ดทำงานถูกต้องไหม?
2. **Security** — มี SQL injection, XSS, hardcoded secrets ไหม?
3. **Performance** — มี N+1 query, unnecessary re-renders ไหม?
4. **Style** — ตาม project convention ไหม?
5. **Tests** — มี test ครอบคลุมไหม?

### วิธี Review
- ✅ **Approve** — โค้ดดี พร้อม merge
- 💬 **Comment** — มีข้อเสนอแนะ ไม่จำเป็นต้องแก้
- ❌ **Request Changes** — ต้องแก้ก่อน merge

---

## Development Setup

### Prerequisites
- Node.js >= 20
- PostgreSQL 16
- Docker & Docker Compose (optional)
- Git

### Quick Start
```bash
# Clone repo
git clone https://github.com/your-org/erp-enterprise.git
cd erp-enterprise

# Install dependencies
npm install --prefix server
npm install --prefix client

# Setup environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# Setup database
npm run db:migrate --prefix server
npm run db:seed --prefix server

# Start development
npm run dev    # Starts both server and client
```

### With Docker
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

---

## Environment Protection Rules

| Branch | Environment | Protection |
|--------|------------|------------|
| `develop` | Staging | ต้องมี PR + 1 approve |
| `main` | Production | ต้องมี PR + 2 approve + CI pass |

### GitHub Branch Protection Settings
สำหรับ `main` branch:
- ✅ Require pull request before merging
- ✅ Require 2 approvals
- ✅ Require status checks (CI must pass)
- ✅ Require branches to be up to date
- ❌ Allow force push

สำหรับ `develop` branch:
- ✅ Require pull request before merging
- ✅ Require 1 approval
- ✅ Require status checks (CI must pass)

---

## Troubleshooting

### Database connection error
```bash
# เช็คว่า PostgreSQL รันอยู่
sudo systemctl status postgresql

# เช็ค connection
psql -U postgres -h localhost -d erp_dev
```

### Port already in use
```bash
# หา process ที่ใช้ port
lsof -i :5000
lsof -i :5173

# หยุด process
kill -9 <PID>
```

### Docker issues
```bash
# ลบทุกอย่างแล้วเริ่มใหม่
docker compose down -v
docker compose up -d --build
```
