import { Router } from "express"
import prisma from "../lib/prisma.js"

const router = Router()

// GET /product — ดูสินค้าทั้งหมด
router.get("/", async (req, res) => {
    const products = await prisma.product.findMany()
    res.json(products)
})

// GET /product/:id — ดูสินค้าตาม ID
router.get("/:id", async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: parseInt(req.params.id) }
    })
    if (!product) {
        return res.status(404).json({ message: "ไม่พบสินค้าที่ค้นหา" })
    }
    res.json(product)
})

// POST /product — เพิ่มสินค้าใหม่
router.post("/", async (req, res) => {
    const { name, price, category, image } = req.body
    if (!name || !price || !category) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ (name, price, category)" })
    }
    const newProduct = await prisma.product.create({
        data: { name, price, category, image }
    })
    res.status(201).json(newProduct)
})

// PUT /product/:id — แก้ไขสินค้า
router.put("/:id", async (req, res) => {
    const { name, price, category, image } = req.body
    try {
        const product = await prisma.product.update({
            where: { id: parseInt(req.params.id) },
            data: { name, price, category, image }
        })
        res.json(product)
    } catch {
        return res.status(404).json({ message: "ไม่พบสินค้าที่ค้นหา" })
    }
})

// DELETE /product/:id — ลบสินค้า
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await prisma.product.delete({
            where: { id: parseInt(req.params.id) }
        })
        res.json({ message: "ลบสินค้าเรียบร้อย", product: deleted })
    } catch {
        return res.status(404).json({ message: "ไม่พบสินค้าที่ค้นหา" })
    }
})

export default router
