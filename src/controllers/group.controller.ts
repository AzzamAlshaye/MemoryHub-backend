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

export class GroupController {
// create group
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
      const grp = await GroupService.create(req.body, req.user.id)
      res.status(CREATED).json(grp)
    } catch (err) {
      next(err)
    }
  }
// show groups(get)
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const groups = await GroupService.getForUser(req.user!.id)
      res.json(groups)
    } catch (err) {
      next(err)
    }
  }
// access to group by id (get)
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const grp = await GroupService.getById(req.params.id)
      if (!grp) throw new AppError("Group not found", NOT_FOUND)
      if (!(await GroupService.isMember(grp.id, req.user!.id))) {
        throw new AppError("Not authorized", UNAUTHORIZED)
      }
      res.json(grp)
    } catch (err) {
      next(err)
    }
  }
// update group info
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!(await GroupService.isMember(id, req.user!.id))) {
        throw new AppError("Only group members can update", UNAUTHORIZED)
      }
      const updated = await GroupService.update(id, req.body)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
// delete group by id
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      if (!(await GroupService.isAdmin(id, req.user!.id))) {
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      }
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
      const { id } = req.params
      if (!(await GroupService.isMember(id, req.user!.id))) {
        throw new AppError("Only group members can invite", UNAUTHORIZED)
      }
      const group = await GroupService.generateInviteToken(id)
      if (!group) throw new AppError("Group not found", NOT_FOUND)
      const inviteLink = `${req.protocol}://${req.get("host")}/groups/${group.id}/join?token=${group.inviteToken}`
      res.json({ inviteLink })
    } catch (err) {
      next(err)
    }
  }
// join into group
  static async join(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const token = String(req.query.token || "")
// check of token 
      const group = await GroupModel.findOne({ _id: id, inviteToken: token })
      if (!group) {
        throw new AppError("Invalid or expired invite token", BAD_REQUEST)
      }
      if (!req.user) {
        throw new AppError("Authentication required", UNAUTHORIZED)
      }
      const updated = await GroupService.joinGroup(id, req.user.id)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
  static async kickMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params
      if (!(await GroupService.isAdmin(id, req.user!.id))) {
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      }
      const updated = await GroupService.kickMember(id, memberId)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
// create group
  static async promoteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, memberId } = req.params
      if (!(await GroupService.isAdmin(id, req.user!.id))) {
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      }
      const updated = await GroupService.promoteMember(id, memberId)
      if (!updated) {
        throw new AppError(
          "Group not found or user is not a member",
          BAD_REQUEST
        )
      }
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }
}