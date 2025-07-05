// src/controllers/group.controller.ts
import { Request, Response, NextFunction } from "express"
import { GroupService } from "../services/group.service"
import cloudinary from "../config/cloudinary"
import streamifier from "streamifier"

async function uploadGroupAvatar(buffer: Buffer) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "group-avatars", resource_type: "image" },
      (err, val) => (err ? reject(err) : resolve(val))
    )
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export class GroupController {
  // POST /groups
  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const creatorId = (req as any).user.id
      const group = await GroupService.create(req.body, creatorId)
      res.status(201).json(group)
    } catch (err) {
      next(err)
    }
  }

  // GET /groups
  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user.id
      const groups = await GroupService.getForUser(userId)
      res.json(groups)
    } catch (err) {
      next(err)
    }
  }

  // GET /groups/:id
  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const group = await GroupService.getById(req.params.id)
      if (!group) {
        res.sendStatus(404)
        return
      }
      res.json(group)
    } catch (err) {
      next(err)
    }
  }

  // PUT /groups/:id
  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await GroupService.update(req.params.id, req.body)
      if (!updated) {
        res.sendStatus(404)
        return
      }
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  // DELETE /groups/:id
  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await GroupService.delete(req.params.id)
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }

  // PATCH /groups/:id/avatar
  static async uploadAvatar(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const file = (req as any).file as Express.Multer.File | undefined
      if (!file) {
        res.status(400).json({ error: "No file uploaded" })
        return
      }
      const result = await uploadGroupAvatar(file.buffer)
      const updated = await GroupService.update(req.params.id, {
        avatar: result.secure_url,
      })
      if (!updated) {
        res.sendStatus(404)
        return
      }
      res.json({ url: result.secure_url, public_id: result.public_id })
    } catch (err) {
      next(err)
    }
  }

  // POST /groups/:id/invite
  static async invite(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await GroupService.generateInviteToken(req.params.id)
      if (!updated) {
        res.sendStatus(404)
        return
      }
      res.json({ inviteToken: updated.inviteToken })
    } catch (err) {
      next(err)
    }
  }

  // POST /groups/:id/join?token=…
  static async join(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.query.token as string
      const group = await GroupService.getById(req.params.id)
      if (!group || group.inviteToken !== token) {
        res.status(403).json({ error: "Invalid invite token" })
        return
      }
      const joined = await GroupService.joinGroup(
        req.params.id,
        (req as any).user.id
      )
      res.json(joined)
    } catch (err) {
      next(err)
    }
  }

  // POST /groups/:id/kick/:memberId
  static async kickMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const kicked = await GroupService.kickMember(
        req.params.id,
        req.params.memberId
      )
      if (!kicked) {
        res.sendStatus(404)
        return
      }
      res.json(kicked)
    } catch (err) {
      next(err)
    }
  }

  // POST /groups/:id/promote/:memberId
  static async promoteMember(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const promoted = await GroupService.promoteMember(
        req.params.id,
        req.params.memberId
      )
      if (!promoted) {
        res.sendStatus(404)
        return
      }
      res.json(promoted)
    } catch (err) {
      next(err)
    }
  }
}
