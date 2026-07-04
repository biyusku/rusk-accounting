/** Account Mongoose modeli */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IAccount extends Document {
  companyId: string;
  userId: string;
  name: string;
  type: "checking" | "savings" | "credit";
  iban: string;
  balance: number;
  currency: "TRY" | "USD" | "EUR";
  bankName: string;
  cardNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    companyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["checking", "savings", "credit"], required: true },
    iban: { type: String, trim: true },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, enum: ["TRY", "USD", "EUR"], required: true, default: "TRY" },
    bankName: { type: String, required: true, trim: true },
    cardNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

AccountSchema.index({ companyId: 1, createdAt: -1 });

const Account: Model<IAccount> =
  mongoose.models.Account ?? mongoose.model<IAccount>("Account", AccountSchema);

export default Account;