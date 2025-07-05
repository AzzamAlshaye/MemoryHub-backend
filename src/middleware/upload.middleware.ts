// src/middleware/upload.middleware.ts
import multer from "multer"
import streamifier from "streamifier"
import cloudinary from "../config/cloudinary"
import { Request, Response, NextFunction } from "express"

// Keep files in memory so we can stream them
const memoryStorage = multer.memoryStorage()
export const upload = multer({ storage: memoryStorage })

// A factory to create middleware that streams `req.file` to Cloudinary
export function uploadToCloudinary(options: {
  fieldname: string
  folder: string
  resource_type?: "image" | "video" | "auto"
}) {
  return function (req: Request, res: Response, next: NextFunction) {
    const file = (req as any).file
    if (!file || file.fieldname !== options.fieldname) {
      return next()
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resource_type ?? "auto",
      },
      (error, result) => {
        if (error) {
          return next(error)
        }
        // attach the Cloudinary result onto req.file
        file.cloudinary = result
        next()
      }
    )

    // pipe the buffer into the upload stream
    streamifier.createReadStream(file.buffer).pipe(stream)
  }
}
