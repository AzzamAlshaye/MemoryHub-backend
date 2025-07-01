import { LikeModel, LikeDocument } from "../models/like.model"

export class LikeService {
    // create with database
  static create(data: Partial<LikeDocument>) {
    return LikeModel.create(data)
  }
// get all likes of post
  static getByTarget(targetType: string, targetId: string) {
    return LikeModel.find({ targetType, targetId }).exec()
  }
// get all likes of post (id)
  static getById(id: string): Promise<LikeDocument | null> {
    return LikeModel.findById(id).exec()
  }
// remove likes(delete)
  static delete(id: string) {
    return LikeModel.findByIdAndDelete(id).exec()
  }
}