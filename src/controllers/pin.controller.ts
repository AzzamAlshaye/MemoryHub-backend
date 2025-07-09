// src/controllers/pin.controller.ts
import { Request, Response, NextFunction } from "express"
import { Types } from "mongoose"
import { PinService } from "../services/pin.service"
import cloudinary from "../config/cloudinary"
import streamifier from "streamifier"

interface CloudinaryUploadResult {
  secure_url: string
}

// Helper to upload a Buffer to Cloudinary
async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (err, result) => (err ? reject(err) : resolve(result as any))
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

export class PinController {
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rawUser = (req as any).user
      if (!rawUser?.id || !Types.ObjectId.isValid(rawUser.id)) {
        res.status(401).json({ message: "Invalid or missing user" })
        return
      }
      const ownerId = new Types.ObjectId(rawUser.id)

      const title = (req.body.title || "").trim()
      if (!title) {
        res.status(400).json({ message: "Title is required" })
        return
      }

      const description = (req.body.description || "").trim()
      const lat = parseFloat(req.body.latitude)
      const lng = parseFloat(req.body.longitude)
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ message: "Invalid latitude/longitude" })
        return
      }

      const rawPrivacy = (req.body.privacy || "public").toLowerCase()
      if (!["public", "private", "group"].includes(rawPrivacy)) {
        res
          .status(400)
          .json({ message: "Privacy must be public, private, or group" })
        return
      }
      const privacy = rawPrivacy as "public" | "private" | "group"

      let groupObjId: Types.ObjectId | undefined
      if (privacy === "group") {
        const gid = (req.body.groupId || "").trim()
        if (!Types.ObjectId.isValid(gid)) {
          res
            .status(400)
            .json({ message: "Valid groupId is required for group privacy" })
          return
        }
        groupObjId = new Types.ObjectId(gid)
      }

      const files = (req as any).files as {
        images?: Express.Multer.File[]
        video?: Express.Multer.File[]
      }

      let videoUrl = ""
      if (files.video?.[0]) {
        const { secure_url } = await uploadBuffer(
          files.video[0].buffer,
          "pins",
          "video"
        )
        videoUrl = secure_url
      }

      const imageUrls: string[] = []
      if (files.images?.length) {
        for (const img of files.images.slice(0, 10)) {
          const { secure_url } = await uploadBuffer(img.buffer, "pins", "image")
          imageUrls.push(secure_url)
        }
      }

      const pin = await PinService.create({
        owner: ownerId,
        title,
        description,
        privacy,
        location: { lat, lng },
        groupId: groupObjId,
        media: { images: imageUrls, video: videoUrl },
      })

      res.status(201).json(pin)
      return
    } catch (err) {
      next(err)
    }
  }

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user?.id
      const filter = String(req.query.filter || "public").toLowerCase()
      const search = String(req.query.search || "")
        .trim()
        .toLowerCase()
      const groupIdQ = String(req.query.groupId || "")

      let pins = await PinService.getVisibleForUser(userId)
      const initialCount = pins.length

      if (["public", "private", "group"].includes(filter)) {
        pins = pins.filter((p) => p.privacy === filter)
      }

      if (search) {
        pins = pins.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            (p.description?.toLowerCase().includes(search) ?? false)
        )
      }

      if (filter === "group" && Types.ObjectId.isValid(groupIdQ)) {
        pins = pins.filter((p) => {
          let pid: any = (p as any).groupId
          if (pid && typeof pid === "object" && pid._id) pid = pid._id
          return pid?.toString() === groupIdQ
        })
      }

      res.set("X-Debug-Initial-Count", String(initialCount))
      res.set("X-Debug-Final-Count", String(pins.length))
      res.json(pins)
      return
    } catch (err) {
      next(err)
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.sendStatus(404)
        return
      }
      res.json(pin)
      return
    } catch (err) {
      next(err)
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1) Validate privacy
      const rawPrivacy = String(req.body.privacy || "public").toLowerCase()
      if (!["public", "private", "group"].includes(rawPrivacy)) {
        res
          .status(400)
          .json({ message: "Privacy must be public, private, or group" })
        return
      }
      const privacy = rawPrivacy as "public" | "private" | "group"

      // 2) Title & description
      const title = (req.body.title || "").trim()
      if (!title) {
        res.status(400).json({ message: "Title is required" })
        return
      }
      const description = (req.body.description || "").trim()

      // 3) Location
      const lat = parseFloat(req.body.latitude)
      const lng = parseFloat(req.body.longitude)
      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ message: "Invalid latitude/longitude" })
        return
      }

      // 4) Group ID
      let groupObjId: Types.ObjectId | undefined
      if (privacy === "group") {
        const gid = (req.body.groupId || "").trim()
        if (!Types.ObjectId.isValid(gid)) {
          res
            .status(400)
            .json({ message: "Valid groupId is required for group privacy" })
          return
        }
        groupObjId = new Types.ObjectId(gid)
      }

      // 5) Handle uploads
      const files = (req as any).files as {
        images?: Express.Multer.File[]
        video?: Express.Multer.File[]
      }

      let videoUrl: string | undefined
      if (files.video?.[0]) {
        const { secure_url } = await uploadBuffer(
          files.video[0].buffer,
          "pins",
          "video"
        )
        videoUrl = secure_url
      }

      const imageUrls: string[] = []
      if (files.images?.length) {
        for (const img of files.images.slice(0, 10)) {
          const { secure_url } = await uploadBuffer(img.buffer, "pins", "image")
          imageUrls.push(secure_url)
        }
      }

      // 6) Build update payload
      const updateData: Partial<PinService> = {
        title,
        description,
        privacy,
        location: { lat, lng },
        ...(groupObjId ? { groupId: groupObjId } : {}),
        ...(imageUrls.length || videoUrl
          ? {
              media: {
                ...(imageUrls.length ? { images: imageUrls } : {}),
                ...(videoUrl ? { video: videoUrl } : {}),
              },
            }
          : {}),
      }

      // 7) Perform update
      const updated = await PinService.update(req.params.id, updateData)
      if (!updated) {
        res.sendStatus(404)
        return
      }

      // **DO NOT** `return res.json(...)` — just call `res.json(...)` and then `return;`
      res.json(updated)
      return
    } catch (err) {
      next(err)
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await PinService.delete(req.params.id)
      res.sendStatus(204)
      return
    } catch (err) {
      next(err)
    }
  }

  static async getMyPins(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.id
      const pins = await PinService.getPinsByUser(userId)
      res.json(pins)
      return
    } catch (err) {
      next(err)
    }
  }
}
