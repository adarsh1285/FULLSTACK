import express, { urlencoded }  from "express"
import dotenv from "dotenv"
import cors from "cors"
import db from "./utils/db.js"

dotenv.config()

const app = express()

//import all routes 
import router from "./routes/user.routes.js"

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json()) // ka use Express.js me isliye kiya jata hai taaki server incoming requests ke JSON data ko automatically parse kr ske.
app.use(express.urlencoded({extended: true})) // ka use Express.js me tab kiya jata hai jab aapko HTML form se bheje gaye data ko parse karna hota hai

const port = process.env.PORT || 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// connecting db 
db()

//user routes
app.use("/api/v1/users", router);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})