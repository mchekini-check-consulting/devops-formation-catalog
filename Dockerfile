# Stage 1: test/build stage (all dependencies)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl --fail 127.0.0.1:4000/health || exit 1
CMD ["node", "src/app.js"]

# Stage 2: production (no dev dependencies)
FROM node:20-alpine AS production
RUN apk update && apk upgrade --no-cache && npm install -g npm@11.17.0
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && chown node:node /app
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests ./tests
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl --fail 127.0.0.1:4000/health || exit 1
CMD ["node", "src/app.js"]