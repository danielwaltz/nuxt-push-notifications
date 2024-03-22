ARG NODE_VERSION=20.10.0

# Base
FROM node:${NODE_VERSION}-slim as base
WORKDIR /app
ENV NUXT_PUBLIC_SITE_URL=$RENDER_EXTERNAL_URL

# Install
FROM base AS install
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# Development
FROM install AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build
FROM install AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
