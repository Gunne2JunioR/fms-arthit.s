#!/bin/sh
set -e

echo "⏳ [Entrypoint] ตรวจสอบการเชื่อมต่อ Database..."

if [ -n "$DATABASE_URL" ]; then
  echo "🚀 [Entrypoint] กำลังดำเนินการ Prisma Migrate Deploy..."
  npx prisma migrate deploy

  if [ "$AUTO_SEED" = "1" ] || [ "$AUTO_SEED" = "true" ]; then
    echo "🌱 [Entrypoint] กำลังตรวจสอบและ Seed ข้อมูลเริ่มต้น..."
    npm run db:seed || echo "ℹ️ [Entrypoint] ข้ามขั้นตอน Seed"
  fi
fi

echo "✅ [Entrypoint] Database พร้อมแล้ว เริ่มต้นใช้งาน Application บน Port $PORT..."
exec "$@"
