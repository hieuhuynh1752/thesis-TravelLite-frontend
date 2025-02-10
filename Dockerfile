# Stage 1: Build the Next.js app
FROM node:22.13.1-alpine AS builder

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

RUN npm install -g ts-node

# Copy the rest of the application
COPY . .

RUN TS_NODE_TRANSPILE_ONLY=true npm run build

# Stage 2: Production environment
FROM node:22.13.1-alpine AS runner

WORKDIR /app

# Install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copy the built application
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/next.config.ts .
COPY --from=builder /app/tsconfig.json .

# Expose the Next.js port
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]
