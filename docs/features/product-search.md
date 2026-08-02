# Product Search — Feature Specification

> ระบบค้นหาสินค้า สำหรับร้านค้าออนไลน์

---

## 📌 ภาพรวม (Overview)

เพิ่มความสามารถในการค้นหาสินค้าด้วยเงื่อนไขที่หลากหลาย เช่น ค้นหาจากชื่อหรือคำอธิบาย กรองตามหมวดหมู่ ช่วงราคา เรียงลำดับผลลัพธ์ และแบ่งหน้าข้อมูล (pagination) เพื่อให้ผู้ใช้ค้นหาสินค้าที่ต้องการได้สะดวกและรวดเร็ว

---

## 🎯 ผู้ใช้ที่เกี่ยวข้อง (Actors)

- **ผู้ใช้ทั่วไป (Guest)** — ไม่ต้องมีบัญชี ก็สามารถค้นหาสินค้าได้

---

## 🧩 API Endpoint

### `GET /product/search`

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/product/search` | ค้นหาสินค้าตามเงื่อนไข | ❌ |

> **หมายเหตุ:** ต้องวาง route `/search` **ไว้ก่อน** route `/:id` ในไฟล์ product route มิฉะนั้น Express จะตีความคำว่า `search` เป็น `:id`

---

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | `string` | ❌ | — | คำค้นหา (ค้นหาทั้งชื่อและคำอธิบายสินค้า, case-insensitive) |
| `category` | `string` | ❌ | — | กรองตามหมวดหมู่สินค้า (ตรงตาม字段 category ในฐานข้อมูล) |
| `minPrice` | `number` | ❌ | — | ราคาขั้นต่ำ (รวม) |
| `maxPrice` | `number` | ❌ | — | ราคาสูงสุด (รวม) |
| `sortBy` | `enum` | ❌ | `createdAt` | ฟิลด์ที่ใช้เรียงลำดับ — ค่าที่รองรับ: `name`, `price`, `createdAt` |
| `sortOrder` | `enum` | ❌ | `asc` | ทิศทางการเรียง — `asc` (น้อยไปมาก / ก-ฮ) หรือ `desc` (มากไปน้อย / ฮ-ก) |
| `page` | `number` | ❌ | `1` | หน้าที่ต้องการ (เริ่มที่ 1) |
| `limit` | `number` | ❌ | `10` | จำนวนสินค้าต่อหน้า (สูงสุด 100) |

---

### Response Format (สำเร็จ)

**Status:** `200 OK`

```json
{
  "data": [
    {
      "id": 1,
      "name": "MacBook Pro M4",
      "price": 89000,
      "category": "Electronics",
      "description": "แล็ปท็อปประสิทธิภาพสูง",
      "image": "https://via.placeholder.com/150",
      "createdAt": "2026-08-01T12:00:00.000Z",
      "updatedAt": "2026-08-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Response Format (ไม่พบผลลัพธ์)

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Response Format (ข้อผิดพลาด)

**Status:** `400 Bad Request`

```json
{
  "message": "กรุณาระบุ page เป็นตัวเลขที่มากกว่า 0"
}
```

---

## 🧠 ตรรกะการทำงาน (Business Logic)

1. **ค้นหาจากคำค้น (`q`)** — ใช้ Prisma `contains` (case-insensitive) ค้นหาทั้งฟิลด์ `name` และ `description` โดยใช้ `OR`
2. **กรองตามหมวดหมู่ (`category`)** — ใช้ Prisma `equals` กรองเฉพาะสินค้าที่มี `category` ตรงตามที่ระบุ
3. **กรองช่วงราคา (`minPrice` / `maxPrice`)** — ใช้ Prisma `gte` / `lte` กับฟิลด์ `price`
4. **เรียงลำดับ (`sortBy` + `sortOrder`)** — ใช้ Prisma `orderBy` โดย `sortBy` ต้องเป็นฟิลด์ที่รองรับเท่านั้น ถ้าไม่รองรับให้ใช้ค่าเริ่มต้น
5. **แบ่งหน้า (`page` + `limit`)** — ใช้ Prisma `skip` และ `take` คำนวณจาก `(page - 1) * limit`
6. **นับจำนวนทั้งหมด** — ใช้ Prisma `count` ด้วย `where` เดียวกับ query หลัก เพื่อนำมาคำนวณ `totalPages`, `hasNext`, `hasPrev`

---

## ✅ Validation

| Parameter | เงื่อนไข | การจัดการ error |
|-----------|---------|----------------|
| `page` | ต้องเป็นจำนวนเต็ม ≥ 1 | `400` — "กรุณาระบุ page เป็นตัวเลขที่มากกว่า 0" |
| `limit` | ต้องเป็นจำนวนเต็ม 1–100 | `400` — "กรุณาระบุ limit เป็นตัวเลขระหว่าง 1–100" |
| `minPrice` | ต้องเป็นตัวเลข ≥ 0 | `400` — "กรุณาระบุ minPrice เป็นตัวเลขที่มากกว่าหรือเท่ากับ 0" |
| `maxPrice` | ต้องเป็นตัวเลข ≥ 0 | `400` — "กรุณาระบุ maxPrice เป็นตัวเลขที่มากกว่าหรือเท่ากับ 0" |
| `sortBy` | ต้องเป็น `name`, `price`, หรือ `createdAt` เท่านั้น | `400` — "sortBy ไม่ถูกต้อง รองรับเฉพาะ name, price, createdAt" |
| `sortOrder` | ต้องเป็น `asc` หรือ `desc` เท่านั้น | `400` — "sortOrder ไม่ถูกต้อง รองรับเฉพาะ asc, desc" |

---

## 📋 ตัวอย่างการเรียกใช้งาน

### ค้นหาสินค้าด้วยคำค้น
```
GET /product/search?q=macbook
```

### ค้นหาสินค้าตามหมวดหมู่
```
GET /product/search?category=Electronics
```

### ค้นหาสินค้าช่วงราคา
```
GET /product/search?minPrice=10000&maxPrice=50000
```

### ค้นหา + กรอง + เรียงลำดับ
```
GET /product/search?q=air&category=Accessories&sortBy=price&sortOrder=desc
```

### แบ่งหน้า
```
GET /product/search?page=2&limit=5
```

### ผสมทั้งหมด
```
GET /product/search?q=pro&category=Electronics&minPrice=1000&maxPrice=100000&sortBy=price&sortOrder=asc&page=1&limit=20
```

---

## 🔗 การใช้งานร่วมกับระบบที่มีอยู่

- Route ใหม่ `/product/search` จะถูกเพิ่มในไฟล์ `src/routes/product.js`
- ใช้ Prisma Client จาก `src/lib/prisma.js` เหมือนเดิม
- ไม่ต้องแก้ไข `schema.prisma` เพราะใช้ฟิลด์ที่มีอยู่แล้ว
- ไม่ต้องแก้ไข `server.js` เพราะใช้ prefix `/product` เดิม

---

## 🧪 Test Cases (สำหรับไฟล์ `http/product.http`)

```
### ค้นหาสินค้าด้วยคำค้น
GET http://localhost:3000/product/search?q=macbook

### ค้นหาสินค้าตามหมวดหมู่
GET http://localhost:3000/product/search?category=Electronics

### ค้นหาสินค้าช่วงราคา
GET http://localhost:3000/product/search?minPrice=10000&maxPrice=50000

### ค้นหาแบบผสมทั้งหมด
GET http://localhost:3000/product/search?q=pro&category=Electronics&sortBy=price&sortOrder=desc&page=1&limit=10

### ทดสอบ validation — page ไม่ถูกต้อง
GET http://localhost:3000/product/search?page=0

### ทดสอบ validation — sortBy ไม่ถูกต้อง
GET http://localhost:3000/product/search?sortBy=stock
```