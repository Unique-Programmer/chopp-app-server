#!/bin/bash

set -e

echo "📦 Устанавливаем Nginx..."
sudo apt-get update
sudo apt-get install -y nginx

echo ""
echo "📝 Создаём конфиг для Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }

    # API
    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Статика
    location /uploads/ {
        root /home/chopp/app-backend/chopp-app-server/;
        autoindex on;
        access_log off;
        expires max;
    }

    # Клиент
    location / {
        root /var/www/frontend-client;
        index index.html;
        try_files \$uri /index.html;
    }
}

server {
    listen 81;
    server_name _;

    # Проксируем бэкенд через /api
    location /api/ {
        rewrite ^/api/(.*)\$ /\$1 break;
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Раздаём статические файлы (изображения) из папки /uploads
    location /uploads {
        alias /home/chopp/app-backend/chopp-app-server/;
        autoindex on;
        access_log off;
        expires max;
    }

    location / {
        root /var/www/frontend-admin;
        index index.html;
        try_files \$uri /index.html;
    }
}
EOF

echo ""
echo "✅ Конфиг записан в /etc/nginx/sites-available/default"

echo ""
echo "🔁 Проверяем и перезапускаем Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "🎉 Готово! Nginx работает с указанной конфигурацией."
