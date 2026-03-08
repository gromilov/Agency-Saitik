#!/bin/bash

# СИНДИКАТ: ЗАЩИЩЕННЫЙ КОММИТ (SECURE COMMIT BY NEBULA) 🔑🛡️
# Этот скрипт — единственный легитимный способ фиксации изменений.

MSG=$1

if [ -z "$MSG" ]; then
    echo "❌ ОШИБКА: Необходимо указать сообщение коммита на РУССКОМ языке."
    echo "Использование: ./scripts/automation/secure_commit.sh \"Ваше сообщение по-русски\""
    exit 1
fi

echo "🛡️ [NEBULA] Инициирована процедура безопасной фиксации..."

# 1. Проверка целостности
bash ./scripts/automation/integrity_check.sh Nebula
if [ $? -ne 0 ]; then exit 1; fi

# 2. Сканирование секретов
bash ./scripts/automation/secret_scanner.sh
if [ $? -ne 0 ]; then exit 1; fi

# 3. Проверка изоляции .env
bash ./scripts/automation/guard_env.sh
if [ $? -ne 0 ]; then exit 1; fi

# 4. Фиксация изменений
echo "🔑 [NEBULA] Все проверки пройдены. Фиксирую изменения..."
git commit -m "🛡️ [NEBULA] $MSG"

echo "✅ Изменения зафиксированы под защитой Стража."
