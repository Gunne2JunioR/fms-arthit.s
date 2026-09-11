import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateBookingInput, UpdateBookingStatusInput } from "./validations";

export interface FacilityResourceDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  type: "ROOM" | "VEHICLE";
  capacity: number;
  location: string;
  requiresApproval: boolean;
  isActive: boolean;
}

export interface BookingReservationDto {
  id: string;
  tenantId: string;
  resourceId: string;
  userId: string;
  title: string;
  attendeeCount: number;
  startAt: Date;
  endAt: Date;
  status: "PENDING_APPROVAL" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  resource: FacilityResourceDto;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

type FacilityResourcePayload = Prisma.FacilityResourceGetPayload<Record<string, never>>;

type BookingWithRelations = Prisma.BookingReservationGetPayload<{
  include: {
    resource: true;
    user: {
      select: {
        id: true;
        email: true;
        name: true;
      };
    };
  };
}>;

function mapResource(r: FacilityResourcePayload): FacilityResourceDto {
  return {
    id: r.id,
    tenantId: r.tenantId,
    nameTh: r.nameTh,
    nameEn: r.nameEn,
    type: r.type,
    capacity: r.capacity,
    location: r.location,
    requiresApproval: r.requiresApproval,
    isActive: r.isActive,
  };
}

function mapBooking(b: BookingWithRelations): BookingReservationDto {
  return {
    id: b.id,
    tenantId: b.tenantId,
    resourceId: b.resourceId,
    userId: b.userId,
    title: b.title,
    attendeeCount: b.attendeeCount,
    startAt: b.startAt,
    endAt: b.endAt,
    status: b.status,
    note: b.note,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    resource: mapResource(b.resource),
    user: {
      id: b.user.id,
      email: b.user.email,
      name: b.user.name,
    },
  };
}

export async function listResources(tenantId: string): Promise<FacilityResourceDto[]> {
  const res = await prisma.facilityResource.findMany({
    where: { tenantId, isActive: true },
    orderBy: { nameTh: "asc" },
  });
  return res.map(mapResource);
}

export async function listBookings(tenantId: string, resourceId?: string): Promise<BookingReservationDto[]> {
  const list = await prisma.bookingReservation.findMany({
    where: {
      tenantId,
      ...(resourceId ? { resourceId } : {}),
    },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { startAt: "desc" },
  });
  return list.map(mapBooking);
}

export async function getBookingById(tenantId: string, id: string): Promise<BookingReservationDto | null> {
  const b = await prisma.bookingReservation.findFirst({
    where: { id, tenantId },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  return b ? mapBooking(b) : null;
}

export async function createBooking(
  tenantId: string,
  userId: string,
  input: CreateBookingInput
): Promise<BookingReservationDto> {
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);

  // ตรวจสอบการจองซ้ำซ้อน (Overlap Conflict)
  const conflict = await prisma.bookingReservation.findFirst({
    where: {
      tenantId,
      resourceId: input.resourceId,
      status: { in: ["PENDING_APPROVAL", "CONFIRMED"] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (conflict) {
    throw new Error("CONFLICT_OVERLAPPING_RESERVATION");
  }

  const resource = await prisma.facilityResource.findUniqueOrThrow({
    where: { id: input.resourceId },
  });

  const initialStatus = resource.requiresApproval ? "PENDING_APPROVAL" : "CONFIRMED";

  const created = await prisma.bookingReservation.create({
    data: {
      tenantId,
      userId,
      resourceId: input.resourceId,
      title: input.title,
      attendeeCount: input.attendeeCount,
      startAt,
      endAt,
      status: initialStatus,
      note: input.note || null,
    },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return mapBooking(created);
}

export async function updateBookingStatus(
  tenantId: string,
  input: UpdateBookingStatusInput
): Promise<BookingReservationDto> {
  const updated = await prisma.bookingReservation.update({
    where: { id: input.id, tenantId },
    data: {
      status: input.status,
      ...(input.note ? { note: input.note } : {}),
    },
    include: {
      resource: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
  return mapBooking(updated);
}
