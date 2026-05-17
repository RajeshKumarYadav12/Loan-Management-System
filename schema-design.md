# Database Schema Design - LMS

## Overview

The Loan Management System uses MongoDB with Mongoose ODM. The database consists of 4 main collections with relationships designed to support the complete loan lifecycle.

---

## Collections & Detailed Schemas

### 1. **Users Collection**

Stores all system users (borrowers and executives).

```javascript
{
  _id: ObjectId,

  // Basic Information
  name: String,                    // Full name (required)
  email: String,                   // Unique email (required)
  password: String,                // Hashed with bcryptjs (required)
  role: String,                    // Enum: ['Admin', 'Sales', 'Sanction', 'Disbursement', 'Collection', 'Borrower'] (required)
  phone: String,                   // Optional phone number

  // KYC Details (Borrower-specific)
  panNumber: String,               // Personal Account Number (format: ABCDE1234F)
  dateOfBirth: Date,               // Birth date for age calculation
  monthlySalary: Number,           // Monthly income in rupees
  employmentMode: String,          // Enum: ['Salaried', 'Self-Employed', 'Unemployed']

  // System Fields
  kycStatus: String,               // Enum: ['PENDING', 'APPROVED', 'REJECTED']
  kycRejectionReason: String,      // Reason if KYC rejected
  isActive: Boolean,               // Account active status (default: true)
  lastLogin: Date,                 // Last login timestamp

  // Metadata
  createdAt: Date,                 // Created timestamp
  updatedAt: Date,                 // Last updated timestamp
  createdBy: String,               // Admin who created this user (if admin-created)
}
```

**Indexes**:

- `email` (unique, sparse)
- `role`
- `kycStatus`

---

### 2. **Loans Collection**

Tracks all loan applications and their lifecycle.

