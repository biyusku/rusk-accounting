/** BankConnection — banka API credentials ve sync durumu */
import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IBankConnection extends Document {
  companyId: string;
  userId: string;
  bankId: string;          // "isbank" | "akbank" | "garanti" | "ykb" vb.
  bankName: string;
  status: "connected" | "disconnected" | "error";
  // Şifreli credentials (production'da KMS/Vault ile şifrelenmeli)
  credentials: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
  };
  enabledApis: string[];   // ["accounts", "transactions", "fx"]
  lastSyncAt: Date | null;
  lastSyncStatus: "success" | "failed" | "never";
  lastSyncError: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const BankConnectionSchema = new Schema<IBankConnection>(
  {
    companyId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    bankId: { type: String, required: true },
    bankName: { type: String, required: true },
    status: { type: String, enum: ["connected", "disconnected", "error"], default: "disconnected" },
    credentials: {
      apiKey: { type: String },
      clientId: { type: String },
      clientSecret: { type: String },
      accessToken: { type: String },
      refreshToken: { type: String },
      tokenExpiresAt: { type: Date },
    },
    enabledApis: { type: [String], default: [] },
    lastSyncAt: { type: Date, default: null },
    lastSyncStatus: { type: String, enum: ["success", "failed", "never"], default: "never" },
    lastSyncError: { type: String, default: null },
  },
  { timestamps: true }
);

BankConnectionSchema.index({ companyId: 1, bankId: 1 }, { unique: true });

const BankConnection: Model<IBankConnection> =
  mongoose.models.BankConnection ??
  mongoose.model<IBankConnection>("BankConnection", BankConnectionSchema);

export default BankConnection;