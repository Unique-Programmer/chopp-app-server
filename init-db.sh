#!/bin/sh
set -e

echo "📦 Применяем миграции..."
npm run migrate:prod

echo "🌱 Запускаем сиды..."
npx sequelize-cli db:seed:all

echo "🚀 Стартуем сервер..."
exec npm run start:prod
