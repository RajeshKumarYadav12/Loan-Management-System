export const ROLES = {
  ADMIN: "admin",
  SALES: "sales",
  SANCTION: "sanction",
  DISBURSEMENT: "disbursement",
  COLLECTION: "collection",
  BORROWER: "borrower",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
