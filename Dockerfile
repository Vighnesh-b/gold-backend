FROM node:16-alpine

# Install Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    fontconfig \
    ttf-freefont

# Set Puppeteer to skip Chromium download
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Command to run the application
CMD ["node", "index.js"]


