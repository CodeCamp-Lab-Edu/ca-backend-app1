# มาตรฐานการเขียนโค้ด (Coding Standards)

## โครงสร้างโฟลเดอร์

```
src/
├── server.js              # จุดเริ่มต้นของแอป (entry point)
├── lib/                   # ไฟล์ utilities / config ต่างๆ
│   └── prisma.js          # Prisma Client instance
├── routes/                # Express routes แยกตามโมดูล
│   ├── product.js         # Route ที่เกี่ยวกับสินค้า
│   └── user.js            # Route ที่เกี่ยวกับผู้ใช้
└── generated/             # โค้ดที่ถูก generate อัตโนมัติ (ห้ามแก้ไข)
    └── prisma/            # Prisma Client (auto-generated)

prisma/
└── schema.prisma          # Database schema

http/                      # ไฟล์ทดสอบ API (REST Client)
├── api.http               # ทดสอบ User + Categories
└── product.http           # ทดสอบ Product CRUD
```

## การตั้งชื่อ

| ประเภท | รูปแบบ | ตัวอย่าง |
|--------|--------|----------|
| ไฟล์ทั่วไป | `kebab-case` | `product.js`, `user.js` |
| โฟลเดอร์ | `kebab-case` | `src/routes/`, `src/lib/` |
| ตัวแปร / ฟังก์ชัน | `camelCase` | `findUnique`, `hashedPassword` |
| คลาส | `PascalCase` | `PrismaClient`, `Router` |
| ค่าคงที่ | `UPPER_SNAKE_CASE` | `PORT`, `DATABASE_URL` |
| Model ใน Prisma | `PascalCase` | `User`, `Product` |

## หลักการเขียนโค้ด

### 1. ES Module (ESM)
- ใช้ `import` / `export` แทน `require()` / `module.exports`
- ลงท้าย path import ด้วย `.js` เสมอ

```javascript
// ✅ ถูกต้อง
import { Router } from "express"
import prisma from "../lib/prisma.js"

// ❌ ไม่ถูกต้อง
const express = require("express")
import prisma from "../lib/prisma"
```

### 2. Routes
- 1 ไฟล์ต่อ 1 โมดูล (เช่น `product.js`, `user.js`)
- ใช้ `Router()` จาก express
- export default router
- prefix path กำหนดใน `server.js`

```javascript
// routes/product.js
import { Router } from "express"
const router = Router()
router.get("/", (req, res) => { ... })
export default router

// server.js
app.use("/product", productRouter)
```

### 3. Prisma
- import จาก `src/lib/prisma.js` เท่านั้น
- ใช้ `async/await` เสมอ
- ใช้ `try/catch` จัดการ error
- ใช้ `select` เพื่อจำกัดฟิลด์ที่ส่งกลับ (โดยเฉพาะซ่อน password)

```javascript
import prisma from "../lib/prisma.js"

const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
})
```

### 4. Error Handling
- ส่ง HTTP status code ที่เหมาะสม
- Response format: `{ message: "ข้อความ" }` หรือ `{ message: "...", data: {...} }`

| สถานการณ์ | Status Code |
|-----------|-------------|
| สำเร็จ | 200 |
| สร้างสำเร็จ | 201 |
| ข้อมูลไม่ครบ / ไม่ถูกต้อง | 400 |
| ไม่มีสิทธิ์ / ข้อมูลไม่ตรง | 401 |
| ข้อมูลซ้ำ | 409 |
| ไม่พบข้อมูล | 404 |
| เซิร์ฟเวอร์มีปัญหา | 500 |

### 5. ความปลอดภัย
- รหัสผ่านต้องเข้ารหัสด้วย `argon2` ก่อนเก็บ
- ไม่ส่ง password กลับใน response
- ไม่บอกว่าอีเมลผิดหรือรหัสผิด — บอกแค่ว่า "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

### 6. Prisma Schema Changes
- ใช้ `npx prisma db push` เท่านั้น (ห้ามใช้ `prisma migrate dev`)
- ต้องรัน `npx prisma generate` ทุกครั้งหลังจากแก้ schema

### 7. Environment Variables
- เก็บในไฟล์ `.env`
- โหลดด้วย `import "dotenv/config"` ใน `server.js`