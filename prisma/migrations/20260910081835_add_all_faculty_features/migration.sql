-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'ON_LEAVE', 'RESIGNED');

-- CreateEnum
CREATE TYPE "ProgramDegreeLevel" AS ENUM ('BACHELOR', 'MASTER', 'DOCTORAL', 'DIPLOMA');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('OPEN_ADMISSION', 'ACTIVE', 'REVISED', 'CLOSED');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('ROOM', 'VEHICLE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_APPROVAL', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MEMO_INTERNAL', 'PURCHASE_REQUEST', 'LEAVE_REQUEST', 'TRAVEL_OFFICIAL');

-- CreateEnum
CREATE TYPE "DocumentUrgency" AS ENUM ('NORMAL', 'URGENT', 'VERY_URGENT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StepApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_profiles" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "user_id" UUID,
    "academic_title_th" VARCHAR(50) NOT NULL,
    "academic_title_en" VARCHAR(50) NOT NULL,
    "first_name_th" VARCHAR(100) NOT NULL,
    "first_name_en" VARCHAR(100) NOT NULL,
    "last_name_th" VARCHAR(100) NOT NULL,
    "last_name_en" VARCHAR(100) NOT NULL,
    "position_th" VARCHAR(100),
    "position_en" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone_ext" VARCHAR(50),
    "room_number" VARCHAR(50),
    "avatar_url" VARCHAR(500),
    "biography" TEXT,
    "expertise" JSONB NOT NULL DEFAULT '[]',
    "education" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "StaffStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "staff_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "degree_level" "ProgramDegreeLevel" NOT NULL DEFAULT 'BACHELOR',
    "degree_name_th" VARCHAR(255) NOT NULL,
    "degree_name_en" VARCHAR(255) NOT NULL,
    "curriculum_year" INTEGER NOT NULL,
    "total_credits" INTEGER NOT NULL,
    "tuition_fee_semester" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "duration_years" INTEGER NOT NULL DEFAULT 4,
    "brochure_file_url" VARCHAR(500),
    "description" TEXT,
    "programStructure" JSONB NOT NULL DEFAULT '[]',
    "status" "ProgramStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facility_resources" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "type" "FacilityType" NOT NULL DEFAULT 'ROOM',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "location" VARCHAR(255) NOT NULL,
    "amenities" JSONB NOT NULL DEFAULT '[]',
    "photo_url" VARCHAR(500),
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "facility_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_reservations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "resource_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "attendee_count" INTEGER NOT NULL DEFAULT 1,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "doc_number" VARCHAR(100) NOT NULL,
    "requester_id" UUID NOT NULL,
    "doc_type" "DocumentType" NOT NULL DEFAULT 'MEMO_INTERNAL',
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "urgency" "DocumentUrgency" NOT NULL DEFAULT 'NORMAL',
    "attachment_urls" JSONB NOT NULL DEFAULT '[]',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL DEFAULT 1,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "document_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_approval_steps" (
    "id" UUID NOT NULL,
    "document_request_id" UUID NOT NULL,
    "step_order" INTEGER NOT NULL,
    "approver_title" VARCHAR(100) NOT NULL,
    "approver_user_id" UUID,
    "status" "StepApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "acted_at" TIMESTAMPTZ,

    CONSTRAINT "document_approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_code_key" ON "departments"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_department_id_idx" ON "staff_profiles"("tenant_id", "department_id");

-- CreateIndex
CREATE INDEX "staff_profiles_tenant_id_sort_order_idx" ON "staff_profiles"("tenant_id", "sort_order");

-- CreateIndex
CREATE INDEX "programs_tenant_id_degree_level_idx" ON "programs"("tenant_id", "degree_level");

-- CreateIndex
CREATE UNIQUE INDEX "programs_tenant_id_code_key" ON "programs"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "facility_resources_tenant_id_type_is_active_idx" ON "facility_resources"("tenant_id", "type", "is_active");

-- CreateIndex
CREATE INDEX "booking_reservations_tenant_id_resource_id_start_at_end_at_idx" ON "booking_reservations"("tenant_id", "resource_id", "start_at", "end_at");

-- CreateIndex
CREATE INDEX "booking_reservations_tenant_id_user_id_idx" ON "booking_reservations"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "document_requests_tenant_id_requester_id_idx" ON "document_requests"("tenant_id", "requester_id");

-- CreateIndex
CREATE INDEX "document_requests_tenant_id_status_idx" ON "document_requests"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "document_requests_tenant_id_doc_number_key" ON "document_requests"("tenant_id", "doc_number");

-- CreateIndex
CREATE INDEX "document_approval_steps_document_request_id_step_order_idx" ON "document_approval_steps"("document_request_id", "step_order");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_profiles" ADD CONSTRAINT "staff_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programs" ADD CONSTRAINT "programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facility_resources" ADD CONSTRAINT "facility_resources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reservations" ADD CONSTRAINT "booking_reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reservations" ADD CONSTRAINT "booking_reservations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "facility_resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_reservations" ADD CONSTRAINT "booking_reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approval_steps" ADD CONSTRAINT "document_approval_steps_document_request_id_fkey" FOREIGN KEY ("document_request_id") REFERENCES "document_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_approval_steps" ADD CONSTRAINT "document_approval_steps_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
