import mongoose, { Schema, Document, Types } from "mongoose";

export type LoanStatus =
  | "APPLIED"
  | "SANCTIONED"
  | "REJECTED"
  | "DISBURSED"
  | "CLOSED";

export interface ILoan extends Document {
  borrower: Types.ObjectId;
  amount: number;
  tenure: number;
  interest: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionBy?: Types.ObjectId;
  disburseBy?: Types.ObjectId;
  closeDate?: Date;
}

const LoanSchema: Schema = new Schema(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ["APPLIED", "SANCTIONED", "REJECTED", "DISBURSED", "CLOSED"],
      default: "APPLIED",
    },
    sanctionBy: { type: Schema.Types.ObjectId, ref: "User" },
    disburseBy: { type: Schema.Types.ObjectId, ref: "User" },
    closeDate: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<ILoan>("Loan", LoanSchema);
