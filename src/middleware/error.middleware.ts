// src/utils/error.middleware.ts
import { ErrorRequestHandler } from "express"
import { AppError } from "../utils/error"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err) // Log it

  // 1) Catch any 401 (AppError or library)
  const is401 =
    (err as any).status === 401 ||
    (err as any).statusCode === 401 ||
    err.name === "UnauthorizedError"

  if (is401) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: invalid or missing token. Please log in.",
    })
    return
  }

  // 2) Your AppError for other statuses
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // 3) Fallback 500
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
}
