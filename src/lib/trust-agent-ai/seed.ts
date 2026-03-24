import type { DemoState } from "./types";

/** Deterministic seed for SSR + first paint (no random IDs). */
export function getSeedState(): DemoState {
  return {
    nextBookingId: 3,
    trustScore: 85,
    bookings: [
      {
        id: 1,
        employeeWallet: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        meetingTime: "2025-06-01T14:00",
        amountShm: "0.05",
        createdAt: "2025-03-20T10:00:00.000Z",
      },
      {
        id: 2,
        employeeWallet: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        meetingTime: "2025-06-02T10:30",
        amountShm: "0.03",
        createdAt: "2025-03-20T11:15:00.000Z",
      },
    ],
    activities: [
      {
        id: "seed-a1",
        ts: "2025-03-20T10:00:05.000Z",
        kind: "booking",
        title: "Booking created",
        detail: "ID 1 · 0.05 SHM escrow (mock) · employee 0x71C7…976F",
      },
      {
        id: "seed-a2",
        ts: "2025-03-20T11:15:02.000Z",
        kind: "booking",
        title: "Booking created",
        detail: "ID 2 · 0.03 SHM escrow (mock) · employee 0x8626…1199",
      },
    ],
    lastVerify: null,
  };
}
