import { Request, Response, NextFunction } from "express"
import { GroupService } from "../services/group.service"
import { GroupModel } from "../models/group.model"

// type to allow req.user access
interface AuthenticatedRequest extends Request {
  user?: { id: string }
}

export class GroupController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const grp = await GroupService.create(req.body)
      res.status(201).json(grp)
    } catch (err) {
      next(err)
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.getAll()
      res.json(groups)
    } catch (err) {
      next(err)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const grp = await GroupService.getById(req.params.id)
      res.json(grp)
    } catch (err) {
      next(err)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await GroupService.update(req.params.id, req.body)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await GroupService.delete(req.params.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }

  static async invite(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.generateInviteToken(req.params.id)
      if (!group) return res.status(404).json({ message: "Group not found" })

      const inviteLink = `${req.protocol}://${req.get("host")}/groups/${group.id}/join?token=${group.inviteToken}`
      res.status(200).json({ inviteLink })
    } catch (err) {
      next(err)
    }
  }

  static async join(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.query
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invite token required" })
      }

      const group = await GroupModel.findOne({ _id: req.params.id, inviteToken: token })
      if (!group) return res.status(400).json({ message: "Invalid or expired invite" })

      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized: user not found in request" })
      }

      const updatedGroup = await GroupService.joinGroup(group.id, req.user.id)
      res.status(200).json(updatedGroup)
    } catch (err) {
      next(err)
    }
  }
}
