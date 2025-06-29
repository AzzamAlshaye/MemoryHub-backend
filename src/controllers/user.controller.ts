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

  /** DELETE /users/me – let the logged-in user delete their own account */
  static async deleteSelf(
    req: Request & { user: { id: string } },
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user.id
      await UserService.deleteSelf(userId)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
