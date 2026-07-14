# Base stage for dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dev stage: install all deps (including devDeps) and run in dev mode
FROM base AS dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm ci
COPY . .
RUN npm run build

# Prod runner stage
FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
