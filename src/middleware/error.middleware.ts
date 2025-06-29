// src/utils/error.middleware.ts

import { ErrorRequestHandler } from "express"
import { AppError } from "../utils/error"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err) // Log for your own debugging

  if (err instanceof AppError) {
    // Send the custom AppError status/message
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }
  // Fallback for any other errors
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
  // no `return res...` here either
}
