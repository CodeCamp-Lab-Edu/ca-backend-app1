import "dotenv/config"
import prisma from "../src/lib/prisma.js"

const API_URL = "https://fakestoreapi.com/products"

async function main() {
  console.log("⏳ กำลังดึงข้อมูลสินค้าจาก FakeStoreAPI...")

  const res = await fetch(API_URL)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ไม่สามารถดึงข้อมูลจาก API ได้`)
  }

  const products = await res.json()

  console.log(`✅ ดึงข้อมูลมาได้ ${products.length} รายการ กำลังบันทึก...`)

  for (const item of products) {
    await prisma.product.upsert({
      where: { id: item.id },
      update: {
        name: item.title,
        price: item.price,
        category: item.category,
        description: item.description,
        image: item.image,
      },
      create: {
        id: item.id,
        name: item.title,
        price: item.price,
        category: item.category,
        description: item.description,
        image: item.image,
      },
    })
  }

  const count = await prisma.product.count()
  console.log(`🎉 บันทึกสำเร็จ! ขณะนี้มีสินค้าทั้งหมด ${count} รายการในฐานข้อมูล`)
}

main()
  .catch((e) => {
    console.error("❌ เกิดข้อผิดพลาด:")
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())