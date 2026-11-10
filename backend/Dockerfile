# Multi-stage Dockerfile for LearnLite Backend (Node.js + TypeScript)
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy source and build TypeScript
COPY . .
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

# Create persistent data directory
RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "dist/server.js"]

