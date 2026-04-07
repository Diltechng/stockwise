# StockWise — Inventory Management System

A full-stack inventory management system built for learning.

## Stack
- **Backend**: Node.js + Express
- **Frontend**: Next.js 14 (App Router + TypeScript)
- **Database**: PostgreSQL
- **Auth**: JWT via cookies

---

## Project Structure

```
stockwise/
├── server/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # Route definitions
│   │   └── db/              # Pool, migrate, seed
│   ├── .env.example
│   └── package.json
│
├── client/                  # Next.js app
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── dashboard/   # Stats overview
│   │   │   ├── products/    # Product CRUD
│   │   │   ├── categories/  # Category CRUD
│   │   │   └── stock/       # Stock in/out + history
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # useAuth
│   │   ├── lib/             # API client + services
│   │   └── types/           # TypeScript interfaces
│   ├── .env.local.example
│   └── package.json
│
└── package.json             # Root scripts (runs both)
```

---

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Set up environment variables

**Server** — copy and edit:
```bash
cp server/.env.example server/.env
```

Fill in your values:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/stockwise_db
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

**Client** — copy and edit:
```bash
cp client/.env.local.example client/.env.local
```
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Create the database
```bash
createdb stockwise_db
```

### 4. Run migrations + seed data
```bash
npm run setup
```

### 5. Start development
```bash
npm run dev
```

| App    | URL                         |
|--------|-----------------------------|
| API    | http://localhost:5000       |
| Client | http://localhost:3000       |
| Health | http://localhost:5000/health|

---

## Default Accounts

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@stockwise.com      | admin123   |
| Staff | staff@stockwise.com      | staff123   |

---

## API Reference

### Auth
| Method | Endpoint          | Auth | Description     |
|--------|-------------------|------|-----------------|
| POST   | /api/auth/register | ❌  | Register user   |
| POST   | /api/auth/login    | ❌  | Login           |
| GET    | /api/auth/me       | ✅  | Get current user|

### Dashboard
| Method | Endpoint                   | Auth | Description         |
|--------|----------------------------|------|---------------------|
| GET    | /api/dashboard/stats       | ✅  | Summary stats       |
| GET    | /api/dashboard/low-stock   | ✅  | Low stock products  |

### Categories
| Method | Endpoint              | Auth  | Role  |
|--------|-----------------------|-------|-------|
| GET    | /api/categories       | ✅   | Any   |
| GET    | /api/categories/:id   | ✅   | Any   |
| POST   | /api/categories       | ✅   | Admin |
| PUT    | /api/categories/:id   | ✅   | Admin |
| DELETE | /api/categories/:id   | ✅   | Admin |

### Products
| Method | Endpoint              | Auth  | Role  | Query Params                              |
|--------|-----------------------|-------|-------|-------------------------------------------|
| GET    | /api/products         | ✅   | Any   | page, limit, search, category_id, low_stock |
| GET    | /api/products/:id     | ✅   | Any   |                                           |
| POST   | /api/products         | ✅   | Admin |                                           |
| PUT    | /api/products/:id     | ✅   | Admin |                                           |
| DELETE | /api/products/:id     | ✅   | Admin | Soft delete                               |

### Stock
| Method | Endpoint              | Auth  | Body                            |
|--------|-----------------------|-------|---------------------------------|
| GET    | /api/stock/history    | ✅   | Query: product_id, type, page   |
| POST   | /api/stock/add        | ✅   | product_id, quantity, note?     |
| POST   | /api/stock/remove     | ✅   | product_id, quantity, note?     |

---

## Intern Tasks

Things left for the intern to practise:

1. **Register page** — form is scaffolded, wire it to `authService.register`
2. **Product image upload** — add file input + backend multer endpoint
3. **User management page** — admin can view/create users
4. **Export to CSV** — download stock history as CSV
5. **Search improvements** — debounce the product search input
6. **Form validation** — add client-side validation with error messages
7. **Dark/light toggle** — implement theme switcher
8. **Responsive sidebar** — collapse sidebar on mobile with a hamburger menu
