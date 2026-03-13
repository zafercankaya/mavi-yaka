# ── Builder ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/crawler/package.json apps/crawler/

RUN npm ci --workspace=apps/crawler --workspace=packages/shared --include-workspace-root --ignore-scripts
RUN npm install dotenv @types/node-cron --no-save

COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/crawler apps/crawler
COPY apps/api/prisma apps/api/prisma

RUN cd packages/shared && npx tsc
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma
RUN cd apps/crawler && npx tsc

# ── Runner ──────────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.52.0-noble AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/crawler/dist ./apps/crawler/dist
COPY --from=builder /app/apps/crawler/package.json ./apps/crawler/

EXPOSE 10000
CMD ["node", "apps/crawler/dist/main.js"]
