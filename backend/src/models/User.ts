import mongoose, { Schema, Document } from "mongoose";
import { Role } from "../config/roles";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: Role;
  pan?: string;
  dob?: Date;
  salary?: number;
  employmentMode?: string;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(require("../config/roles").ROLES),
      required: true,
    },
    pan: { type: String },
    dob: { type: Date },
    salary: { type: Number },
    employmentMode: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
