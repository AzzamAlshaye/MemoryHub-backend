// src/services/pin.service.ts
import { PinModel, PinDocument } from "../models/pin.model"
import { Types } from "mongoose"
import { GroupModel } from "../models/group.model"

export class PinService {
  static async create(data: Partial<PinDocument>): Promise<PinDocument> {
    const pin = await PinModel.create(data)
    const populated = await PinModel.findById(pin._id)
      .populate("owner", "name avatar")
      .populate("groupId", "name avatar")
      .exec()
    if (!populated) throw new Error("Failed to create pin")
    return populated
  }

  static async getById(id: string): Promise<PinDocument | null> {
    return PinModel.findById(id)
      .populate("owner", "name avatar")
      .populate("groupId", "name avatar")
      .exec()
  }

  static async update(
    id: string,
    update: Partial<PinDocument>
  ): Promise<PinDocument | null> {
    // 1) If we're adding images, merge with existing (cap at 10)
    if (update.media?.images) {
      const existing = await PinModel.findById(id).lean()
      const merged = [
        ...(existing?.media.images ?? []),
        ...update.media.images,
      ].slice(0, 10)
      update.media.images = merged
    }

    // 2) Perform update
    await PinModel.findByIdAndUpdate(id, update, { new: true }).exec()

    // 3) Re-fetch populated
    return PinModel.findById(id)
      .populate("owner", "name avatar")
      .populate("groupId", "name avatar")
      .exec()
  }

  static async delete(id: string): Promise<PinDocument | null> {
    return PinModel.findByIdAndDelete(id).exec()
  }

  static async getVisibleForUser(userId: string): Promise<PinDocument[]> {
    const groups = await GroupModel.find({ members: userId })
      .select("_id")
      .lean()
    const groupIds = groups.map((g) => g._id)

    return PinModel.find({
      $or: [
        { privacy: "public" },
        { privacy: "private", owner: new Types.ObjectId(userId) },
        { privacy: "group", groupId: { $in: groupIds } },
      ],
    })
      .populate("owner", "name avatar")
      .populate("groupId", "name avatar")
      .sort({ createdAt: -1 })
      .exec()
  }

  static async getPinsByUser(userId: string): Promise<PinDocument[]> {
    return PinModel.find({ owner: new Types.ObjectId(userId) })
      .populate("owner", "name avatar")
      .populate("groupId", "name avatar")
      .sort({ createdAt: -1 })
      .exec()
  }
}
