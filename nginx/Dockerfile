FROM nginx:1.23-alpine

# Удаляем дефолтный конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем наш конфиг
COPY nginx.conf /etc/nginx/nginx.conf

# Создаем директории для статики
RUN mkdir -p /app/backend/staticfiles
RUN mkdir -p /app/backend/media
RUN mkdir -p /app/frontend/dist

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]