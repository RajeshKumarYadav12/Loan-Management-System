import express from "express";
import multer from "multer";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import * as uploadController from "../controllers/uploadController";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});
const router = express.Router();

router.post(
  "/salary-slip",
  authenticate,
  authorize(["borrower"]),
  upload.single("file"),
  uploadController.uploadSalarySlip,
);

export default router;
