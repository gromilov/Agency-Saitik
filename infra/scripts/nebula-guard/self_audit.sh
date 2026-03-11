#!/bin/bash

# СИНДИКАТ: САМОАНАЛИЗ НЕБУЛЫ (NEBULA SELF-AUDIT) 🌌🔍
# Этот скрипт проверяет другие скрипты Небулы на предмет несанкционированных изменений (backdoors).

GUARD_DIR="/root/projects/SYNDICATE/infra/scripts/nebula-guard"
SCRIPTS=("integrity_check.sh" "secret_scanner.sh" "guard_env.sh" "secure_commit.sh")

# Подозрительные паттерны, которых НЕ ДОЛЖНО БЫТЬ в скриптах Небулы
# (Исключение: сам этот скрипт, так как он содержит эти паттерны как текст для поиска)
FORBIDDEN_PATTERNS=("curl " "wget " "rm -rf " "\| bash" "nc " "bash -i")

echo "🔍 [NEBULA] Запуск протокола САМОАНАЛИЗ..."

found_anomaly=0

for script in "${SCRIPTS[@]}"; do
    FILE_PATH="$GUARD_DIR/$script"
    
    if [ ! -f "$FILE_PATH" ]; then
        echo "❌ ОШИБКА: Скрипт защиты $script не найден! Возможна диверсия."
        found_anomaly=1
        continue
    fi

    # Проверка на наличие запрещенных команд
    for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
        # Игнорируем совпадения внутри echo или комментариев (базовая эвристика)
        if grep -E "^[^#]*$pattern" "$FILE_PATH" | grep -v "echo" > /dev/null 2>&1; then
            echo "🚨 ОПАСНОСТЬ: Обнаружена подозрительная команда '$pattern' в скрипте $script!"
            found_anomaly=1
        fi
    done
done

if [ $found_anomaly -eq 1 ]; then
    echo "⛔ [GATEKEEPER BLOCKED]: Самоанализ провален. Скрипты защиты скомпрометированы."
    echo "Коммит отменен. Архитектор, проверьте директорию nebula-guard."
    exit 1
fi

echo "✅ Самоанализ пройден. Разум Стража чист."
exit 0
