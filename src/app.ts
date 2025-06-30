import "dotenv/config" // load .env first
import express, { Express, Request, Response, NextFunction } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import logger from "./utils/logger"
import { dev, port } from "./utils/helpers"

import authRouter from "./routes/auth.routes"
// import userRouter from "./routes/user.routes"
// import pinRouter from "./routes/pin.routes"
import groupRouter from "./routes/group.routes"

// import reportRouter from "./routes/report.routes"

import { connectDB } from "./config/database"
import { OK, INTERNAL_SERVER_ERROR } from "./utils/http-status"
import { errorHandler } from "./middleware/error.middleware"

// Connect to Mongo
connectDB()

const app: Express = express()

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors())
app.use(helmet())
app.use(
  morgan("tiny", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Main Routers ──────────────────────────────────────────────────────────────
app.use("/auth", authRouter)
// app.use("/users", userRouter)
// app.use("/pins", pinRouter)
app.use("/groups", groupRouter)

// app.use("/reports", reportRouter)

// Health check
app.get("/", (_req: Request, res: Response<{ message: string }>) => {
  res.status(OK).json({ message: "API is running!" })
})

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(errorHandler)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error("Error:", err.message)
  res.status(INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong!",
    error: dev ? err.message : undefined,
  })
})

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`)
})
