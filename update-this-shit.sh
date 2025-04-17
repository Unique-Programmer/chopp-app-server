#!/bin/bash

set -e

echo "📦 Начало полной сборки проекта ($(date '+%Y-%m-%d %H:%M:%S'))"

BACKEND_DIR="/home/chopp/app-backend/chopp-app-server"
ADMIN_DIR="/home/chopp/app-frontend-admin/chopp-app-admin"
CLIENT_DIR="/home/chopp/app-frontend-client/chopp-app-client"

log_step() {
  echo -e "\n🔹 $1..."
}

handle_error() {
  echo "❌ Ошибка на этапе: $1"
  exit 1
}

# 1. Пулл backend (ветка master)
log_step "Переход в $BACKEND_DIR и пулл backend ветки master"
cd "$BACKEND_DIR" || handle_error "Не удалось перейти в $BACKEND_DIR"
git fetch origin || handle_error "Git fetch в backend"
git checkout master || handle_error "Git checkout master в backend"
git pull origin master || handle_error "Git pull master в backend"
npm i || handle_error "npm i failed"

# 2. Пулл и билд frontend admin (ветка main)
log_step "Переход в $ADMIN_DIR и пулл админки"
cd "$ADMIN_DIR" || handle_error "Не удалось перейти в $ADMIN_DIR"
git fetch origin || handle_error "Git fetch в админке"
git checkout main || handle_error "Git checkout main в админке"
git pull origin main || handle_error "Git pull main в админке"
npm install || handle_error "npm install в админке"
npm run build-ignore-ts || handle_error "npm build в админке"

log_step "Очистка старого билда и копирование нового в nginx (/var/www/frontend-admin)"
sudo rm -rf /var/www/frontend-admin/* || handle_error "Удаление старого билда админки"
sudo cp -r dist/* /var/www/frontend-admin/ || handle_error "Копирование нового билда админки"

# 3. Пулл и билд frontend client (ветка master)
log_step "Переход в $CLIENT_DIR и пулл клиентского фронта"
cd "$CLIENT_DIR" || handle_error "Не удалось перейти в $CLIENT_DIR"
git fetch origin || handle_error "Git fetch в клиенте"
git checkout master || handle_error "Git checkout master в клиенте"
git pull origin master || handle_error "Git pull master в клиенте"
npm install || handle_error "npm install в клиенте"
npm run build-ignore-ts || handle_error "npm build в клиенте"

log_step "Очистка старого билда и копирование нового в nginx (/var/www/frontend-client)"
sudo rm -rf /var/www/frontend-client/* || handle_error "Удаление старого билда клиента"
sudo cp -r dist/* /var/www/frontend-client/ || handle_error "Копирование нового билда клиента"

# 4. Перезапуск backend контейнеров
log_step "Перезапуск backend контейнеров"
cd "$BACKEND_DIR" || handle_error "Не удалось перейти в $BACKEND_DIR для docker-compose"
docker-compose -f docker-compose.production.yml down || handle_error "docker-compose down"
docker-compose -f docker-compose.production.yml up -d --build || handle_error "docker-compose up"

echo -e "\n✅ Развёртывание завершено успешно ($(date '+%Y-%m-%d %H:%M:%S'))"