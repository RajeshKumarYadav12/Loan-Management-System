import { Request, Response } from "express";
import User from "../models/User";
import Loan from "../models/Loan";

// Sales: leads (registered, not applied)
export const getLeads = async (req: Request, res: Response) => {
  // Users who are borrowers and have not applied for any loan
  const borrowers = await User.find({ role: "borrower" });
  const leads = [];
  for (const user of borrowers) {
    const loan = await Loan.findOne({ borrower: user._id });
    if (!loan) leads.push(user);
  }
  res.json(leads);
};

// Sanction: applied loans
export const getAppliedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "APPLIED" }).populate("borrower");
  res.json(loans);
};

// Disbursement: sanctioned loans
export const getSanctionedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "SANCTIONED" }).populate("borrower");
  res.json(loans);
};

// Collection: disbursed loans
export const getDisbursedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "DISBURSED" }).populate("borrower");
  res.json(loans);
};
