// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express"
import { UserService } from "../services/user.service"

export class UserController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAll()
      res.json(users)
    } catch (err) {
      next(err)
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getById(req.params.id)
      res.json(user)
    } catch (err) {
      next(err)
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await UserService.update(req.params.id, req.body)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.delete(req.params.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }

  /** GET /users/me – let the logged-in user fetch their own profile */
  static async getSelf(
    req: Request & { user: { id: string } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const me = await UserService.getById(req.user.id)
      res.json(me)
    } catch (err) {
      next(err)
    }
  }

  /** PUT /users/me – let the logged-in user update their own profile */
  static async updateSelf(
    req: Request & { user: { id: string } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const updated = await UserService.updateSelf(req.user.id, req.body)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /** DELETE /users/me – let the logged-in user delete their own account */
  static async deleteSelf(
    req: Request & { user: { id: string } },
    res: Response,
    next: NextFunction
  ) {
    try {
      await UserService.deleteSelf(req.user.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
