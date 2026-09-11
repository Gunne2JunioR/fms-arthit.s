# 1. Base dependencies stage
FROM node:22-slim AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies in container
RUN npm install --legacy-peer-deps

# 2. Builder stage
FROM node:22-slim AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Prisma Client is generated (dummy values strictly for static build phase)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="build-time-placeholder-secret-for-nextjs-compilation-only-32bytes"
ENV APP_URL="http://localhost:3010"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate

# Bundle seed script into self-contained JS for production entrypoint
RUN npx esbuild prisma/seed.ts --bundle --platform=node --format=cjs --outfile=prisma/seed.js

# Build Next.js application (standalone output)
RUN npm run build

# 3. Production runner stage
FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates netcat-traditional bash && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"
ENV NODE_PATH="/usr/local/lib/node_modules"

# Install prisma CLI globally for database migrations
RUN npm install -g prisma@6.19.3

# Create unprivileged user for security
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Copy public static assets and build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
RUN mkdir -p /app/public/uploads && chown -R nextjs:nodejs /app/public

# Set correct permissions for Next.js prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy prisma schema, migrations, and bundled seed script
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3010

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
