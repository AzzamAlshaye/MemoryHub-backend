import { Request, Response, NextFunction } from "express"
import { PinService } from "../services/pin.service"
import cloudinary from "../config/cloudinary"
import streamifier from "streamifier"
import { Types } from "mongoose"

// Helper to upload buffer to Cloudinary and return secure_url
async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video"
): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (err, result) => (err ? reject(err) : resolve(result))
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
      console.log("[PinController.create] user:", (req as any).user)
      console.log("[PinController.create] body:", req.body)
      console.log("[PinController.create] files:", (req as any).files)

      const userId = (req as any).user.id
      const ownerId = new Types.ObjectId(userId)

      // Parse and validate location
      const lat = parseFloat(req.body.latitude)
      const lng = parseFloat(req.body.longitude)
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid or missing latitude/longitude")
      }
      const location = { lat, lng }

      // Normalize privacy enum
      const rawPrivacy = String(req.body.privacy || "public")
      const privacy = rawPrivacy.toLowerCase() as "public" | "private" | "group"

      // Optional groupId
      const groupId = req.body.groupId
        ? new Types.ObjectId(req.body.groupId)
        : undefined

      const { title, description } = req.body

      const files = (req as any).files as {
        video?: Express.Multer.File[]
        images?: Express.Multer.File[]
      }

      let imageUrls: string[] = []
      let videoUrl = ""

      if (files.video?.[0]) {
        const vRes = await uploadBuffer(files.video[0].buffer, "pins", "video")
        videoUrl = vRes.secure_url
      }

      if (files.images?.length) {
        imageUrls = await Promise.all(
          files.images.map((f) =>
            uploadBuffer(f.buffer, "pins", "image").then((r) => r.secure_url)
          )
        )
      }

      const pin = await PinService.create({
        owner: ownerId,
        groupId,
        title,
        description,
        privacy,
        location,
        media: {
          images: imageUrls,
          video: videoUrl,
        },
      })

      console.log("[PinController.create] created pin id=", pin._id)
      res.status(201).json(pin)
    } catch (err) {
      console.error("[PinController.create] Error:", err)
      next(err)
    }
  }

  // GET /pins with filter & search
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log("[PinController.getAll] query:", req.query)
      // Optional userId for permission-based visibility
      const userId = (req as any).user?.id
      // Extract filter & search
      const filter = String(req.query.filter || "public").toLowerCase()
      const search = String(req.query.search || "")
      console.log(
        `[PinController.getAll] userId=${userId}, filter=${filter}, search=${search}`
      )

      // Get all pins visible to user
      let pins = await PinService.getVisibleForUser(userId)

      // Apply privacy filter
      if (["public", "private", "group"].includes(filter)) {
        pins = pins.filter((pin) => pin.privacy === filter)
      }

      // Apply search term
      if (search) {
        const term = search.toLowerCase()
        pins = pins.filter((pin) => {
          const titleMatch = pin.title?.toLowerCase().includes(term) ?? false
          const descMatch =
            pin.description?.toLowerCase().includes(term) ?? false
          return titleMatch || descMatch
        })
      }

      console.log(
        `[PinController.getAll] returning ${pins.length} pins after filtering`
      )
      res.json(pins)
    } catch (err) {
      console.error("[PinController.getAll] Error:", err)
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
      console.error("[PinController.getById] Error:", err)
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
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        privacy: String(req.body.privacy || "public").toLowerCase() as
          | "public"
          | "private"
          | "group",
      }

      const updated = await PinService.update(req.params.id, updateData)
      if (!updated) {
        res.sendStatus(404)
        return
      }
      res.json(updated)
    } catch (err) {
      console.error("[PinController.update] Error:", err)
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
      console.error("[PinController.delete] Error:", err)
      next(err)
    }
  }
}
