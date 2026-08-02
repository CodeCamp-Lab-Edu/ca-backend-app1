# ca-backend-app1 — API Specification

> Backend API สำหรับระบบร้านค้าออนไลน์ (CodeCamp Project)

---

## 🏗️ โครงสร้างโปรเจกต์

```
ca-backend-app1/
├── prisma/
│   ├── schema.prisma          # Prisma schema (models, relations)
│   ├── seed.js                # Seed script (ดึงข้อมูลจาก FakeStoreAPI)
│   ├── migrations/            # Migration files
│   └── migration_lock.toml
├── src/
│   ├── server.js              # Entry point — Express app
│   ├── lib/
│   │   └── prisma.js          # Prisma Client instance
│   ├── routes/
│   │   ├── product.js         # Product routes
│   │   └── user.js            # User routes
│   └── generated/prisma/      # Prisma Client (generated)
├── http/
│   ├── api.http               # REST Client tests — User & Categories
│   └── product.http           # REST Client tests — Product
├── docs/
│   └── spec.md                # ไฟล์นี้
├── prisma.config.ts           # Prisma config
├── package.json
└── .env                       # Environment variables
```

---

## ⚙️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js (ES Module) |
| Framework | Express 5 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 7 + Prisma Adapter PG |
| Auth | Argon2 (password hashing) + JWT |
| CORS | อนุญาตเฉพาะ `http://localhost:5173` |

---

## 🗄️ Database Schema

### Product

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `Int` | PK, autoincrement |
| `name` | `String` | required |
| `price` | `Float` | required |
| `category` | `String` | required |
| `description` | `String?` | optional |
| `image` | `String?` | optional |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

### User

| Field | Type | Attributes |
|-------|------|------------|
| `id` | `Int` | PK, autoincrement |
| `name` | `String` | required |
| `email` | `String` | unique, required |
| `password` | `String` | required (hashed with Argon2) |
| `phone` | `String?` | optional |
| `age` | `Int?` | optional |
| `avatar` | `String?` | optional |
| `createdAt` | `DateTime` | `@default(now())` |
| `updatedAt` | `DateTime` | `@updatedAt` |

---

## 🌐 API Endpoints

### Product

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/product` | ดูสินค้าทั้งหมด | ❌ |
| `GET` | `/product/:id` | ดูสินค้าตาม ID | ❌ |
| `POST` | `/product` | เพิ่มสินค้าใหม่ | ❌ |
| `PUT` | `/product/:id` | แก้ไขสินค้า | ❌ |
| `DELETE` | `/product/:id` | ลบสินค้า | ❌ |

**POST / PUT body:**
```json
{
  "name": "string (required)",
  "price": "number (required)",
  "category": "string (required)",
  "image": "string (optional)"
}
```

### User

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/user/register` | สมัครสมาชิก | ❌ |
| `POST` | `/user/login` | เข้าสู่ระบบ (ได้ JWT token) | ❌ |
| `PUT` | `/user/password` | เปลี่ยนรหัสผ่าน | ❌ |
| `GET` | `/user` | ดูสมาชิกทั้งหมด (ไม่รวม password) | ❌ |
| `GET` | `/user/:id` | ดูสมาชิกตาม ID (ไม่รวม password) | ❌ |

**POST /user/register body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "phone": "string (optional)",
  "age": "number (optional)",
  "avatar": "string (optional)"
}
```

**POST /user/login body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (login สำเร็จ):**
```json
{
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "jwt_token_here",
  "user": { "id": 1, "name": "...", "email": "..." }
}
```

**PUT /user/password body:**
```json
{
  "email": "string (required)",
  "oldPassword": "string (required)",
  "newPassword": "string (required)"
}
```

### Categories (static)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/categories` | ดูหมวดหมู่ทั้งหมด (hardcoded) |

**Response:**
```json
[
  { "id": 1, "name": "Electronics", "description": "อุปกรณ์อิเล็กทรอนิกส์และคอมพิวเตอร์" },
  { "id": 2, "name": "Accessories", "description": "อุปกรณ์เสริมและของใช้ไอที" },
  { "id": 3, "name": "Home & Living", "description": "ของใช้ภายในบ้านและตกแต่งบ้าน" }
]
```

### Health Check

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Hello CodeCamp |
| `GET` | `/hello` | Hello John |

---

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `JWT_SECRET` | Secret key สำหรับ signing JWT tokens |

---

## 🚀 การรันโปรเจกต์

```bash
# ติดตั้ง dependencies
npm install

# รัน development server (พร้อม auto-reload)
npm run dev
```

Server จะรันที่ `http://localhost:3000`

---

## 🌱 Seed Data

```bash
node prisma/seed.js
```

- ดึงสินค้า 20 รายการจาก [FakeStoreAPI](https://fakestoreapi.com/products)
- ใช้ `upsert` — สามารถรันซ้ำได้โดยไม่ซ้ำข้อมูล
- แมปฟิลด์: `title` → `name`, `price` → `price`, `category` → `category`, `description` → `description`, `image` → `image`

---

## 🧪 การทดสอบ API

เปิดไฟล์ใน `http/` แล้วกด **Send Request** (ใช้ VS Code REST Client extension):

- `http/api.http` — ทดสอบ User (register, login, change password) และ Categories
- `http/product.http` — ทดสอบ Product (CRUD)

---

## 📝 Coding Standards

- **ไฟล์/โฟลเดอร์:** kebab-case
- **ตัวแปร/ฟังก์ชัน:** camelCase
- **คลาส/Model:** PascalCase
- **ค่าคงที่:** UPPER_SNAKE_CASE
- **Modules:** ES Module (`import`/`export`) เท่านั้น
- **import path:** ลงท้าย `.js` เสมอ
- **Prisma:** ใช้ `db push` เท่านั้น, ห้าม `migrate dev`