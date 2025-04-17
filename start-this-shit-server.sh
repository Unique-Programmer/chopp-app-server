#!/bin/bash

set -e

echo "🧱 Обновляем пакеты и устанавливаем зависимости..."
apt-get update
apt-get install -y docker.io docker-compose git npm

echo "📁 Создаём директории..."
mkdir -p /home/chopp/app-backend

echo "🌐 Переходим в директорию..."
cd /home/chopp/app-backend

echo "🔽 Клонируем репозиторий..."
git clone https://github.com/Unique-Programmer/chopp-app-server.git

echo "📁 Переход в проект..."
cd chopp-app-server

echo "📄 Вставь содержимое .env.production (заверши ввод CTRL+D):"
cat > .env.production

echo "📄 Вставь содержимое docker-compose.production.yml (заверши ввод CTRL+D):"
cat > docker-compose.production.yml

echo "📦 Устанавливаем зависимости..."
npm install

echo "🚀 Стартуем docker-compose.production..."
docker-compose -f docker-compose.production.yml up -d --build

echo "🪵 Логи..."
docker-compose -f docker-compose.production.yml logs -f
