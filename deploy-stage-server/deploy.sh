#!/bin/bash

set -e

project=$1
branch=$2
start_time=$(date +%s)

echo "📁 Project: $project"
echo "🌿 Branch: $branch"

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
    echo "❌ Unknown project: $project"
    exit 1
    ;;
esac

cd "$repo_dir"
echo "🔄 Pulling latest changes from $branch..."

git fetch origin
git checkout "$branch" || git checkout -b "$branch" origin/"$branch"
git pull origin "$branch"

echo "📦 Installing dependencies..."
npm install

if [ "$project" = "backend" ]; then
  echo "🛠 Rebuilding backend containers..."
  docker-compose -f docker-compose.production.yml down || true
  docker-compose -f docker-compose.production.yml up -d --build

  echo "🗃 Running DB migrations..."
  docker exec main npm run migrate:prod
elif [ "$project" = "client" ]; then
  echo "🛠 Building client frontend..."
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-client/*
  sudo cp -r dist/* /var/www/frontend-client/
elif [ "$project" = "admin" ]; then
  echo "🛠 Building admin panel..."
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-admin/*
  sudo cp -r dist/* /var/www/frontend-admin/
fi

end_time=$(date +%s)
duration=$((end_time - start_time))
echo "✅ Deploy complete for $project:$branch in ${duration}s"
