import { Request, Response, NextFunction } from "express";
let groups: any[] = [];
let currentId = 1;

export class GroupController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const newGroup = { id: currentId++, ...req.body };
      groups.push(newGroup);
      res.status(201).json(newGroup);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(groups);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const group = groups.find(g => g.id === id);
      if (!group) return res.status(404).json({ message: "Group not found" });
      res.json(group);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const index = groups.findIndex(g => g.id === id);
      if (index === -1) return res.status(404).json({ message: "Group not found" });

      groups[index] = { ...groups[index], ...req.body };
      res.json(groups[index]);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const index = groups.findIndex(g => g.id === id);
      if (index === -1) return res.status(404).json({ message: "Group not found" });

      groups.splice(index, 1);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}
