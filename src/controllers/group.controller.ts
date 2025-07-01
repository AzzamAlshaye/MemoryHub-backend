import { Request, Response, NextFunction } from "express"
import { GroupService } from "../services/group.service"
import { AppError } from "../utils/error"
import {
  CREATED,
  NO_CONTENT,
  NOT_FOUND,
  BAD_REQUEST,
  UNAUTHORIZED,
} from "../utils/http-status"
import { GroupModel } from "../models/group.model"

type AuthRequest = Request & { user?: { id: string } }

export class GroupController {
  // create group by admin group
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
      const grp = await GroupService.create(req.body, req.user.id)
      res.status(CREATED).json(grp)
    } catch (err) {
      next(err)
    }
  }
// show all group
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.getAll()
      res.json(groups)
    } catch (err) {
      next(err)
    }
  }
// get group by Id
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const grp = await GroupService.getById(req.params.id)
      if (!grp) throw new AppError("Group not found", NOT_FOUND)
      res.json(grp)
    } catch (err) {
      next(err)
    }
  }
// update group
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
      const isAdmin = await GroupService.isAdmin(id, req.user.id)
      if (!isAdmin)
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      const updated = await GroupService.update(id, req.body)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
  static async kickMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params
      if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
      const isAdmin = await GroupService.isAdmin(id, req.user.id)
      if (!isAdmin)
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      const updated = await GroupService.kickMember(id, memberId)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
// delete group 
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
      const isAdmin = await GroupService.isAdmin(id, req.user.id)
      if (!isAdmin)
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      const deleted = await GroupService.delete(id)
      if (!deleted) throw new AppError("Group not found", NOT_FOUND)
      res.status(NO_CONTENT).end()
    } catch (err) {
      next(err)
    }
  }
// invite to group
  static async invite(req: Request, res: Response, next: NextFunction) {
    try {
      const group = await GroupService.generateInviteToken(req.params.id)
      if (!group) throw new AppError("Group not found", NOT_FOUND)
      const inviteLink = `${req.protocol}://${req.get("host")}/groups/${group.id}/join?token=${group.inviteToken}`
      res.json({ inviteLink })
    } catch (err) {
      next(err)
    }
  }
// join to group
  static async join(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = String(req.query.token || "")
      const group = await GroupModel.findOne({
        _id: req.params.id,
        inviteToken: token,
      })
      if (!group) throw new AppError("Invalid or expired invite", BAD_REQUEST)
      if (!req.user)
        throw new AppError("Please log in to join groups", UNAUTHORIZED)
      const updatedGroup = await GroupService.joinGroup(group.id, req.user.id)
      res.json(updatedGroup)
    } catch (err) {
      next(err)
    }
  }
}