import { Request, Response } from "express";
import Loan from "../models/Loan";
import User from "../models/User";
import Document from "../models/Document";
import { validateBorrower } from "../utils/bre";
import { calculateSimpleInterest } from "../utils/interest";
import { canTransition } from "../utils/status";

// Borrower applies for loan
export const applyLoan = async (req: Request, res: Response) => {
  try {
    const { amount, tenure, name, pan, dob, salary, employmentMode } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // BRE validation
    const bre = validateBorrower({
      dob: new Date(dob),
      salary: Number(salary),
      pan,
      employmentMode,
    });
    if (!bre.valid) return res.status(400).json({ message: bre.message });
    // Save salary slip
    let fileUrl = "";
    let fileType = "";
    if (req.file) {
      fileUrl = req.file.path;
      fileType = req.file.mimetype;
      await Document.create({
        loan: null,
        borrower: user._id,
        fileUrl,
        fileType,
      });
    } else {
      return res.status(400).json({ message: "Salary slip required" });
    }
    // Calculate interest
    const interest = calculateSimpleInterest(
      Number(amount),
      12,
      Number(tenure),
    );
    const totalRepayment = Number(amount) + interest;
    // Create loan
    const loan = await Loan.create({
      borrower: user._id,
      amount,
      tenure,
      interest,
      totalRepayment,
      status: "APPLIED",
    });
    // Link document to loan
    await Document.updateOne(
      { borrower: user._id, loan: null },
      { loan: loan._id },
    );
    // Update user details
    user.name = name;
    user.pan = pan;
    user.dob = dob;
    user.salary = salary;
    user.employmentMode = employmentMode;
    await user.save();
    res.status(201).json({ message: "Loan applied", loan });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get borrower's loans
export const getMyLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ borrower: req.user.id });
  res.json(loans);
};

// Get all loans (admin)
export const getAllLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find().populate("borrower");
  res.json(loans);
};

// Sanction module
export const getAppliedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "APPLIED" }).populate("borrower");
  res.json(loans);
};
export const sanctionLoan = async (req: Request, res: Response) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan || loan.status !== "APPLIED")
    return res.status(400).json({ message: "Invalid loan" });
  if (!canTransition(loan.status, "SANCTIONED"))
    return res.status(400).json({ message: "Invalid transition" });
  loan.status = "SANCTIONED";
  loan.sanctionBy = req.user.id;
  await loan.save();
  res.json({ message: "Loan sanctioned", loan });
};
export const rejectLoan = async (req: Request, res: Response) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan || loan.status !== "APPLIED")
    return res.status(400).json({ message: "Invalid loan" });
  if (!canTransition(loan.status, "REJECTED"))
    return res.status(400).json({ message: "Invalid transition" });
  loan.status = "REJECTED";
  await loan.save();
  res.json({ message: "Loan rejected", loan });
};

// Disbursement module
export const getSanctionedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "SANCTIONED" }).populate("borrower");
  res.json(loans);
};
export const disburseLoan = async (req: Request, res: Response) => {
  const loan = await Loan.findById(req.params.id);
  if (!loan || loan.status !== "SANCTIONED")
    return res.status(400).json({ message: "Invalid loan" });
  if (!canTransition(loan.status, "DISBURSED"))
    return res.status(400).json({ message: "Invalid transition" });
  loan.status = "DISBURSED";
  loan.disburseBy = req.user.id;
  await loan.save();
  res.json({ message: "Loan disbursed", loan });
};

// Collection module
export const getDisbursedLoans = async (req: Request, res: Response) => {
  const loans = await Loan.find({ status: "DISBURSED" }).populate("borrower");
  res.json(loans);
};

// Get loan by id
export const getLoanById = async (req: Request, res: Response) => {
  const loan = await Loan.findById(req.params.id).populate("borrower");
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  res.json(loan);
};
