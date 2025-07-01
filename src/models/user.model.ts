import { Schema, model, Document, Types } from "mongoose"
import bcrypt from "bcryptjs"

export type UserRole = "user" | "admin"

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
    avatar: { type: String, trim: true },
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
userSchema.virtual("id").get(function (this: UserDocument) {
  return this._id.toHexString()
})
// hash pass
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
// compare pass
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}

export const UserModel = model<UserDocument>("User", userSchema)