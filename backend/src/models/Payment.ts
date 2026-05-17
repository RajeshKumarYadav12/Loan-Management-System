import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  loan: Types.ObjectId;
  utr: string;
  amount: number;
  date: Date;
  createdBy: Types.ObjectId;
}

const PaymentSchema: Schema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    utr: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
