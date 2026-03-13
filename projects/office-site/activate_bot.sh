#!/bin/bash

# SYNDICATE BOT ACTIVATOR 🐾🚀⚓
# Скрипт для привязки Telegram Webhook к нашему Office Portal.

# Загружаем переменные окружения
export $(grep -v '^#' .env | xargs)

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ Ошибка: В .env не найден TELEGRAM_BOT_TOKEN"
    exit 1
fi

# URL нашего офиса (измените, если используется другой домен)
OFFICE_URL="https://office.saitik.su"
WEBHOOK_URL="${OFFICE_URL}/api/comms/webhook"

echo "🐾 Пробую установить Webhook на: $WEBHOOK_URL"

# Установка вебхука через Telegram API
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d "{\"url\": \"$WEBHOOK_URL\", \"allowed_updates\": [\"message\", \"edited_message\", \"reply_markup\"]}"

echo -e "\n🐾 Статус вебхука:"
curl -X GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
echo -e "\n🐾 Готово. Бот слушает сигналы."
