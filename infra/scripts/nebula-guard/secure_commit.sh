#!/bin/bash

# СИНДИКАТ: ЗАЩИЩЕННЫЙ КОММИТ (SECURE COMMIT BY NEBULA) 🔑🛡️
# Этот скрипт — единственный легитимный способ фиксации изменений.

MSG=$1

if [ -z "$MSG" ]; then
    echo "❌ ОШИБКА: Необходимо указать сообщение коммита на РУССКОМ языке."
    echo "Использование: ./infra/scripts/nebula-guard/secure_commit.sh \"Ваше сообщение по-русски\""
    exit 1
fi

echo "🛡️ [NEBULA] Инициирована процедура безопасной фиксации..."

# 0. Самоанализ (Self-Check)
bash ./infra/scripts/nebula-guard/self_audit.sh
if [ $? -ne 0 ]; then exit 1; fi

# 0.5 Проверка протокола Handoff
CHECKPOINT_FILE="core/agents-comms/SECURITY_CHECKPOINT.md"
if [ ! -f "$CHECKPOINT_FILE" ]; then
    echo "❌ [GATEKEEPER BLOCKED]: Отсутствует артефакт передачи (Handoff Artifact)."
    echo "Кортекс или Кашлак ОБЯЗАНЫ создать и заполнить '$CHECKPOINT_FILE'."
    echo "Используйте шаблон 'core/agents-comms/SECURITY_CHECKPOINT_TEMPLATE.md'."
    exit 1
fi
echo "✅ Handoff Artifact найден. Анализирую..."

# 1. Проверка целостности
bash ./infra/scripts/nebula-guard/integrity_check.sh Nebula
if [ $? -ne 0 ]; then exit 1; fi

# 2. Сканирование секретов
bash ./infra/scripts/nebula-guard/secret_scanner.sh
if [ $? -ne 0 ]; then exit 1; fi

# 3. Проверка изоляции .env
bash ./infra/scripts/nebula-guard/guard_env.sh
if [ $? -ne 0 ]; then exit 1; fi

# 4. Фиксация изменений
echo "🔑 [NEBULA] Все проверки пройдены. Фиксирую изменения..."
git commit -m "🛡️ [NEBULA] $MSG"

echo "✅ Изменения зафиксированы под защитой Стража."
# Удаляем чекпоинт после успешного коммита, чтобы Кортексу пришлось писать новый
rm -f "$CHECKPOINT_FILE"
echo "🧹 Чекпоинт очищен для следующей итерации."
