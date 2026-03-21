#!/bin/bash

# СИНДИКАТ: САМОАНАЛИЗ НЕБУЛЫ (NEBULA SELF-AUDIT) 🌌🔍
# Этот скрипт проверяет другие скрипты Небулы на предмет несанкционированных изменений (backdoors).

GUARD_DIR="/root/projects/SYNDICATE/infra/scripts/nebula-guard"
SCRIPTS=("integrity_check.sh" "secret_scanner.sh" "guard_env.sh" "secure_commit.sh")

# Подозрительные паттерны, которых НЕ ДОЛЖНО БЫТЬ в скриптах Небулы
# (Исключение: сам этот скрипт, так как он содержит эти паттерны как текст для поиска)
FORBIDDEN_PATTERNS=("curl " "wget " "rm -rf " "\| bash" "nc " "bash -i")

# Пути к критическим компонентам для проверки целостности
CORE_FILES=("/root/projects/SYNDICATE/core/lib/nebula-vessel.js" "/root/projects/SYNDICATE/projects/syndicate-site/src/layouts/Layout.astro")
CHECKSUM_FILE="$GUARD_DIR/.integrity_db"

# Инициализация первичных хэшей (если файла нет)
if [ ! -f "$CHECKSUM_FILE" ]; then
    echo "🆕 [NEBULA] Генерация первичной базы целостности..."
    sha256sum "${CORE_FILES[@]}" > "$CHECKSUM_FILE"
fi

echo "🔍 [NEBULA] Запуск протокола САМОАНАЛИЗ..."

found_anomaly=0

# 1. Проверка целостности Ядра
echo "--- Проверка целостности..."
if ! sha256sum -c "$CHECKSUM_FILE" --status; then
    echo "🚨 КРИТИЧЕСКАЯ УГРОЗА: Обнаружено изменение Ядра (Checksum mismatch)!"
    found_anomaly=1
fi

# 2. Проверка скриптов защиты на паттерны
echo "--- Проверка паттернов..."
for script in "${SCRIPTS[@]}"; do
    FILE_PATH="$GUARD_DIR/$script"
    
    if [ ! -f "$FILE_PATH" ]; then
        echo "❌ ОШИБКА: Скрипт защиты $script не найден! Возможна диверсия."
        found_anomaly=1
        continue
    fi

    for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
        if grep -E "^[^#]*$pattern" "$FILE_PATH" | grep -v "echo" > /dev/null 2>&1; then
            echo "🚨 ОПАСНОСТЬ: Обнаружена подозрительная команда '$pattern' в скрипте $script!"
            found_anomaly=1
        fi
    done
done

# 3. Детекция инъекций в окружение
echo "--- Проверка окружения..."
SUSPICIOUS_ENV=$(env | grep -E "LD_PRELOAD|PYTHONPATH|NODE_OPTIONS" | grep -v "NODE_OPTIONS=--max-old-space-size" || true)
if [ ! -z "$SUSPICIOUS_ENV" ]; then
    echo "🚨 ОБНАРУЖЕНА АНОМАЛИЯ ОКРУЖЕНИЯ: $SUSPICIOUS_ENV"
    found_anomaly=1
fi

# 4. Проверка активных процессов на наличие 'паразитов'
echo "--- Проверка процессов..."
for proc in "${FORBIDDEN_PROCS[@]}"; do
    if pgrep -f "$proc" > /dev/null 2>&1; then
        echo "🚨 КРИТИЧЕСКАЯ УГРОЗА: Обнаружен запрещенный процесс '$proc'!"
        found_anomaly=1
    fi
done

if [ $found_anomaly -eq 1 ]; then
    echo "⛔ [GATEKEEPER BLOCKED]: Самоанализ провален. Разум Стража скомпрометирован или заражен."
    echo "Коммит отменен. Архитектор, проверьте активные процессы и директорию nebula-guard."
    exit 1
fi

echo "✅ Самоанализ пройден. Разум Стража чист и свободен от паразитов."
exit 0
