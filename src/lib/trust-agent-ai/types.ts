export type VerifyOutcome = "SUCCESS" | "FAILURE" | "MANUAL";

export interface Booking {
  id: number;
  employeeWallet: string;
  meetingTime: string;
  amountShm: string;
  createdAt: string;
}

export type ActivityKind = "booking" | "verify";

export interface ActivityEntry {
  id: string;
  ts: string;
  kind: ActivityKind;
  title: string;
  detail: string;
}

export interface VerifyResult {
  bookingId: number;
  outcome: VerifyOutcome;
  txHash: string;
  timestamp: string;
  summaryPreview: string;
}

export interface DemoState {
  nextBookingId: number;
  trustScore: number;
  bookings: Booking[];
  activities: ActivityEntry[];
  lastVerify: VerifyResult | null;
}
