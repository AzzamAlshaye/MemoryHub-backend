// src/controllers/pin.controller.ts
import { Request, Response, NextFunction } from "express"
import { PinService } from "../services/pin.service"
import { GroupService } from "../services/group.service"

export class PinController {
  // CREATE always allowed, but enforce groupId when privacy==="group"
  static async create(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const data = { ...req.body, owner: req.user.id }
      const pin = await PinService.create(data)
      res.status(201).json(pin)
    } catch (err) {
      next(err)
    }
  }

  // GET ALL → only public, your own private, and group-members’ group pins
  static async getAll(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const all = await PinService.getAll()
      const visible = []
      for (const pin of all) {
        if (pin.privacy === "public") {
          visible.push(pin)
        } else if (pin.privacy === "private" && pin.owner.equals(req.user.id)) {
          visible.push(pin)
        } else if (pin.privacy === "group") {
          const isMember = await GroupService.isMember(
            pin.groupId!.toString(),
            req.user.id
          )
          if (isMember) visible.push(pin)
        }
      }
      res.json(visible)
    } catch (err) {
      next(err)
    }
  }

  // GET ONE → same filtering as above
  static async getById(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) return res.status(404).end()

      const uid = req.user.id
      if (
        pin.privacy === "public" ||
        (pin.privacy === "private" && pin.owner.equals(uid)) ||
        (pin.privacy === "group" &&
          (await GroupService.isMember(pin.groupId!.toString(), uid)))
      ) {
        return res.json(pin)
      }

      res.status(403).json({ message: "Not authorized to view this pin" })
    } catch (err) {
      next(err)
    }
  }

  // UPDATE → only owner (private), or any group member (group), never public
  static async update(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) return res.status(404).end()

      const uid = req.user.id
      if (
        (pin.privacy === "private" && pin.owner.equals(uid)) ||
        (pin.privacy === "group" &&
          (await GroupService.isMember(pin.groupId!.toString(), uid)))
      ) {
        const updated = await PinService.update(req.params.id, req.body)
        return res.json(updated)
      }
      return res
        .status(403)
        .json({ message: "Not authorized to update this pin" })
    } catch (err) {
      next(err)
    }
  }

  // DELETE → only owner for private or group; never public
  static async delete(
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) {
    try {
      const pin = await PinService.getById(req.params.id)
      if (!pin) return res.status(404).end()

      const uid = req.user.id
      if (pin.privacy !== "public" && pin.owner.equals(uid)) {
        await PinService.delete(req.params.id)
        return res.status(204).end()
      }
      return res
        .status(403)
        .json({ message: "Not authorized to delete this pin" })
    } catch (err) {
      next(err)
    }
  }
}
