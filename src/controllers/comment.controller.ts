// src/controllers/comment.controller.ts
import { RequestHandler } from "express"
import { Types } from "mongoose"
import { CommentService } from "../services/comment.service"
import { PinService } from "../services/pin.service"

export class CommentController {
  /**
   * POST /comments
   */
  static create: RequestHandler = async (req, res, next) => {
    try {
      const { pin: pinId, content } = req.body

      if (!Types.ObjectId.isValid(pinId)) {
        res.status(400).json({ message: "Invalid pin ID" })
        return
      }

      const pin = await PinService.getById(pinId)
      if (!pin) {
        res.status(404).json({ message: "Pin not found" })
        return
      }
      if (pin.privacy === "private") {
        res.status(403).json({ message: "Cannot comment on private pin" })
        return
      }

      // if you haven't globally augmented Express.Request, cast here:
      const authorId = (req as any).user.id
      const authorObjectId = new Types.ObjectId(authorId)
      const pinObjectId = new Types.ObjectId(pinId)

      const cmt = await CommentService.create({
        author: authorObjectId,
        pin: pinObjectId,
        content,
      })

      res.status(201).json(cmt)
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /comments/pin/:pinId
   */
  static listByPin: RequestHandler = async (req, res, next) => {
    try {
      const pinId = req.params.pinId
      if (!Types.ObjectId.isValid(pinId)) {
        res.status(400).json({ message: "Invalid pin ID" })
        return
      }

      const comments = await CommentService.getByPin(pinId)
      res.json(comments)
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /comments/:id
   */
  static update: RequestHandler = async (req, res, next) => {
    try {
      const id = req.params.id
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid comment ID" })
        return
      }

      const cmt = await CommentService.getById(id)
      if (!cmt) {
        res.status(404).end()
        return
      }

      const authorObjectId = new Types.ObjectId((req as any).user.id)
      if (!cmt.author.equals(authorObjectId)) {
        res.status(403).json({ message: "Not your comment" })
        return
      }

      const updated = await CommentService.update(id, req.body.content)
      res.json(updated)
    } catch (err) {
      next(err)
    }
  }

  /**
   * DELETE /comments/:id
   */
  static delete: RequestHandler = async (req, res, next) => {
    try {
      const id = req.params.id
      if (!Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid comment ID" })
        return
      }

      const cmt = await CommentService.getById(id)
      if (!cmt) {
        res.status(404).end()
        return
      }

      const authorObjectId = new Types.ObjectId((req as any).user.id)
      if (!cmt.author.equals(authorObjectId)) {
        res.status(403).json({ message: "Not your comment" })
        return
      }

      await CommentService.delete(id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}
