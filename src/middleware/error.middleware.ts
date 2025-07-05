// src/middleware/error.middleware.ts
import { ErrorRequestHandler } from "express"
import { AppError } from "../utils/error"
import { dev } from "../utils/helpers"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("🔥 Error caught:", err)

  const is401 =
    (err as any).status === 401 ||
    (err as any).statusCode === 401 ||
    err.name === "UnauthorizedError"

  if (is401) {
    res.status(401).json({
      success: false,
      message: err.message || "Unauthorized: invalid or missing token.",
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // Fallback 500: include message & stack in dev
  res.status(500).json({
    success: false,
    message: dev ? err.message : "Something went wrong!",
    ...(dev ? { stack: err.stack } : {}),
  })
}
