# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy only dependency files first (лучшая практика для кэширования)
COPY package.json package-lock.json ./

# 2. Install dependencies
RUN npm ci

# 3. Copy all other files
COPY . .

# 4. Build the app
RUN npm run build

# Stage 2: Production
FROM nginx:1.23-alpine

# 1. Remove default nginx config
RUN rm -rf /etc/nginx/conf.d/default.conf

# 2. Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# 3. Copy our nginx config
COPY nginx.conf /etc/nginx/conf.d

# 4. Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
	chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]