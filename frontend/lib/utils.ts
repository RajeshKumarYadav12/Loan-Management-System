import { Loan, LoanStatus, Payment } from "../types";

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const calculateOutstanding = (
  loan: Loan,
  payments: Payment[],
): number => {
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return Math.max(0, loan.totalRepayment - paid);
};

export const getStatusColor = (status: LoanStatus): string => {
  const colors: Record<LoanStatus, string> = {
    APPLIED: "bg-blue-500",
    SANCTIONED: "bg-yellow-500",
    REJECTED: "bg-red-500",
    DISBURSED: "bg-green-500",
    CLOSED: "bg-purple-500",
  };
  return colors[status] || "bg-gray-500";
};

export const getStatusTextColor = (status: LoanStatus): string => {
  const colors: Record<LoanStatus, string> = {
    APPLIED: "text-blue-500",
    SANCTIONED: "text-yellow-500",
    REJECTED: "text-red-500",
    DISBURSED: "text-green-500",
    CLOSED: "text-purple-500",
  };
  return colors[status] || "text-gray-500";
};

export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateInterest = (
  principal: number,
  annualRate: number,
  days: number,
): number => {
  return (principal * annualRate * days) / (365 * 100);
};
