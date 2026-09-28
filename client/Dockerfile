# syntax=docker/dockerfile:1

# --- Stage 1: build the Vite React app ---
FROM node:20-alpine AS build
WORKDIR /app

# Dependency layer — cached until the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

# Source layer — build the production bundle into /app/dist.
COPY . .
RUN npm run build

# --- Stage 2: serve the static build with nginx ---
FROM nginx:alpine

# SPA + API-proxy config replaces nginx's default site.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets produced by the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
