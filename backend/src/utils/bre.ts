// Business Rule Engine for Borrower Validation

export function validateBorrower({
  dob,
  salary,
  pan,
  employmentMode,
}: {
  dob?: string | Date;
  salary: number;
  pan: string;
  employmentMode: string;
}) {
  // DOB Validation
  if (!dob) {
    return {
      valid: false,
      message: "Date of birth is required",
    };
  }

  const birthDate = new Date(dob);

  // Invalid date check
  if (isNaN(birthDate.getTime())) {
    return {
      valid: false,
      message: "Invalid date of birth",
    };
  }

  const age = getAge(birthDate);

  // Age Validation
  // if (age < 23 || age > 50) {
  //   return {
  //     valid: false,
  //     message: "Age must be between 23 and 50",
  //   };
  // }

  // Salary Validation
  if (!salary || salary < 25000) {
    return {
      valid: false,
      message: "Salary must be at least ₹25,000",
    };
  }

  // PAN Validation
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  if (!panRegex.test(pan.toUpperCase())) {
    return {
      valid: false,
      message: "Invalid PAN format",
    };
  }

  // Employment Validation
  if (!employmentMode || employmentMode.toLowerCase() === "unemployed") {
    return {
      valid: false,
      message: "Employment mode cannot be Unemployed",
    };
  }

  return {
    valid: true,
  };
}

// Calculate Age
function getAge(dob: Date): number {
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();

  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}
