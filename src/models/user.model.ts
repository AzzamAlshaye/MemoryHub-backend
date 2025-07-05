// src/models/user.model.ts
import { Schema, model, Document, Types } from "mongoose"
import bcrypt from "bcryptjs"

export type UserRole = "user" | "admin"

// Augment Document so that _id is a Types.ObjectId
export interface UserDocument extends Document {
  _id: Types.ObjectId
  email: string
  password: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date

  comparePassword(candidate: string): Promise<boolean>
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    name: { type: String, required: true, trim: true },
    avatar: {
      type: String,
      trim: true,
      default:
        "https://res.cloudinary.com/dkh3l9gqe/image/upload/v1751740677/assets_task_01jzdxtsshejgbb0wnamfbxxxf_1751740425_img_0_moizxd.webp",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.password
      },
    },
  }
)

// Virtual `id` (string) for JSON responses
userSchema.virtual("id").get(function (this: UserDocument) {
  return this._id.toHexString()
})

// Hash password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare candidate password
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

export const UserModel = model<UserDocument>("User", userSchema)
