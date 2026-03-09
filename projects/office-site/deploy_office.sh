#!/bin/bash

# Syndicate Office Deployment Script
# 🐾🚀⚙️⚓

set -e

echo "🐾 Начинаю деплой Синдикат-Офиса..."

# 1. Сборка проекта
echo "🐾 Шаг 1: Сборка проекта (Astro SSR)..."
npm run build

# 2. Проверка наличия PM2 (рекомендуется)
if command -v pm2 &> /dev/null; then
    echo "🐾 Шаг 2: Запуск/Перезапуск через PM2..."
    pm2 delete office-site 2>/dev/null || true
    pm2 start dist/server/entry.mjs --name "office-site" --env PORT=4321 --env HOST=0.0.0.0
    pm2 save
else
    echo "🐾 Шаг 2: PM2 не найден. Запуск в фоновом режиме через nohup..."
    kill $(lsof -t -i:4321) 2>/dev/null || true
    export PORT=4321
    export HOST=0.0.0.0
    nohup node dist/server/entry.mjs > office_server.log 2>&1 &
    echo "🐾 Сервер запущен в фоновом режиме. Логи в office_server.log"
fi

echo "🐾 Деплой завершен! Офис готов к работе на порту 4321."
