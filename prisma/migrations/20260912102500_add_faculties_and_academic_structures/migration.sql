-- CreateEnum
CREATE TYPE "AcademicStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterEnum
ALTER TYPE "ProgramStatus" ADD VALUE 'ARCHIVED';

-- DropForeignKey
ALTER TABLE "programs" DROP CONSTRAINT IF EXISTS "programs_department_id_fkey";

-- DropIndex
DROP INDEX IF EXISTS "departments_tenant_id_idx";

-- AlterTable
ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "email" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "faculty_id" UUID,
ADD COLUMN IF NOT EXISTS "head_staff_id" UUID,
ADD COLUMN IF NOT EXISTS "office_location" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "phone" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "short_name_en" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "short_name_th" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "degree_short_en" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "degree_short_th" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "faculty_id" UUID,
ADD COLUMN IF NOT EXISTS "instruction_language" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "major_name" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "program_director_ids" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "program_type" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "start_academic_year" INTEGER,
ADD COLUMN IF NOT EXISTS "study_format" VARCHAR(50);

-- AlterTable
ALTER TABLE "staff_profiles" ALTER COLUMN "academic_title_th" SET DEFAULT '',
ALTER COLUMN "academic_title_en" SET DEFAULT '';

-- CreateTable
CREATE TABLE IF NOT EXISTS "faculties" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name_th" VARCHAR(255) NOT NULL,
    "name_en" VARCHAR(255) NOT NULL,
    "short_name_th" VARCHAR(50),
    "short_name_en" VARCHAR(50),
    "dean_staff_id" UUID,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "website" VARCHAR(255),
    "building_location" VARCHAR(255),
    "description" TEXT,
    "logo_url" VARCHAR(500),
    "status" "AcademicStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculties_tenant_id_status_idx" ON "faculties"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "faculties_tenant_id_sort_order_idx" ON "faculties"("tenant_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "faculties_tenant_id_code_key" ON "faculties"("tenant_id", "code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "departments_tenant_id_faculty_id_idx" ON "departments"("tenant_id", "faculty_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "departments_tenant_id_status_idx" ON "departments"("tenant_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "programs_tenant_id_faculty_id_idx" ON "programs"("tenant_id", "faculty_id");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'faculties_tenant_id_fkey') THEN
    ALTER TABLE "faculties" ADD CONSTRAINT "faculties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'faculties_dean_staff_id_fkey') THEN
    ALTER TABLE "faculties" ADD CONSTRAINT "faculties_dean_staff_id_fkey" FOREIGN KEY ("dean_staff_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_faculty_id_fkey') THEN
    ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_head_staff_id_fkey') THEN
    ALTER TABLE "departments" ADD CONSTRAINT "departments_head_staff_id_fkey" FOREIGN KEY ("head_staff_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_faculty_id_fkey') THEN
    ALTER TABLE "programs" ADD CONSTRAINT "programs_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_department_id_fkey') THEN
    ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Default Faculty Backfill
INSERT INTO "faculties" ("id", "tenant_id", "code", "name_th", "name_en", "short_name_th", "short_name_en", "email", "status", "sort_order", "created_at", "updated_at")
SELECT 
    gen_random_uuid(),
    t.id,
    'FMS',
    'คณะวิทยาการจัดการ',
    'Faculty of Management Sciences',
    'วก.',
    'FMS',
    'fms@univ.ac.th',
    'ACTIVE'::"AcademicStatus",
    1,
    NOW(),
    NOW()
FROM "tenants" t
WHERE NOT EXISTS (
    SELECT 1 FROM "faculties" f WHERE f.tenant_id = t.id AND f.code = 'FMS'
);

-- Backfill departments with the default faculty
UPDATE "departments" d
SET "faculty_id" = (
    SELECT f.id FROM "faculties" f WHERE f.tenant_id = d.tenant_id AND f.code = 'FMS' LIMIT 1
)
WHERE d.faculty_id IS NULL;

-- Backfill programs with the default faculty
UPDATE "programs" p
SET "faculty_id" = (
    SELECT f.id FROM "faculties" f WHERE f.tenant_id = p.tenant_id AND f.code = 'FMS' LIMIT 1
)
WHERE p.faculty_id IS NULL;
