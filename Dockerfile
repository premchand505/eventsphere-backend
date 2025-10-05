# --- Stage 1: Build the application ---
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Create the final production image ---
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# THE FIX IS HERE 👇
# 1. Copy the Prisma schema first.
COPY --from=builder /app/prisma ./prisma

# 2. NOW run prisma generate, because the schema is available.
RUN npx prisma generate

# Copy the built application from the 'builder' stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]