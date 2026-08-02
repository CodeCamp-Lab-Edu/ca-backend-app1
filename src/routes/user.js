import { Router } from "express"
import argon2 from "argon2"
import jwt from "jsonwebtoken"
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

    const hashedPassword = await argon2.hash(password)

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, phone, age, avatar }
    })

    res.status(201).json({ id: user.id, name: user.name, email: user.email })
})

// POST /user/login — เข้าสู่ระบบ (มี JWT token)
router.post("/login", async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({ message: "กรุณากรอกอีเมลและรหัสผ่าน" })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" })
    }

    const valid = await argon2.verify(user.password, password)
    if (!valid) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" })
    }

    const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.json({
        message: "เข้าสู่ระบบสำเร็จ",
        token,
        user: { id: user.id, name: user.name, email: user.email }
    })
})

// PUT /user/password — เปลี่ยนรหัสผ่าน
router.put("/password", async (req, res) => {
    const { email, oldPassword, newPassword } = req.body
    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ (email, oldPassword, newPassword)" })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านเดิมไม่ถูกต้อง" })
    }

    const valid = await argon2.verify(user.password, oldPassword)
    if (!valid) {
        return res.status(401).json({ message: "อีเมลหรือรหัสผ่านเดิมไม่ถูกต้อง" })
    }

    const hashedPassword = await argon2.hash(newPassword)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" })
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