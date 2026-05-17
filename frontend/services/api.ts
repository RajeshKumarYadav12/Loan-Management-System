import axios, { AxiosInstance } from "axios";
import { LoginResponse, SignupPayload, User } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const authService = {
  signup: async (payload: SignupPayload): Promise<User> => {
    const { data } = await client.post("/auth/signup", payload);
    return data.user;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await client.post("/auth/login", { email, password });
    return data;
  },
};

export const loanService = {
  applyLoan: async (formData: FormData): Promise<any> => {
    const { data } = await client.post("/loans/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getMyLoans: async () => {
    const { data } = await client.get("/loans/my");
    return data;
  },

  getAllLoans: async () => {
    const { data } = await client.get("/loans");
    return data;
  },

  getAppliedLoans: async () => {
    const { data } = await client.get("/loans/applied");
    return data;
  },

  getSanctionedLoans: async () => {
    const { data } = await client.get("/loans/sanctioned");
    return data;
  },

  getDisbursedLoans: async () => {
    const { data } = await client.get("/loans/disbursed");
    return data;
  },

  getLoanById: async (id: string) => {
    const { data } = await client.get(`/loans/${id}`);
    return data;
  },

  sanctionLoan: async (id: string) => {
    const { data } = await client.post(`/loans/${id}/sanction`, {});
    return data;
  },

  rejectLoan: async (id: string) => {
    const { data } = await client.post(`/loans/${id}/reject`, {});
    return data;
  },

  disburseLoan: async (id: string) => {
    const { data } = await client.post(`/loans/${id}/disburse`, {});
    return data;
  },
};

export const uploadService = {
  uploadSalarySlip: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await client.post("/upload/salary-slip", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export const paymentService = {
  recordPayment: async (loanId: string, payload: any) => {
    const { data } = await client.post(`/payments/${loanId}`, payload);
    return data;
  },

  getPayments: async (loanId: string) => {
    const { data } = await client.get(`/payments/${loanId}`);
    return data;
  },
};

export const dashboardService = {
  getLeads: async () => {
    const { data } = await client.get("/dashboard/sales/leads");
    return data;
  },

  getAppliedLoans: async () => {
    const { data } = await client.get("/dashboard/sanction/applied");
    return data;
  },

  getSanctionedLoans: async () => {
    const { data } = await client.get("/dashboard/disbursement/sanctioned");
    return data;
  },

  getDisbursedLoans: async () => {
    const { data } = await client.get("/dashboard/collection/disbursed");
    return data;
  },
};

export default client;
