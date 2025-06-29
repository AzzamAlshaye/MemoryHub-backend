// src/services/comment.service.ts
import { CommentModel, CommentDocument } from "../models/comment.model"

export class CommentService {
  static create(data: Partial<CommentDocument>) {
    return CommentModel.create(data)
  }

  static getByPin(pinId: string) {
    return CommentModel.find({ pin: pinId }).exec()
  }

  static getById(id: string): Promise<CommentDocument | null> {
    return CommentModel.findById(id).exec()
  }

  static update(id: string, content: string) {
    return CommentModel.findByIdAndUpdate(id, { content }, { new: true }).exec()
  }

  static delete(id: string) {
    return CommentModel.findByIdAndDelete(id).exec()
  }
}
