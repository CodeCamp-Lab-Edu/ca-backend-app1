import { Router } from "express"
import prisma from "../lib/prisma.js"

const router = Router()

// POST /user/register — สมัครสมาชิก
router.post("/register", async (req, res) => {
    const { name, email, password, phone, age, avatar } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ (name, email, password)" })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return res.status(409).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" })
    }

    const user = await prisma.user.create({
        data: { name, email, password, phone, age, avatar }
    })

    res.status(201).json({ id: user.id, name: user.name, email: user.email })
})

// GET /user — ดูสมาชิกทั้งหมด
router.get("/", async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, age: true, avatar: true, createdAt: true }
    })
    res.json(users)
})

// GET /user/:id — ดูสมาชิกตาม ID
router.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) },
        select: { id: true, name: true, email: true, phone: true, age: true, avatar: true, createdAt: true }
    })
    if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้" })
    }
    res.json(user)
})

export default router