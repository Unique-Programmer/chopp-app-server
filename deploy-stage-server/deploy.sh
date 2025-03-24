#!/bin/bash

set -e

project=$1
branch=$2

echo "📁 Project: $project"
echo "🌿 Branch: $branch"

case "$project" in
  backend)
    repo_dir="/home/vlad/app-backend"
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
echo "🔄 Pulling from $branch..."
git fetch
git checkout "$branch"
git pull origin "$branch"

npm i

if [ "$project" = "backend" ]; then
  docker-compose down
  docker-compose up -d --build
elif [ "$project" = "client" ]; then
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-client/*
  sudo cp -r dist/* /var/www/frontend-client/
elif [ "$project" = "admin" ]; then
  npm run build-ignore-ts
  sudo rm -rf /var/www/frontend-admin/*
  sudo cp -r dist/* /var/www/frontend-admin/
fi

echo "✅ Deploy complete for $project:$branch"
