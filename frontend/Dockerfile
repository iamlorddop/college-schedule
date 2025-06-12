# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy only dependency files first
COPY package.json ./

# 2. Copy lock file if it exists (не будет ошибкой, если файла нет)
COPY package-lock.json* ./

# 3. Install dependencies (генерируем lock-файл если его нет)
RUN if [ ! -f package-lock.json ]; then npm install; else npm ci; fi

# 4. Copy all other files
COPY . .

# 5. Build the app
RUN npm run build

# Stage 2: Production
FROM nginx:1.23-alpine

RUN rm -rf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d

RUN chown -R nginx:nginx /usr/share/nginx/html && \
	chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]