# syntax=docker/dockerfile:1

# ---- base: OS prerequisites shared by every stage ----
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# ---- deps: full install, dev deps included (needed to compile) ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- build: generate the Prisma client, then compile the Nest app ----
FROM deps AS build
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- migrate: keeps the Prisma CLI for the one-shot database job ----
FROM build AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- runtime: the image you actually ship ----
FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# The Prisma client is generated at build time, not published to npm,
# so it has to be copied out of the build stage.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
