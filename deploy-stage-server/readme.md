⚙️ Установка

1. Установка зависимостей

npm init -y
npm install express express-basic-auth body-parser ejs

2. Подготовка скрипта

chmod +x deploy.sh

3. Создание логов

mkdir -p logs
touch logs/deploy.log
chmod 666 logs/deploy.log