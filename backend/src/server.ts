import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth";
import loanRoutes from "./routes/loan";
import paymentRoutes from "./routes/payment";
import dashboardRoutes from "./routes/dashboard";
import uploadRoutes from "./routes/upload";

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "LMS Backend Running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

export default app;
