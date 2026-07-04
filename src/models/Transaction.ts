/** Transaction Mongoose modeli */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ITransaction extends Document {
  companyId: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
  status: "completed" | "pending" | "failed";
  accountId: string;
  counterparty: string;
  transactionType: "havale" | "eft" | "fast" | "pos" | "atm" | "other";
  meta?: {
    externalId?: string;
    bankId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    companyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ["completed", "pending", "failed"], required: true, default: "completed" },
    accountId: { type: String, required: true },
    counterparty: { type: String, required: true, trim: true },
    transactionType: {
      type: String,
      enum: ["havale", "eft", "fast", "pos", "atm", "other"],
      required: true,
    },
    meta: {
      externalId: { type: String, index: true, sparse: true },
      bankId: { type: String },
    },
  },
  { timestamps: true }
);

TransactionSchema.index({ companyId: 1, date: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ?? mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;