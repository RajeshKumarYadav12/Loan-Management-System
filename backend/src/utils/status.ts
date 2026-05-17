// Valid loan status transitions
export const STATUS_FLOW = {
  APPLIED: ["SANCTIONED", "REJECTED"],
  SANCTIONED: ["DISBURSED"],
  DISBURSED: ["CLOSED"],
  REJECTED: [],
  CLOSED: [],
};

export function canTransition(current: string, next: string) {
  return STATUS_FLOW[current]?.includes(next);
}
