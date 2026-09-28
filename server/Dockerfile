FROM node:20-alpine
WORKDIR /app

# Dependency layer — cached until package files change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Source layer — changes often, so it comes last
COPY . .

EXPOSE 4000
CMD ["node", "src/server.js"]
