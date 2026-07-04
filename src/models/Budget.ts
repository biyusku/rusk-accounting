/** Budget Mongoose modeli */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBudget extends Document {
  companyId: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  period: "monthly" | "yearly";
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    companyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true, trim: true },
    limit: { type: Number, required: true },
    spent: { type: Number, required: true, default: 0 },
    period: { type: String, enum: ["monthly", "yearly"], required: true, default: "monthly" },
    color: { type: String, required: true },
    icon: { type: String, required: true },
  },
  { timestamps: true }
);

BudgetSchema.index({ companyId: 1, category: 1 });

const Budget: Model<IBudget> =
  mongoose.models.Budget ?? mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;