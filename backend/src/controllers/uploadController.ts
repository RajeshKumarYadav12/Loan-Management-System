import { Request, Response } from "express";
import Document from "../models/Document";
import Tesseract from "tesseract.js";

export const uploadSalarySlip = async (req: Request, res: Response) => {
  try {
    // Check file exists
    if (!req.file) {
      return res.status(400).json({
        message: "File required",
      });
    }

    // Allowed file types
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    // Validate file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only PDF, PNG and JPG files are allowed",
      });
    }

    // Validate file size (max 5 MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "File size must be less than 5 MB",
      });
    }

    const fileUrl = req.file.path;

    // OCR Extraction
    const result = await Tesseract.recognize(fileUrl, "eng");

    const extractedText = result.data.text;

    console.log("OCR TEXT:", extractedText);

    // Salary Extraction Regex
    const salaryMatch = extractedText.match(
      /(?:net take-home pay|net salary|monthly salary|gross earnings|gross salary|salary)[^\d₹]*₹?\s*([\d,]+(?:\.\d+)?)/i,
    );

    // Convert extracted salary
    const extractedSalary = salaryMatch
      ? Number(salaryMatch[1].replace(/,/g, ""))
      : null;

    console.log("Extracted Salary:", extractedSalary);

    // If OCR failed to detect salary
    if (!extractedSalary) {
      return res.status(400).json({
        message: "Unable to extract salary from salary slip",
      });
    }

    // Save document
    const document = await Document.create({
      loan: null,
      borrower: req.user.id,
      fileUrl,
      fileType: req.file.mimetype,
      extractedText,
      extractedSalary,
    });

    return res.status(201).json({
      message: "Salary slip uploaded successfully",
      extractedSalary,
      document,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