```javascript
{
  _id: ObjectId,

  // Borrower Reference
  borrowerId: ObjectId,            // Reference to Users collection (required)

  // Loan Amount & Terms
  amount: Number,                  // Principal amount (₹50,000 - ₹500,000) (required)
  tenure: Number,                  // Loan duration in days (30-365) (required)

  // Interest Calculation
  interestRate: Number,            // Fixed 12% per annum
  simpleInterest: Number,          // SI = (amount × interestRate × tenure) / (365 × 100)
  totalRepayment: Number,          // amount + simpleInterest

  // Payment Tracking
  totalPaid: Number,               // Sum of all payments (default: 0)
  outstandingBalance: Number,      // totalRepayment - totalPaid

  // Status & Lifecycle
  status: String,                  // Enum: ['APPLIED', 'SANCTIONED', 'DISBURSED', 'CLOSED', 'REJECTED']

  // Timeline
  appliedAt: Date,                 // When loan was applied
  sanctionedAt: Date,              // When loan was sanctioned
  sanctionedBy: ObjectId,          // Reference to Sanction User
  sanctionReason: String,          // Reason for approval/rejection
  disbursedAt: Date,               // When funds were disbursed
  disbursedBy: ObjectId,           // Reference to Disbursement User
  closedAt: Date,                  // When loan was closed
  closureReason: String,           // Reason: REPAID_FULL, REJECTED, DEFAULTED

  // Document Reference
  salarySlipDocumentId: ObjectId,  // Reference to Documents collection

  // Audit Trail
  rejectionReason: String,         // Reason if rejected at any stage
  rejectedAt: Date,
  rejectedBy: ObjectId,            // Who rejected the loan

  // Metadata
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**:

- `borrowerId`
- `status`
- `appliedAt`
- `disbursedAt`
- Compound: `borrowerId + status`

---

### 3. **Payments Collection**

Records all payments made against loans.

```javascript
{
  _id: ObjectId,

  // Loan Reference
  loanId: ObjectId,                // Reference to Loans collection (required)

  // Payment Details
  amount: Number,                  // Payment amount in rupees (required)
  utrNumber: String,               // Unique Transfer Reference (must be unique) (required)
  paymentDate: Date,               // Date payment was received (required)

  // Recorded By
  recordedBy: ObjectId,            // Reference to Collection User (required)
  recordedAt: Date,                // Timestamp when payment was recorded

  // Payment Status
  status: String,                  // Enum: ['SUCCESS', 'PENDING', 'FAILED'] (default: SUCCESS)
  remarks: String,                 // Optional remarks about payment

  // Metadata
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes**:

- `loanId`
- `utrNumber` (unique, sparse)
- `paymentDate`
- Compound: `loanId + paymentDate`

---

### 4. **Documents Collection**

Stores file uploads (salary slips, PAN documents, etc.).

```javascript
{
  _id: ObjectId,

  // User & Loan Reference
  userId: ObjectId,                // Reference to Users collection (required)
  loanId: ObjectId,                // Reference to Loans collection (optional)

  // Document Details
  type: String,                    // Enum: ['SALARY_SLIP', 'PAN_DOCUMENT', 'ID_PROOF', 'BANK_STATEMENT']
  fileName: String,                // Original file name (required)
  filePath: String,                // Server file path or S3 URL (required)
  fileSize: Number,                // File size in bytes
  mimeType: String,                // MIME type: 'application/pdf', 'image/jpeg', etc.

  // OCR Data (for Salary Slip)
  extractedText: String,           // Raw OCR extracted text
  extractedSalary: Number,         // Parsed salary amount from OCR
  ocrConfidence: Number,           // Confidence score (0-100) from Tesseract

  // Document Status
  status: String,                  // Enum: ['PENDING', 'VERIFIED', 'REJECTED']
  verificationRemark: String,      // Remark if rejected/verified
  verifiedBy: ObjectId,            // Reference to verification user
  verifiedAt: Date,

  // Metadata
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date,                 // Optional expiration date
}
```

**Indexes**:

- `userId`
- `loanId`
- `type`
- `status`

---

## Data Relationships

```
Users (1) ←──────────→ (Many) Loans
  │
  │ borrowerId (Foreign Key)
  │
  └──→ (1 or More) Documents
       │
       └─→ User uploads salary slip, PAN, etc.
           │
           └─→ Loan references salarySlipDocumentId
               │
               └─→ Payments linked to Loan
                   │
                   └─→ recordedBy references Collection User
                       └─→ sanctionedBy references Sanction User
                       └─→ disbursedBy references Disbursement User
```

---

## Loan Status State Machine

```
┌─────────────┐
│   APPLIED   │ (Borrower creates loan)
└──────┬──────┘
       │
       ├─→ ✅ SANCTIONED (Sanction exec approves)
       │   └─→ ✅ DISBURSED (Disbursement exec releases funds)
       │       └─→ ✅ CLOSED (After full repayment)
       │           └─→ Payment tracking in Collection module
       │
       └─→ ❌ REJECTED (Sanction exec rejects)
           └─→ Can be rejected at any stage
```

### Valid Transitions

| From       | To         | Actor        | Condition               |
| :--------- | :--------- | :----------- | :---------------------- |
| APPLIED    | SANCTIONED | Sanction     | All BRE checks passed   |
| APPLIED    | REJECTED   | Sanction     | Manual rejection        |
| SANCTIONED | DISBURSED  | Disbursement | Sanction approved       |
| SANCTIONED | REJECTED   | Sanction     | Reversal decision       |
| DISBURSED  | CLOSED     | System       | Full repayment received |
| DISBURSED  | REJECTED   | Admin        | System decision         |

---

## Business Rules Engine (BRE) Validations

Applied when borrower is creating loan application:

```javascript
// Age Check
const age = calculateAge(dateOfBirth);
if (age < 23 || age > 50) {
  return { valid: false, reason: "Age must be between 23 and 50" };
}

// Salary Check
if (monthlySalary < 25000) {
  return { valid: false, reason: "Minimum salary requirement: ₹25,000" };
}

// PAN Format Check
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
if (!panRegex.test(panNumber)) {
  return { valid: false, reason: "Invalid PAN format" };
}

// Employment Mode Check
if (employmentMode === "Unemployed") {
  return { valid: false, reason: "Unemployed applicants not eligible" };
}
```

---

## Interest Calculation

### Formula

Simple Interest (as per assignment):

```
SI = (P × R × T) / (365 × 100)

Where:
  P = Principal (loan amount)
  R = Rate per annum (12%)
  T = Tenure in days
```

### Example

```
Loan: ₹100,000 for 180 days at 12% p.a.

SI = (100,000 × 12 × 180) / (365 × 100)
   = 216,000,000 / 36,500
   = ₹5,917.81

Total Repayment = 100,000 + 5,917.81 = ₹105,917.81
```

### Storage

- Calculated and stored in Loan document when application is created
- Not recalculated (immutable after loan creation)
- Used for payment tracking

---

## Query Patterns

### Common Queries

```javascript
// Get borrower's loans
db.loans.find({ borrowerId: ObjectId("...") });

// Get applied loans (for Sanction module)
db.loans.find({ status: "APPLIED" });

// Get disbursed loans (for Collection module)
db.loans.find({ status: "DISBURSED" });

// Get total paid for a loan
db.payments.aggregate([
  { $match: { loanId: ObjectId("...") } },
  { $group: { _id: "$loanId", totalPaid: { $sum: "$amount" } } },
]);

// Get outstanding balance
db.loans.findOne({ _id: ObjectId("...") }, { outstandingBalance: 1 });

// Check if UTR exists
db.payments.findOne({ utrNumber: "UTR20260517001" });

// Get leads (users without loans)
db.users.find({
  role: "Borrower",
  _id: { $nin: db.loans.find({}).map((l) => l.borrowerId) },
});
```

---

## Indexes for Performance

```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ kycStatus: 1 });

// Loans Collection
db.loans.createIndex({ borrowerId: 1 });
db.loans.createIndex({ status: 1 });
db.loans.createIndex({ appliedAt: -1 });
db.loans.createIndex({ borrowerId: 1, status: 1 });

// Payments Collection
db.payments.createIndex({ loanId: 1 });
db.payments.createIndex({ utrNumber: 1 }, { unique: true });
db.payments.createIndex({ paymentDate: -1 });

// Documents Collection
db.documents.createIndex({ userId: 1 });
db.documents.createIndex({ type: 1 });
db.documents.createIndex({ status: 1 });
```

---

## Backup & Recovery

### Backup Recommendation

```bash
# MongoDB local backup
mongodump --db lms --out ./backups/lms-$(date +%Y%m%d)

# MongoDB Atlas automatic backup
# Enabled in Atlas cluster settings (automated snapshots)
```

### Recovery

```bash
# Restore from backup
mongorestore --db lms ./backups/lms-20260517/lms/
```

---

## Scalability Considerations

### For Future Growth

1. **Sharding**: Shard on `borrowerId` when reaching millions of loans
2. **Archiving**: Archive closed loans older than 2 years
3. **Caching**: Redis cache for dashboard queries
4. **Read Replicas**: MongoDB replica sets for read-heavy operations

### Optimization Strategies

1. **Query Optimization**: Use indexed fields in filters
2. **Pagination**: Implement cursor-based pagination for large result sets
3. **Aggregation Pipeline**: Use for complex queries (dashboard)
4. **Connection Pooling**: Configure pool size for concurrent requests

---

## Data Validation Rules

### Users

- Email: Valid email format, unique
- Password: Min 8 characters, 1 uppercase, 1 digit, 1 special char
- Role: Must be one of 6 valid roles
- PAN: Format ABCDE1234F (5 letters, 4 digits, 1 letter)
- Monthly Salary: Non-negative number
- Phone: Optional, valid format if provided

### Loans

- Amount: Between ₹50,000 and ₹500,000
- Tenure: Between 30 and 365 days
- Status: One of valid states
- Total Repayment: = amount + simpleInterest (immutable)

### Payments

- Amount: Positive, cannot exceed outstanding balance
- UTR: Unique across all payments
- Payment Date: Cannot be in future
- Loan ID: Must reference existing loan with DISBURSED status

---

## Audit Trail

All collections include:

- `createdAt`: When record was created
- `updatedAt`: When record was last modified
- `createdBy` / `recordedBy` / `sanctionedBy` / `disbursedBy`: Who performed action

This enables complete audit trail for compliance.

---

## Environment-Specific Schemas

### Development

- All defaults: Populate test data
- Logging: Verbose
- Validation: Strict

### Production

- Minimal test data
- Logging: Important events only
- Validation: Strict + additional checks
- Backups: Automated daily
- Replication: Enabled

---

Last Updated: May 17, 2026
