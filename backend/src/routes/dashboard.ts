import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import * as dashboardController from "../controllers/dashboardController";

const router = express.Router();

// Sales: leads (registered, not applied)
router.get(
  "/sales/leads",
  authenticate,
  authorize(["sales", "admin"]),
  dashboardController.getLeads,
);
// Sanction: applied loans
router.get(
  "/sanction/applied",
  authenticate,
  authorize(["sanction", "admin"]),
  dashboardController.getAppliedLoans,
);
// Disbursement: sanctioned loans
router.get(
  "/disbursement/sanctioned",
  authenticate,
  authorize(["disbursement", "admin"]),
  dashboardController.getSanctionedLoans,
);
// Collection: disbursed loans
router.get(
  "/collection/disbursed",
  authenticate,
  authorize(["collection", "admin"]),
  dashboardController.getDisbursedLoans,
);

export default router;
