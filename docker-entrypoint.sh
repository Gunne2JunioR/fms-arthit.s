#!/bin/sh
set -e

echo "⏳ [Entrypoint] ตรวจสอบการเชื่อมต่อ Database..."

if [ -n "$DATABASE_URL" ]; then
  echo "🚀 [Entrypoint] กำลังดำเนินการ Prisma Migrate Deploy..."
  prisma migrate deploy

  if [ "$AUTO_SEED" = "1" ] || [ "$AUTO_SEED" = "true" ]; then
    echo "🌱 [Entrypoint] กำลังตรวจสอบและ Seed ข้อมูลเริ่มต้น..."
    if [ -f "prisma/seed.js" ]; then
      SEED_ALLOW_PROD=1 node prisma/seed.js || echo "ℹ️ [Entrypoint] ข้ามขั้นตอน Seed"
    else
      echo "ℹ️ [Entrypoint] ไม่พบ prisma/seed.js ข้ามขั้นตอน Seed"
    fi
  fi
fi

echo "✅ [Entrypoint] Database พร้อมแล้ว เริ่มต้นใช้งาน Application บน Port $PORT..."
exec "$@"
