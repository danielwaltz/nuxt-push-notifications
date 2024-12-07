ARG NODE_VERSION=22.11.0

# Base
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Development
FROM base AS development
STOPSIGNAL SIGKILL
CMD ["sh", "-c", "npm i && npm run dev"]

# Dependencies
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Builder
FROM dependencies AS builder
COPY . .
RUN npm run build

# Production
FROM base AS production
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK CMD ["curl", "-f", "http://localhost:3000/health"]
CMD ["node", ".output/server/index.mjs"]
