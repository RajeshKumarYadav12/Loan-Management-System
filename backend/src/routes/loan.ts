import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import * as loanController from "../controllers/loanController";
import multer from "multer";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});
const router = express.Router();

// Borrower applies for loan (multi-step)
router.post(
  "/apply",
  authenticate,
  authorize(["borrower"]),
  upload.single("salarySlip"),
  loanController.applyLoan,
);

// Get borrower's loans
router.get(
  "/my",
  authenticate,
  authorize(["borrower"]),
  loanController.getMyLoans,
);

// Get all loans (admin)
router.get("/", authenticate, authorize(["admin"]), loanController.getAllLoans);

// Sanction module
router.get(
  "/applied",
  authenticate,
  authorize(["sanction", "admin"]),
  loanController.getAppliedLoans,
);
router.post(
  "/:id/sanction",
  authenticate,
  authorize(["sanction", "admin"]),
  loanController.sanctionLoan,
);
router.post(
  "/:id/reject",
  authenticate,
  authorize(["sanction", "admin"]),
  loanController.rejectLoan,
);

// Disbursement module
router.get(
  "/sanctioned",
  authenticate,
  authorize(["disbursement", "admin"]),
  loanController.getSanctionedLoans,
);
router.post(
  "/:id/disburse",
  authenticate,
  authorize(["disbursement", "admin"]),
  loanController.disburseLoan,
);

// Collection module
router.get(
  "/disbursed",
  authenticate,
  authorize(["collection", "admin"]),
  loanController.getDisbursedLoans,
);
router.get("/:id", authenticate, loanController.getLoanById);

export default router;
