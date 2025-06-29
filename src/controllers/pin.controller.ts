// src/controllers/pin.controller.ts
import { RequestHandler } from "express"
import { Types } from "mongoose"
import { PinService } from "../services/pin.service"
import { GroupService } from "../services/group.service"

export class PinController {
  /**
   * POST /pins
   */
  static create: RequestHandler = async (req, res, next) => {
    try {
      const data = { ...req.body, owner: (req as any).user.id }
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
      const all = await PinService.getAll()
      const uid = (req as any).user.id
      const visible = []

      for (const pin of all) {
        if (pin.privacy === "public") {
          visible.push(pin)
        } else if (
          pin.privacy === "private" &&
          pin.owner.equals(new Types.ObjectId(uid))
        ) {
          visible.push(pin)
        } else if (pin.privacy === "group") {
          const isMember = await GroupService.isMember(
            pin.groupId!.toString(),
            uid
          )
          if (isMember) visible.push(pin)
        }
      }

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

      const uid = (req as any).user.id
      const allowed =
        pin.privacy === "public" ||
        (pin.privacy === "private" &&
          pin.owner.equals(new Types.ObjectId(uid))) ||
        (pin.privacy === "group" &&
          (await GroupService.isMember(pin.groupId!.toString(), uid)))

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
      const pin = await PinService.getById(req.params.id)
      if (!pin) {
        res.status(404).end()
        return
      }

      const uid = (req as any).user.id
      const canUpdate =
        (pin.privacy === "private" &&
          pin.owner.equals(new Types.ObjectId(uid))) ||
        (pin.privacy === "group" &&
          (await GroupService.isMember(pin.groupId!.toString(), uid)))

      if (!canUpdate) {
        res.status(403).json({ message: "Not authorized to update this pin" })
        return
      }

      const updated = await PinService.update(req.params.id, req.body)
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

      const uid = (req as any).user.id
      const canDelete =
        pin.privacy !== "public" && pin.owner.equals(new Types.ObjectId(uid))

      if (!canDelete) {
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
