import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDocument extends Document {
  loan: Types.ObjectId;
  borrower: Types.ObjectId;
  fileUrl: string;
  fileType: string;
  extractedText?: string;
  extractedSalary?: number;
}

const DocumentSchema: Schema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", default: null },
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, required: true },
    extractedText: { type: String, default: null },
    extractedSalary: { type: Number, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<IDocument>("Document", DocumentSchema);
