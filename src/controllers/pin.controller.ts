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
  // POST /pins
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
    } catch (err) {
      next(err)
    }
  }

  // GET /pins
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

      console.log(
        `[PinController.getAll] params ▶ user=${userId}, filter=${filter}, search="${search}", groupId=${groupIdQ}`
      )

      let pins = await PinService.getVisibleForUser(userId)
      const initialCount = pins.length
      console.log(`[PinController.getAll] initial pins count: ${initialCount}`)

      // 1) privacy filter
      if (["public", "private", "group"].includes(filter)) {
        pins = pins.filter((p) => p.privacy === filter)
        console.log(
          `[PinController.getAll] after privacy="${filter}" count: ${pins.length}`
        )
      }

      // 2) text search
      if (search) {
        pins = pins.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            (p.description?.toLowerCase().includes(search) ?? false)
        )
        console.log(
          `[PinController.getAll] after search="${search}" count: ${pins.length}`
        )
      }

      // 3) groupId filter (robustly handle both ObjectId and populated object)
      if (filter === "group" && Types.ObjectId.isValid(groupIdQ)) {
        console.log(
          `[PinController.getAll] before groupId filter, groupIds:`,
          pins.map((p) => p.groupId)
        )

        pins = pins.filter((p) => {
          let pid = (p as any).groupId
          // if populated, groupId might be an object with its own _id
          if (pid && typeof pid === "object" && pid._id) {
            pid = pid._id
          }
          return pid?.toString() === groupIdQ
        })

        console.log(
          `[PinController.getAll] after groupId="${groupIdQ}" count: ${pins.length}`
        )
      }

      // debug headers
      res.set("X-Debug-Initial-Count", String(initialCount))
      res.set("X-Debug-Final-Count", String(pins.length))

      res.json(pins)
    } catch (err) {
      console.error("[PinController.getAll] ERROR:", err)
      next(err)
    }
  }

  // GET /pins/:id
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
    } catch (err) {
      next(err)
    }
  }

  // PUT /pins/:id
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rawPrivacy = String(req.body.privacy || "public").toLowerCase()
      if (!["public", "private", "group"].includes(rawPrivacy)) {
        res
          .status(400)
          .json({ message: "Privacy must be public, private, or group" })
        return
      }

      const updateData: Partial<{
        title: string
        description: string
        privacy: "public" | "private" | "group"
      }> = {
        title: (req.body.title || "").trim(),
        description: (req.body.description || "").trim(),
        privacy: rawPrivacy as "public" | "private" | "group",
      }

      const updated = await PinService.update(req.params.id, updateData)
      if (!updated) {
        res.sendStatus(404)
        return
      }
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  // DELETE /pins/:id
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await PinService.delete(req.params.id)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }
}
