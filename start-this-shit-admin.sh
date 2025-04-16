#!/bin/bash
set -e

echo "📁 Создаём директории..."
mkdir -p /home/chopp/app-frontend-admin

echo "🌐 Переходим в директорию..."
cd /home/chopp/app-frontend-admin

echo "🔽 Клонируем репозиторий админки..."
git clone https://github.com/Hydro-Dog/chopp-app-admin.git

echo "📁 Переход в проект..."
cd chopp-app-admin

echo "📄 Вставь содержимое .env.production (заверши ввод CTRL+D):"
cat > .env.production

echo "📦 Устанавливаем зависимости..."
npm install

echo "🛠 Собираем проект..."
npm run build-ignore-ts

echo "🧹 Очищаем директорию продакшн-деплоя..."
sudo rm -rf /var/www/frontend-admin/*
sudo mkdir -p /var/www/frontend-admin/

echo "📂 Копируем билд в /var/www/frontend-admin/..."
sudo cp -r dist/* /var/www/frontend-admin/

echo "✅ Админка успешно задеплоена!"
