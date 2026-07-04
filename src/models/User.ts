/** User Mongoose modeli — rol + şirket tabanlı */
import mongoose, { Schema, type Document, type Model } from "mongoose";
import type { UserRole } from "@/lib/auth/roles";

export type { UserRole };

export interface IUser extends Document {
  companyId: string;      // Hangi şirkete ait
  email: string;
  passwordHash: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  invitedBy: string | null; // Kimi davet etti
  tokenVersion: number;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    companyId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: null },
    role: { type: String, enum: ["admin", "manager", "accountant", "viewer"], default: "viewer" },
    isActive: { type: Boolean, default: true },
    invitedBy: { type: String, default: null },
    tokenVersion: { type: Number, default: 0 },
    avatarUrl: { type: String, default: null },
  },
  { timestamps: true }
);

UserSchema.index({ companyId: 1, email: 1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;