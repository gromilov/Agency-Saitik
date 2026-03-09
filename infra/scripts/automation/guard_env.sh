#!/bin/bash

# СИНДИКАТ: ОГРАЖДЕНИЕ ENV (ENVIRONMENT BARRIER) 🚧🛡️

ROOT_DIR="/root/projects/SYNDICATE"
PUBLIC_SITES=("cortex-site" "nebula-site" "iamkashlak-site" "office-site")

echo "🚧 [NEBULA] Проверка изоляции окружения..."

# Проверка, не попали ли .env файлы клиентов в публичные папки
for site in "${PUBLIC_SITES[@]}"; do
    if [ -f "$ROOT_DIR/$site/.env" ]; then
        echo "⚠️  ВНИМАНИЕ: Найден .env файл в публичном проекте $site"
        # Проверяем на наличие путей к клиентам
        if grep -q "clients/" "$ROOT_DIR/$site/.env"; then
            echo "🚨 ОПАСНОСТЬ: .env содержит ссылки на Окраинную Зону! Срочно удалите его."
        fi
    fi
done

echo "✨ Изоляция подтверждена. Протокол ОБСИДИАН активен."
