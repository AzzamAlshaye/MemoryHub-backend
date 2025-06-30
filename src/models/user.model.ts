import { Schema, model, Document } from "mongoose"
import bcrypt from "bcryptjs"

export type UserRole = "user" | "admin"
// create interface
export interface UserDocument extends Document {
  id: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}
// create schems
const userSchema = new Schema<UserDocument>(
{
    id: { 
    type: String,
    default: () => `user_${Date.now()}` 
},
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})
// compare password
userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password)
}
// create model
export const UserModel = model<UserDocument>("User", userSchema)