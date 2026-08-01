import express from "express"

const app = express();
const PORT = 3000

app.get("/", (req, res) => {
    res.send("Hello CodeCamp")
})

app.get("/hello", (req, res) => {
    res.send("Hello John")
})

const products = [
    { id: 1, name: "MacBook Pro M4", price: 89000, category: "Electronics" },
    { id: 2, name: "AirPods Pro 2", price: 12900, category: "Accessories" },
    { id: 3, name: "iPad Air M3", price: 35900, category: "Electronics" },
]

const categories = [
    { id: 1, name: "Electronics", description: "อุปกรณ์อิเล็กทรอนิกส์และคอมพิวเตอร์" },
    { id: 2, name: "Accessories", description: "อุปกรณ์เสริมและของใช้ไอที" },
    { id: 3, name: "Home & Living", description: "ของใช้ภายในบ้านและตกแต่งบ้าน" },
]

app.get("/product", (req, res) => {
    //TODO:
    res.json(products)
})

app.get("/product/:id", (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id))
    if (!product) {
        return res.status(404).json({ message: "ไม่พบสินค้าที่ค้นหา" })
    }
    res.json(product)
})

app.get("/categories", (req, res) => {
    res.json(categories)
})

// app.post()
// app.delete()

app.listen(PORT, (req, res)=> {
    console.log(`Server is running on http://localhost:${PORT}`)
})