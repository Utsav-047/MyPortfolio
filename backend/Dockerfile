# ==============================================================================
# Dockerfile: Node.js Alpine Production Backend Container
# ==============================================================================
FROM node:20-alpine

# Set non-root working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies before copying source for maximum Docker cache reuse
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend source files
COPY . .

# Expose internal Express server port
EXPOSE 5000

# Container Healthcheck verifying /api/status endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/ || exit 1

# Run Express API server using Node.js
CMD ["node", "server.js"]
