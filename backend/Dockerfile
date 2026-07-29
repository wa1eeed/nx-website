FROM node:20-alpine
WORKDIR /app

# Install prod deps first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Apply schema (idempotent) then start. Seeding is a manual one-off, never on boot.
CMD ["sh", "-c", "node src/db/migrate.js && node src/server.js"]
