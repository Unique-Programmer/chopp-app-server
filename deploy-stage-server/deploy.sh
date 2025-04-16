#!/bin/bash

set -e

project=$1
branch=$2
start_time=$(date +%s)

echo "📁 Проект: $project"
echo "🌿 Ветка: $branch"

case "$project" in
  backend)
    repo_dir="/home/vlad/app-backend/chopp-app-server"
    ;;
  client)
    repo_dir="/home/vlad/app-frontend-client/chopp-app-client"
    ;;
  admin)
    repo_dir="/home/vlad/app-frontend-admin/chopp-app-admin"
    ;;
  *)
    echo "❌ Неизвестный проект: $project"
    exit 1
    ;;
esac

cd "$repo_dir"
echo "🔄 Скачиваем последние изменения ветки $branch..."

git fetch origin
git checkout "$branch" || git checkout -b "$branch" origin/"$branch"
git pull origin "$branch"

echo "📦 Устанавливаем зависимости..."
npm install

if [ "$project" = "backend" ]; then
  echo "♻️ Сброс init-db.sh до версии из репозитория..."
  git checkout -- init-db.sh
  
  echo "🔓 Делаем init-db.sh исполняемым..."
  chmod +x init-db.sh

  echo "🛠 Пересобираем backend контейнеры..."
  docker-compose -f docker-compose.production.yml down || true
  docker-compose -f docker-compose.production.yml up -d --build

  echo "⌛ Ожидаем, пока postgres станет доступен..."
  until docker exec -i postgres pg_isready -U postgres -h 127.0.0.1; do
    sleep 1
  done

  echo "🔍 Проверка: есть ли база postgres..."
  docker exec -i postgres psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'postgres'" | grep -q 1

  if [ $? -eq 0 ]; then
    echo "✅ База postgres уже существует"
  else
    echo "🚀 База postgres не найдена — создаём..."
    docker exec -i postgres psql -U postgres -c "CREATE DATABASE postgres;"
  fi

  echo "⌛ Ожидаем, пока контейнер main поднимется..."
  until [ "$(docker inspect -f '{{.State.Running}}' main 2>/dev/null)" = "true" ]; do
    sleep 1
  done

  echo "🗃 Запускаем миграции DB..."
  docker exec main npm run migrate:prod

elif [ "$project" = "client" ]; then
  echo "🛠 Собираем client frontend..."
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-client/*
  sudo cp -r dist/* /var/www/frontend-client/

elif [ "$project" = "admin" ]; then
  echo "🛠 Собираем admin panel..."
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-admin/*
  sudo cp -r dist/* /var/www/frontend-admin/
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ Деплой ветки $project:$branch занял ${duration}s"

echo "📊 Загрузка памяти:"
echo "----------------------"
awk '/Mem|Swap/ {printf "%s: %s used / %s total\n", $1, $3, $2}' <(free -h)
