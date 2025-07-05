// src/controllers/user.controller.ts
import { Request, Response, NextFunction, RequestHandler } from "express"
import { UserService } from "../services/user.service"

interface AuthUser {
  id: string
  role: string
}

/** Assert that req.user exists */
function ensureUser(req: Request): asserts req is Request & { user: AuthUser } {
  if (!req.user) throw new Error("Missing authenticated user")
}

/** Minimal file shape */
interface UploadedFile {
  path?: string
}

export class UserController {
  /** GET /users */
  static getAll: RequestHandler = async (req, res, next) => {
    try {
      const users = await UserService.getAll()
      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  /** GET /users/:id */
  static getById: RequestHandler = async (req, res, next) => {
    try {
      const user = await UserService.getById(req.params.id)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  /** PATCH /users/:id/avatar */
  static uploadAvatar: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      // multer sets req.file
      const file = (req as Request & { file?: UploadedFile }).file
      const url = file?.path ?? ""
      const updated = await UserService.update(req.params.id, { avatar: url })
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** PUT /users/:id */
  static update: RequestHandler = async (req, res, next) => {
    try {
      const updated = await UserService.update(req.params.id, req.body)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** DELETE /users/:id */
  static delete: RequestHandler = async (req, res, next) => {
    try {
      await UserService.delete(req.params.id)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }

  /** GET /users/me */
  static getSelf: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const me = await UserService.getById(req.user.id)
      res.json(me)
    } catch (err) {
      next(err)
    }
  }

  /** PUT /users/me */
  static updateSelf: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      const updated = await UserService.updateSelf(req.user.id, req.body)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** DELETE /users/me */
  static deleteSelf: RequestHandler = async (req, res, next) => {
    try {
      ensureUser(req)
      await UserService.deleteSelf(req.user.id)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }
}
