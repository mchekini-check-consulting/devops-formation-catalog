# Stage 1: build (bundle avec esbuild)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx esbuild src/app.js --bundle --platform=node --outfile=dist/app.js \
    --external:pg \
    --external:pg-hstore \
    --external:pg-native \
    --external:tedious \
    --external:mysql2 \
    --external:mariadb \
    --external:sqlite3 \
    --external:better-sqlite3 \
    --external:oracledb \
    --external:ibm_db \
    --external:snowflake-sdk

# Stage 2: production (sans node_modules)
FROM node:20-alpine AS production
RUN apk update && apk upgrade --no-cache
WORKDIR /app
COPY --from=builder /app/dist/app.js ./app.js
RUN npm init -y > /dev/null 2>&1 && npm install pg --omit=dev 2>/dev/null
RUN chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://127.0.0.1:4000/health || exit 1
CMD ["node", "app.js"]
