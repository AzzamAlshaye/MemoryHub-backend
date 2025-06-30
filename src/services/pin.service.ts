// src/services/pin.service.ts
import { PinModel, PinDocument } from "../models/pin.model"
import { Types } from "mongoose"
import { GroupModel } from "../models/group.model"

export class PinService {
  static create(data: Partial<PinDocument>): Promise<PinDocument> {
    return PinModel.create(data)
  }

  static getById(id: string): Promise<PinDocument | null> {
    return PinModel.findById(id).exec()
  }

  static update(
    id: string,
    update: Partial<PinDocument>
  ): Promise<PinDocument | null> {
    return PinModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  static delete(id: string): Promise<PinDocument | null> {
    return PinModel.findByIdAndDelete(id).exec()
  }

  /**
   * Return only those pins the user is allowed to see:
   *  • public
   *  • private AND owned by them
   *  • group AND in one of their groups
   */
  static async getVisibleForUser(userId: string): Promise<PinDocument[]> {
    // 1) find all groups userId is a member of
    const groups = await GroupModel.find({ members: userId })
      .select("_id")
      .lean()
    const groupIds = groups.map((g) => g._id)

    // 2) one query with $or
    return PinModel.find({
      $or: [
        { privacy: "public" },
        { privacy: "private", owner: new Types.ObjectId(userId) },
        { privacy: "group", groupId: { $in: groupIds } },
      ],
    }).exec()
  }
}
