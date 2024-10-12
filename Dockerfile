FROM node:16-alpine

# Install necessary packages including Chromium and fonts
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    fontconfig \
    ttf-freefont

# Set Puppeteer to skip Chromium download and specify executable path
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create working directory and set permissions
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application files
COPY . .

# Change to a non-root user for security
USER node

# Command to run the application
CMD ["node", "index.js"]



