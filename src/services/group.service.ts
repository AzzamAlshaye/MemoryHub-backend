// src/services/group.service.ts

import crypto from "crypto"
import { GroupModel, GroupDocument } from "../models/group.model"
import { Types } from "mongoose"

export class GroupService {
  /**
   * Create a new group *and* generate an inviteToken immediately
   */
  static async create(
    data: Partial<GroupDocument>,
    creatorId: string
  ): Promise<GroupDocument> {
    const objId = new Types.ObjectId(creatorId)
    const inviteToken = crypto.randomBytes(16).toString("hex")

    return GroupModel.create({
      ...data,
      admins: [objId],
      members: [objId],
      inviteToken,
    })
  }

  /**
   * List all groups a given user belongs to
   */
  static getForUser(userId: string): Promise<GroupDocument[]> {
    return GroupModel.find({ members: userId }).exec()
  }

  /**
   * Get a single group by ID, populating member profiles
   */
  static getById(id: string): Promise<GroupDocument | null> {
    return GroupModel.findById(id)
      .populate({
        path: "members",
        select: "name email avatar joinedAt",
      })
      .populate({
        path: "admins",
        select: "_id",
      })
      .exec()
  }

  /**
   * Update group metadata
   */
  static update(
    id: string,
    update: Partial<GroupDocument>
  ): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndUpdate(id, update, { new: true }).exec()
  }

  /**
   * Delete a group
   */
  static delete(id: string): Promise<GroupDocument | null> {
    return GroupModel.findByIdAndDelete(id).exec()
  }

  /**
   * Generate (or regenerate) the invite token
   */
  static async generateInviteToken(id: string): Promise<GroupDocument | null> {
    const token = crypto.randomBytes(16).toString("hex")
    return GroupModel.findByIdAndUpdate(
      id,
      { inviteToken: token },
      { new: true }
    ).exec()
  }

  /**
   * Add a user to a group if they're not already a member
   */
  static async joinGroup(
    id: string,
    userId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(id)
    if (!group) return null
    if (!group.members.some((m) => m.toString() === userId)) {
      group.members.push(new Types.ObjectId(userId))
      await group.save()
    }
    return group
  }

  /**
   * Remove a member (or yourself) from a group
   */
  static async kickMember(
    groupId: string,
    memberId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(groupId)
    if (!group) return null
    group.members = group.members.filter((m) => m.toString() !== memberId)
    group.admins = group.admins.filter((a) => a.toString() !== memberId)
    await group.save()
    return group
  }

  /**
   * Promote an existing member to admin
   */
  static async promoteMember(
    groupId: string,
    memberId: string
  ): Promise<GroupDocument | null> {
    const group = await GroupModel.findById(groupId)
    if (!group) return null
    if (!group.members.some((m) => m.toString() === memberId)) return null
    if (!group.admins.some((a) => a.toString() === memberId)) {
      group.admins.push(new Types.ObjectId(memberId))
      await group.save()
    }
    return group
  }

  /**
   * Check if a user is an admin
   */
  static async isAdmin(groupId: string, userId: string): Promise<boolean> {
    const group = await GroupModel.findById(groupId)
    return !!group && group.admins.some((a) => a.toString() === userId)
  }

  /**
   * Check if a user is a group member
   */
  static async isMember(groupId: string, userId: string): Promise<boolean> {
    const group = await GroupModel.findById(groupId)
    return !!group && group.members.some((m) => m.toString() === userId)
  }
}
