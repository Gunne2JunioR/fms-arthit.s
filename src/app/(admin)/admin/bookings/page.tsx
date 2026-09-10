import { requirePermission, hasPermission } from "@/features/identity/server";
import { BOOKING_P } from "@/features/booking";
import { listBookings, listResources } from "@/features/booking/server";
import { BookingsClient } from "./bookings-client";

export default async function AdminBookingsPage() {
  const ctx = await requirePermission(BOOKING_P.bookingRead);
  const [bookings, resources] = await Promise.all([
    listBookings(ctx.tenantId),
    listResources(ctx.tenantId),
  ]);
  const canManage = hasPermission(ctx, BOOKING_P.bookingManage);

  return (
    <BookingsClient
      initialBookings={bookings}
      resources={resources}
      canManage={canManage}
    />
  );
}
