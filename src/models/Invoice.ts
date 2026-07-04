/** Invoice Mongoose modeli */
import mongoose, { Schema, type Document, type Model } from "mongoose";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  companyId: string;
  userId: string;
  invoiceNumber: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "draft";
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceItemSchema = new Schema<InvoiceItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const InvoiceSchema = new Schema<IInvoice>(
  {
    companyId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    invoiceNumber: { type: String, required: true, trim: true },
    clientName: { type: String, required: true, trim: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["paid", "pending", "overdue", "draft"], required: true, default: "draft" },
    items: { type: [InvoiceItemSchema], default: [] },
  },
  { timestamps: true }
);

InvoiceSchema.index({ companyId: 1, issueDate: -1 });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice ?? mongoose.model<IInvoice>("Invoice", InvoiceSchema);

export default Invoice;