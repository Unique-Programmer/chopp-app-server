#!/bin/sh

set -e

echo "🔍 Проверка, существует ли база данных..."
if psql -U postgres -h 127.0.0.1 -tc "SELECT 1 FROM pg_database WHERE datname = 'chopp'" | grep -q 1; then
  echo "✅ База уже есть"
else
  echo "🚀 Создаю базу chopp"
  createdb -U postgres -h 127.0.0.1 chopp
fi

npm run migrate:prod &&
npx sequelize-cli db:seed:all &&
exec npm run start:prod
