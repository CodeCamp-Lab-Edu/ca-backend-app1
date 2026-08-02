import "dotenv/config"
import express from "express"
import cors from "cors"
import productRouter from "./routes/product.js"
import userRouter from "./routes/user.js"

const app = express();
const PORT = 3000

app.use(cors({
    origin: "http://localhost:5173"
}))
app.use(express.json())

// app.use(cors({
//   origin: [
//     'http://localhost:5173',                 
//     'https://student-frontend.vercel.app'   
//   ]
// }));

app.get("/", (req, res) => {
    res.send("Hello CodeCamp")
})

app.get("/hello", (req, res) => {
    res.send("Hello John")
})

const categories = [
    { id: 1, name: "Electronics", description: "อุปกรณ์อิเล็กทรอนิกส์และคอมพิวเตอร์" },
    { id: 2, name: "Accessories", description: "อุปกรณ์เสริมและของใช้ไอที" },
    { id: 3, name: "Home & Living", description: "ของใช้ภายในบ้านและตกแต่งบ้าน" },
]

app.use("/product", productRouter)
app.use("/user", userRouter)

app.get("/categories", (req, res) => {
    res.json(categories)
})

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`)
// })

if (process.env.NODE_ENV !== 'production') {
  app.listen(3000, () => console.log('Server ready on port 3000'));
}

export default app