// src/controllers/pin.controller.ts
import { Request, Response, NextFunction } from "express"
import { PinService } from "../services/pin.service"
import cloudinary from "../config/cloudinary"
import streamifier from "streamifier"
import { Types } from "mongoose"

async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  resource_type: "image" | "video"
) {
  return new Promise<any>((resolve, reject) => {
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
      const userId = (req as any).user.id
      const ownerId = new Types.ObjectId(userId)
      const groupId = new Types.ObjectId(req.body.groupId)
      const { title, description, privacy } = req.body
      const files =
        ((req as any).files as {
          video?: Express.Multer.File[]
          images?: Express.Multer.File[]
        }) || {}
      const media: any = {}

      if (files.video?.[0]) {
        const v = await uploadBuffer(files.video[0].buffer, "pins", "video")
        media.video = { url: v.secure_url, public_id: v.public_id }
      }

      if (files.images?.length) {
        media.images = await Promise.all(
          files.images.map((f) =>
            uploadBuffer(f.buffer, "pins", "image").then((r) => ({
              url: r.secure_url,
              public_id: r.public_id,
            }))
          )
        )
      }

      const pin = await PinService.create({
        owner: ownerId,
        groupId,
        title,
        description,
        privacy,
        media,
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
      const userId = (req as any).user.id
      const pins = await PinService.getVisibleForUser(userId)
      res.json(pins)
    } catch (err) {
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
      const updateData: any = {
        title: req.body.title,
        description: req.body.description,
        privacy: req.body.privacy,
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
