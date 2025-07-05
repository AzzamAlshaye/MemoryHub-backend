// src/controllers/group.controller.ts
import { Request, Response, NextFunction, RequestHandler } from "express"
import { Types } from "mongoose"
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

interface AuthUser {
  id: string
  role: string
}

/** Ensure authenticated user is present */
function ensureUser(req: Request): asserts req is Request & { user: AuthUser } {
  if (!req.user) throw new AppError("Authentication required", UNAUTHORIZED)
}

export class GroupController {
  /** POST /groups */
  static create: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const grp = await GroupService.create(req.body, req.user.id)
      res.status(CREATED).json(grp)
    } catch (err) {
      next(err)
    }
  }

  /** GET /groups */
  static getAll: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const groups = await GroupService.getForUser(req.user.id)
      res.json(groups)
    } catch (err) {
      next(err)
    }
  }

  /** GET /groups/:id */
  static getById: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const grp = await GroupService.getById(req.params.id)
      if (!grp) throw new AppError("Group not found", NOT_FOUND)
      if (!(await GroupService.isMember(grp.id, req.user.id))) {
        throw new AppError("Not authorized", UNAUTHORIZED)
      }
      res.json(grp)
    } catch (err) {
      next(err)
    }
  }

  /** PATCH /groups/:id/avatar */
  static uploadAvatar: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const file = (req as Request & { file?: { path?: string } }).file
      const url = file?.path ?? ""
      const updated = await GroupService.update(req.params.id, { avatar: url })
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** PUT /groups/:id */
  static update: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const updated = await GroupService.update(req.params.id, req.body)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** DELETE /groups/:id */
  static delete: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const deleted = await GroupService.delete(req.params.id)
      if (!deleted) throw new AppError("Group not found", NOT_FOUND)
      res.sendStatus(NO_CONTENT)
    } catch (err) {
      next(err)
    }
  }

  /** POST /groups/:id/invite */
  static invite: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      // only members can invite
      if (!(await GroupService.isMember(req.params.id, req.user.id))) {
        throw new AppError("Only group members can invite", UNAUTHORIZED)
      }
      const group = await GroupService.generateInviteToken(req.params.id)
      if (!group) throw new AppError("Group not found", NOT_FOUND)

      const inviteLink = `${req.protocol}://${req.get("host")}/groups/${
        group.id
      }/join?token=${group.inviteToken}`

      res.json({ inviteLink })
    } catch (err) {
      next(err)
    }
  }

  /** POST /groups/:id/join */
  static join: RequestHandler = async (req, res, next) => {
    try {
      const { id } = req.params
      const token = String(req.query.token || "")

      const group = await GroupModel.findOne({ _id: id, inviteToken: token })
      if (!group) {
        throw new AppError("Invalid or expired invite token", BAD_REQUEST)
      }

      ensureUser(req)
      const updated = await GroupService.joinGroup(id, req.user.id)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** POST /groups/:id/kick/:memberId */
  static kickMember: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const { id, memberId } = req.params
      if (!(await GroupService.isAdmin(id, req.user.id))) {
        throw new AppError("Admin privileges required", UNAUTHORIZED)
      }
      const updated = await GroupService.kickMember(id, memberId)
      if (!updated) throw new AppError("Group not found", NOT_FOUND)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** POST /groups/:id/promote/:memberId */
  static promoteMember: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const { id, memberId } = req.params
      if (!(await GroupService.isAdmin(id, req.user.id))) {
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
