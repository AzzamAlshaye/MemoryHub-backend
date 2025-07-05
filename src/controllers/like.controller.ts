// src/controllers/like.controller.ts
import { RequestHandler } from "express"
import { Types } from "mongoose"
import { LikeModel } from "../models/like.model"
import { PinService } from "../services/pin.service"
import { CommentService } from "../services/comment.service"

export class LikeController {
  // POST /likes
  static create: RequestHandler = async (req, res, next) => {
    try {
      const userId = new Types.ObjectId((req as any).user.id)
      const { targetType, targetId, type } = req.body

      if (!["like", "dislike"].includes(type)) {
        res.status(400).json({ message: "Invalid reaction type" })
        return
      }

      // Validate target exists & privacy
      if (targetType === "pin") {
        const pin = await PinService.getById(targetId)
        if (!pin) {
          res.status(404).json({ message: "Pin not found" })
          return
        }
        if (pin.privacy === "private") {
          res.status(403).json({ message: "Cannot react on private pin" })
          return
        }
      } else {
        const comment = await CommentService.getById(targetId)
        if (!comment) {
          res.status(404).json({ message: "Comment not found" })
          return
        }
        const pin = await PinService.getById(comment.pin.toString())
        if (pin?.privacy === "private") {
          res
            .status(403)
            .json({ message: "Cannot react on private-pin comment" })
          return
        }
      }

      // Try to find existing reaction
      let reaction = await LikeModel.findOne({
        user: userId,
        targetType,
        targetId,
      })

      if (reaction) {
        if (reaction.type === type) {
          // same reaction: no-op
          res.status(200).json(reaction)
          return
        }
        // switch reaction
        reaction.type = type
        await reaction.save()
        res.status(200).json(reaction)
        return
      }

      // no existing reaction: create new
      reaction = await LikeModel.create({
        user: userId,
        targetType,
        targetId,
        type,
      })
      res.status(201).json(reaction)
    } catch (err: any) {
      // if duplicate-key error somehow sneaks through
      if (err.code === 11000) {
        res.status(409).json({ message: "Already reacted" })
      } else {
        next(err)
      }
    }
  }

  // GET /likes/:targetType/:targetId
  static list: RequestHandler = async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params
      const all = await LikeModel.find({ targetType, targetId })
      const likes = all.filter((r) => r.type === "like").length
      const dislikes = all.filter((r) => r.type === "dislike").length
      res.json({ likes, dislikes })
    } catch (err) {
      next(err)
    }
  }

  // DELETE /likes/:id
  static delete: RequestHandler = async (req, res, next) => {
    try {
      const reaction = await LikeModel.findById(req.params.id)
      if (!reaction) {
        res.status(404).end()
        return
      }
      const userId = new Types.ObjectId((req as any).user.id)
      if (!reaction.user.equals(userId)) {
        res
          .status(403)
          .json({ message: "Cannot remove someone else's reaction" })
        return
      }
      await reaction.deleteOne()
      res.sendStatus(204)
    } catch (err) {
      next(err)
    }
  }
}
