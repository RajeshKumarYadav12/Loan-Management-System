import { Request, Response } from "express";
import Payment from "../models/Payment";
import Loan from "../models/Loan";

// Record payment
export const recordPayment = async (req: Request, res: Response) => {
  try {
    const { utr, amount, date } = req.body;
    const { loanId } = req.params;
    // Validate loan
    const loan = await Loan.findById(loanId);
    if (!loan || loan.status !== "DISBURSED")
      return res.status(400).json({ message: "Invalid loan" });
    // Validate UTR
    const exists = await Payment.findOne({ utr });
    if (exists) return res.status(409).json({ message: "Duplicate UTR" });
    // Validate amount
    const payments = await Payment.find({ loan: loanId });
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = loan.totalRepayment - paid;
    if (amount > outstanding)
      return res
        .status(400)
        .json({ message: "Amount exceeds outstanding balance" });
    // Record payment
    const payment = await Payment.create({
      loan: loanId,
      utr,
      amount,
      date,
      createdBy: req.user.id,
    });
    // Auto-close loan
    if (paid + amount >= loan.totalRepayment) {
      loan.status = "CLOSED";
      loan.closeDate = new Date();
      await loan.save();
    }
    res.status(201).json({ message: "Payment recorded", payment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get payments for a loan
export const getPaymentsByLoan = async (req: Request, res: Response) => {
  const { loanId } = req.params;
  const payments = await Payment.find({ loan: loanId });
  res.json(payments);
};
