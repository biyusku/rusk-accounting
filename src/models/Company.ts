/** Company (Şirket) Mongoose modeli */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ICompany extends Document {
  name: string;
  slug: string;
  adminUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    adminUserId: { type: String, required: true },
  },
  { timestamps: true }
);

const Company: Model<ICompany> =
  mongoose.models.Company ?? mongoose.model<ICompany>("Company", CompanySchema);

export default Company;