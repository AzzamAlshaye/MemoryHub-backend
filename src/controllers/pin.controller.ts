// src/controllers/pin.controller.ts

import { Request, Response, NextFunction, RequestHandler } from "express"
import { Types } from "mongoose"
import { PinService } from "../services/pin.service"
import { GroupService } from "../services/group.service"
import { PinDocument } from "../models/pin.model"

interface AuthUser {
  _id: Types.ObjectId
  id: string
  role: string
}

// Minimal file shape—only what we read from multer
interface UploadedFile {
  path?: string
}

/** Assert an authenticated user is present */
function ensureUser(req: Request): asserts req is Request & { user: AuthUser } {
  if (!req.user) {
    throw new Error("Missing authenticated user")
  }
}

/** Can this user view that pin? */
async function canViewPin(
  pin: PinDocument,
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  switch (pin.privacy) {
    case "public":
      return true
    case "private":
      return pin.owner.equals(new Types.ObjectId(userId)) || isAdmin
    case "group":
      return pin.groupId
        ? await GroupService.isMember(pin.groupId.toString(), userId)
        : false
  }
  return false
}

export class PinController {
  /** POST /pins */
  static create: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)

      const {
        title,
        description,
        privacy,
        latitude,
        longitude,
        groupId: rawGroupId,
        ...extra
      } = req.body as any

      if (privacy === "group" && !rawGroupId) {
        res.status(400).json({ message: "groupId is required for group pins" })
        return
      }

      const ownerId = req.user.id
      const data: Partial<PinDocument> = {
        title,
        description,
        privacy,
        location: { lat: latitude!, lng: longitude! },
        owner: new Types.ObjectId(ownerId),
        ...extra,
      }
      if (rawGroupId) data.groupId = new Types.ObjectId(rawGroupId)

      const files = (
        req as Request & { files?: Record<string, UploadedFile[]> }
      ).files
      const videoUrl = files?.video?.[0]?.path ?? ""
      const imageUrls = (files?.images ?? [])
        .filter((f) => f.path)
        .map((f) => f.path!)

      data.media = { video: videoUrl, images: imageUrls }

      const pin = await PinService.create(data)
      res.status(201).json(pin)
      return
    } catch (err) {
      next(err)
    }
  }

  /** GET /pins */
  static getAll: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const uid = req.user.id
      const visible = await PinService.getVisibleForUser(uid)
      res.json(visible)
      return
    } catch (err) {
      next(err)
    }
  }

  /** GET /pins/:id */
  static getById: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.sendStatus(404)
        return
      }

      const uid = req.user.id
      const isAdmin = req.user.role === "admin"
      if (!(await canViewPin(pin, uid, isAdmin))) {
        res.status(403).json({ message: "Not authorized to view this pin" })
        return
      }

      res.json(pin)
      return
    } catch (err) {
      next(err)
    }
  }

  /** PUT /pins/:id */
  static update: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const existing = await PinService.getById(req.params.id)
      if (!existing) {
        res.sendStatus(404)
        return
      }

      const uid = req.user.id
      const isAdmin = req.user.role === "admin"
      let canUpdate = false
      if (existing.privacy === "group" && existing.groupId) {
        canUpdate = await GroupService.isMember(
          existing.groupId.toString(),
          uid
        )
      } else {
        canUpdate = existing.owner.equals(new Types.ObjectId(uid)) || isAdmin
      }
      if (!canUpdate) {
        res.status(403).json({ message: "Not authorized to update this pin" })
        return
      }

      const {
        privacy,
        latitude,
        longitude,
        groupId: rawGroupId,
        ...rest
      } = req.body as any

      if (privacy === "group" && !rawGroupId) {
        res.status(400).json({ message: "groupId is required for group pins" })
        return
      }

      const updateData: Partial<PinDocument> = { ...rest }
      if (privacy) updateData.privacy = privacy
      if (latitude !== undefined && longitude !== undefined) {
        updateData.location = { lat: latitude, lng: longitude }
      }
      if (rawGroupId) updateData.groupId = new Types.ObjectId(rawGroupId)

      const files = (
        req as Request & { files?: Record<string, UploadedFile[]> }
      ).files
      if (files?.video?.length || files?.images?.length) {
        const newVideo = files.video?.[0]?.path ?? existing.media.video
        const newImages = files.images
          ? [
              ...existing.media.images,
              ...files.images.filter((f) => f.path).map((f) => f.path!),
            ]
          : existing.media.images
        updateData.media = { video: newVideo, images: newImages }
      }

      const updated = await PinService.update(req.params.id, updateData)
      res.json(updated)
      return
    } catch (err) {
      next(err)
    }
  }

  /** DELETE /pins/:id */
  static delete: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.sendStatus(404)
        return
      }

      const uid = req.user.id
      const isAdmin = req.user.role === "admin"
      const isOwner = pin.owner.equals(new Types.ObjectId(uid))
      if (!isOwner && !isAdmin) {
        res.status(403).json({ message: "Not authorized to delete this pin" })
        return
      }

      await PinService.delete(req.params.id)
      res.sendStatus(204)
      return
    } catch (err) {
      next(err)
    }
  }
}
