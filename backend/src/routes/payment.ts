import express from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import * as paymentController from "../controllers/paymentController";

const router = express.Router();

// Record payment (collection, admin)
router.post(
  "/:loanId",
  authenticate,
  authorize(["collection", "admin"]),
  paymentController.recordPayment,
);

// Get payments for a loan
router.get("/:loanId", authenticate, paymentController.getPaymentsByLoan);

export default router;
