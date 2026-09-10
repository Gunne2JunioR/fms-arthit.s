"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { writeAudit } from "@/features/identity/server";
import { BOOKING_P } from "../permissions";
import { createBookingSchema, updateBookingStatusSchema } from "./validations";
import * as services from "./services";
import type { BookingReservationDto, FacilityResourceDto } from "./services";

async function getClientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function getBookingsAction(resourceId?: string): Promise<ActionResult<BookingReservationDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    return services.listBookings(ctx.tenantId, resourceId);
  });
}

export async function getResourcesAction(): Promise<ActionResult<FacilityResourceDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    return services.listResources(ctx.tenantId);
  });
}

export async function createBookingAction(input: unknown): Promise<ActionResult<BookingReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingRead);
    const parsed = createBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    try {
      const created = await services.createBooking(ctx.tenantId, ctx.userId, parsed);
      await writeAudit({
        tenantId: ctx.tenantId,
        actorId: ctx.userId,
        action: "booking.create",
        entity: "booking_reservation",
        entityId: created.id,
        after: created,
        ip,
      });
      revalidatePath("/admin/bookings");
      return created;
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "CONFLICT_OVERLAPPING_RESERVATION") {
        throw new Error("ช่วงเวลาดังกล่าวมีผู้จองแล้ว กรุณาเลือกช่วงเวลาอื่น");
      }
      throw e;
    }
  });
}

export async function updateBookingStatusAction(input: unknown): Promise<ActionResult<BookingReservationDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(BOOKING_P.bookingManage);
    const parsed = updateBookingStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const ip = await getClientIp();
    const before = await services.getBookingById(ctx.tenantId, parsed.id);
    const updated = await services.updateBookingStatus(ctx.tenantId, parsed);
    await writeAudit({
      tenantId: ctx.tenantId,
      actorId: ctx.userId,
      action: "booking.update_status",
      entity: "booking_reservation",
      entityId: updated.id,
      before,
      after: updated,
      ip,
    });
    revalidatePath("/admin/bookings");
    return updated;
  });
}
