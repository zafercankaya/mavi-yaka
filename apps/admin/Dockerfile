# ── Builder ─────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/admin/package.json apps/admin/

RUN npm ci --workspace=apps/admin --include-workspace-root

COPY apps/admin apps/admin

ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/admin && npx next build

# ── Runner ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3001

ENV PORT=3001
CMD ["node", "apps/admin/server.js"]
