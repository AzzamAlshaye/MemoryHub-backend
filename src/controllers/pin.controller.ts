import { Request, Response, NextFunction } from "express"
import { PinService } from "../services/pin.service"
import cloudinary from "../config/cloudinary"
import streamifier from "streamifier"
import { Types } from "mongoose"

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
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const ownerId = new Types.ObjectId(userId)

      const lat = parseFloat(req.body.latitude)
      const lng = parseFloat(req.body.longitude)
      if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid latitude/longitude")
      const location = { lat, lng }

      const privacy = String(req.body.privacy || "public").toLowerCase() as
        | "public"
        | "private"
        | "group"

      const groupId = req.body.groupId ? new Types.ObjectId(req.body.groupId) : undefined

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
        media: { images: imageUrls, video: videoUrl },
      })

      res.status(201).json(pin)
    } catch (err) {
      next(err)
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id
      const filter = String(req.query.filter || "public").toLowerCase()
      const search = String(req.query.search || "")

      let pins = await PinService.getVisibleForUser(userId)

      if (["public", "private", "group"].includes(filter)) {
        pins = pins.filter((pin) => pin.privacy === filter)
      }

      if (search) {
        const term = search.toLowerCase()
        pins = pins.filter((pin) => {
          return (
            pin.title?.toLowerCase().includes(term) ||
            pin.description?.toLowerCase().includes(term)
          )
        })
      }

      res.json(pins)
    } catch (err) {
      next(err)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
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

  static async update(req: Request, res: Response, next: NextFunction) {
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
      next(err)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PinService.delete(req.params.id)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }


  static async getMyPins(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id
      const pins = await PinService.getPinsByUser(userId)
      res.json(pins)
    } catch (err) {
      next(err)
    }
  }
}
