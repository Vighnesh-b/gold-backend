
FROM ghcr.io/puppeteer/puppeteer:23.5.3

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .


CMD ["node", "index.js"]
