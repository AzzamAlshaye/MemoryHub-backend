import { RequestHandler } from "express"
import { Types } from "mongoose"
import { LikeService } from "../services/like.service"
import { PinService } from "../services/pin.service"
import { CommentService } from "../services/comment.service"

export class LikeController {
// create like(post)
  static create: RequestHandler = async (req, res, next) => {
    try {
      const { targetType, targetId, type } = req.body
// validate the pin
      if (targetType === "pin") {
        const pin = await PinService.getById(targetId)
        if (!pin) {
          res.status(404).json({ message: "Pin not found" })
          return
        }
        if (pin.privacy === "private") {
          res.status(403).json({ message: "Cannot like private pin" })
          return
        }
      } else {
        const cmt = await CommentService.getById(targetId)
        if (!cmt) {
          res.status(404).json({ message: "Comment not found" })
          return
        }
        const pin = await PinService.getById(cmt.pin.toString())
        if (pin!.privacy === "private") {
          res
            .status(403)
            .json({ message: "Cannot like comments on private pin" })
          return
        }
      }
      const like = await LikeService.create({
        user: new Types.ObjectId((req as any).user.id),
        targetType,
        targetId,
        type,
      })

      res.status(201).json(like)
    } catch (err) {
      next(err)
    }
  }
// show like (get)
  static list: RequestHandler = async (req, res, next) => {
    try {
      const { targetType, targetId } = req.params
      const likes = await LikeService.getByTarget(targetType, targetId)
      res.json(likes)
    } catch (err) {
      next(err)
    }
  }
// delete like
  static delete: RequestHandler = async (req, res, next) => {
    try {
      const like = await LikeService.getById(req.params.id)
      if (!like) {
        res.status(404).end()
        return
      }
      if (!like.user.equals(new Types.ObjectId((req as any).user.id))) {
        res.status(403).json({ message: "Not your like" })
        return
      }
      await LikeService.delete(req.params.id)
      res.status(204).end()
    } catch (err) {
      next(err)
    }
  }
}