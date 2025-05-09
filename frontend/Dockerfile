# Этап сборки
FROM node:18-alpine as builder

WORKDIR /app

# 1. Копируем только файлы зависимостей для лучшего кэширования
COPY package.json package-lock.json ./
# Устанавливаем зависимости (включая devDependencies)
RUN npm ci

# 2. Копируем остальные файлы проекта
COPY . .

# 3. Сборка проекта с production-режимом
RUN npm run build

# 4. Этап production
FROM nginx:1.23-alpine

# Удаляем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем наш конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Оптимизация для SPA (история маршрутизации)
COPY nginx-spa.conf /etc/nginx/conf.d/nginx-spa.conf

# Устанавливаем корректные права
RUN chown -R nginx:nginx /usr/share/nginx/html && \
	chmod -R 755 /usr/share/nginx/html

# Здоровье-чек
HEALTHCHECK --interval=30s --timeout=3s \
	CMD curl -f http://localhost/ || exit 1

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]