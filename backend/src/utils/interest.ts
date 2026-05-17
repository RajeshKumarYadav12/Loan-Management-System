// Simple Interest Calculation
export function calculateSimpleInterest(P: number, R: number, T: number) {
  // T in days, R in percent per annum
  return (P * R * T) / (365 * 100);
}
