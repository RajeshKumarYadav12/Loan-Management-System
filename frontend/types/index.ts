// User and Authentication Types
export interface User {
  _id: string;
  email: string;
  name: string;
  role: Role;
  pan?: string;
  dob?: string;
  salary?: number;
  employmentMode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export type Role =
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "borrower";

// Loan Types
export interface Loan {
  _id: string;
  borrower: string | User;
  amount: number;
  tenure: number;
  interest: number;
  totalRepayment: number;
  status: LoanStatus;
  sanctionBy?: string;
  disburseBy?: string;
  closeDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus =
  | "APPLIED"
  | "SANCTIONED"
  | "REJECTED"
  | "DISBURSED"
  | "CLOSED";

// Document Types
export interface Document {
  _id: string;
  loan: string | null;
  borrower: string;
  fileUrl: string;
  fileType: string;
  extractedText?: string;
  extractedSalary?: number;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  loan: string;
  utr: string;
  amount: number;
  date: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Form Payloads
export interface BorrowerDetailsPayload {
  name: string;
  pan: string;
  dob: string;
  salary: number;
  employmentMode: string;
}

export interface LoanApplicationPayload {
  amount: number;
  tenure: number;
  name: string;
  pan: string;
  dob: string;
  employmentMode: string;
  salarySlipFile: File;
}

export interface PaymentRecordPayload {
  utr: string;
  amount: number;
  date: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  [key: string]: any;
}

export interface LoanWithBalance extends Loan {
  paidAmount?: number;
  outstandingBalance?: number;
}
