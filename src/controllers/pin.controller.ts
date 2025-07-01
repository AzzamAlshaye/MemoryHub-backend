// src/controllers/pin.controller.ts
import { RequestHandler } from "express"
import { Types } from "mongoose"
import { PinService } from "../services/pin.service"
import { GroupService } from "../services/group.service"
import { PinDocument } from "../models/pin.model"

export class PinController {
  /**
   * POST /pins
   */
  static create: RequestHandler = async (req, res, next) => {
    try {
      const {
        title,
        description,
        privacy,
        latitude,
        longitude,
        groupId: rawGroupId,
        ...extra
      } = req.body as {
        title: string
        description?: string
        privacy: "public" | "private" | "group"
        latitude?: number
        longitude?: number
        groupId?: string
        [key: string]: any
      }

      if (privacy === "group" && !rawGroupId) {
        res
          .status(400)
          .json({ message: "groupId is required when privacy is 'group'" })
        return
      }

      const ownerId = (req as any).user.id as string
      const data: Partial<PinDocument> = {
        title,
        description,
        privacy,
        location: { lat: latitude!, lng: longitude! },
        owner: new Types.ObjectId(ownerId),
        ...extra,
      }
      if (rawGroupId) {
        data.groupId = new Types.ObjectId(rawGroupId)
      }

      const pin = await PinService.create(data)
      res.status(201).json(pin)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /pins
   */
  static getAll: RequestHandler = async (req, res, next) => {
    try {
      const uid = (req as any).user.id as string
      const visible = await PinService.getVisibleForUser(uid)
      res.json(visible)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /pins/:id
   */
  static getById: RequestHandler = async (req, res, next) => {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.status(404).end()
        return
      }

      const uid = (req as any).user.id as string
      const userRole = (req as any).user.role as string
      const isAppAdmin = userRole === "admin"

      const allowed =
        pin.privacy === "public" ||
        (pin.privacy === "private" &&
          (pin.owner.equals(new Types.ObjectId(uid)) || isAppAdmin)) ||
        (pin.privacy === "group" &&
          pin.groupId &&
          (await GroupService.isMember(pin.groupId.toString(), uid)))

      if (!allowed) {
        res.status(403).json({ message: "Not authorized to view this pin" })
        return
      }

      res.json(pin)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /pins/:id
   */
  static update: RequestHandler = async (req, res, next) => {
    try {
      const existing = await PinService.getById(req.params.id)
      if (!existing) {
        res.status(404).end()
        return
      }

      const uid = (req as any).user.id as string
      const userRole = (req as any).user.role as string
      const isAppAdmin = userRole === "admin"

      let canUpdate = false
      if (existing.privacy === "group" && existing.groupId) {
        canUpdate = await GroupService.isMember(
          existing.groupId.toString(),
          uid
        )
      } else {
        canUpdate = existing.owner.equals(new Types.ObjectId(uid)) || isAppAdmin
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
      } = req.body as {
        privacy?: "public" | "private" | "group"
        latitude?: number
        longitude?: number
        groupId?: string
        [key: string]: any
      }

      if (privacy === "group" && !rawGroupId) {
        res
          .status(400)
          .json({ message: "groupId is required when privacy is 'group'" })
        return
      }

      const updateData: Partial<PinDocument> = { ...rest }
      if (privacy) updateData.privacy = privacy
      if (latitude !== undefined && longitude !== undefined) {
        updateData.location = { lat: latitude, lng: longitude }
      }
      if (rawGroupId) {
        updateData.groupId = new Types.ObjectId(rawGroupId)
      }

      const updated = await PinService.update(req.params.id, updateData)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /pins/:id
   */
  static delete: RequestHandler = async (req, res, next) => {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.status(404).end()
        return
      }

      const uid = (req as any).user.id as string
      const userRole = (req as any).user.role as string
      const isAppAdmin = userRole === "admin"
      const isOwner = pin.owner.equals(new Types.ObjectId(uid))

      if (!isOwner && !isAppAdmin) {
        res.status(403).json({ message: "Not authorized to delete this pin" })
        return
      }

      await PinService.delete(req.params.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
