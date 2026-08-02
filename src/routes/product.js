import { Router } from "express"
import prisma from "../lib/prisma.js"

const router = Router()

// GET /product — ดูสินค้าทั้งหมด
router.get("/", async (req, res) => {
    const products = await prisma.product.findMany()
    res.json(products)
})

// GET /product/search — ค้นหาสินค้า (ต้องอยู่ก่อน route /:id)
router.get("/search", async (req, res) => {
    const { q, category, minPrice, maxPrice, sortBy, sortOrder, page, limit } = req.query

    // Validate page
    const pageNum = parseInt(page) || 1
    if (pageNum < 1) {
        return res.status(400).json({ message: "กรุณาระบุ page เป็นตัวเลขที่มากกว่า 0" })
    }

    // Validate limit
    const limitNum = Math.min(parseInt(limit) || 10, 100)
    if (limitNum < 1) {
        return res.status(400).json({ message: "กรุณาระบุ limit เป็นตัวเลขที่มากกว่า 0" })
    }

    // Validate sortBy
    const allowedSortBy = ["name", "price", "createdAt"]
    const sortByField = allowedSortBy.includes(sortBy) ? sortBy : "createdAt"

    // Validate sortOrder
    const sortOrderDir = sortOrder === "desc" ? "desc" : "asc"

    // Validate minPrice / maxPrice
    const min = parseFloat(minPrice)
    const max = parseFloat(maxPrice)
    if (minPrice && isNaN(min)) {
        return res.status(400).json({ message: "กรุณาระบุ minPrice เป็นตัวเลข" })
    }
    if (maxPrice && isNaN(max)) {
        return res.status(400).json({ message: "กรุณาระบุ maxPrice เป็นตัวเลข" })
    }

    // Build where clause
    const where = {}
    if (q) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } }
        ]
    }
    if (category) {
        where.category = category
    }
    if (minPrice) {
        where.price = { ...where.price, gte: min }
    }
    if (maxPrice) {
        where.price = { ...where.price, lte: max }
    }

    // Count total items
    const totalItems = await prisma.product.count({ where })

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limitNum) || 0
    const skip = (pageNum - 1) * limitNum

    // Fetch products
    const products = await prisma.product.findMany({
        where,
        orderBy: { [sortByField]: sortOrderDir },
        skip,
        take: limitNum,
        select: {
            id: true,
            name: true,
            price: true,
            category: true,
            description: true,
            image: true,
            createdAt: true,
            updatedAt: true
        }
    })

    res.json({
        data: products,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems,
            totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
        }
    })
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
