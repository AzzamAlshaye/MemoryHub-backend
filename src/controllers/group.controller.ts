import { Request, Response, NextFunction } from "express"
import { GroupService } from "../services/group.service"

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
}