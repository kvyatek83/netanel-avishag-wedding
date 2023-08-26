# Use official Node.js 12 as a base image
FROM node:16

# Set working dir to /app in the container
WORKDIR /app

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
  gconf-service \
  libasound2 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgcc1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libsoup2.4-1 \
  libnss3 \
  libgbm-dev \
  libxshmfence-dev \
  && rm -rf /var/lib/apt/lists/*

# Copy your package.json to container
COPY package.json .

# Install all packages
RUN npm install

# Copy full application to container
COPY . .

# Set environment variable to disable Chromium's sandbox (this is required if you are running as root)
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_ARGS='--no-sandbox'

RUN npm run build

# Start the service
CMD [ "node", "createUsersTable.js && node createAdmin.js && node app.js" ]