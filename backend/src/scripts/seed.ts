import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { ROLES } from "../config/roles";

dotenv.config();

const users = [
  {
    email: "admin@test.com",
    password: "Password@123",
    name: "Admin",
    role: ROLES.ADMIN,
  },
  {
    email: "sales@test.com",
    password: "Password@123",
    name: "Sales",
    role: ROLES.SALES,
  },
  {
    email: "sanction@test.com",
    password: "Password@123",
    name: "Sanction",
    role: ROLES.SANCTION,
  },
  {
    email: "disbursement@test.com",
    password: "Password@123",
    name: "Disbursement",
    role: ROLES.DISBURSEMENT,
  },
  {
    email: "collection@test.com",
    password: "Password@123",
    name: "Collection",
    role: ROLES.COLLECTION,
  },
  {
    email: "borrower@test.com",
    password: "Password@123",
    name: "Borrower",
    role: ROLES.BORROWER,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  await User.deleteMany({});
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
  }
  console.log("Seeded users");
  process.exit();
}

seed();
