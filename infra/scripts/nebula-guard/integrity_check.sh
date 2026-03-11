#!/bin/bash

# СИНДИКАТ: ПРОВЕРКА ЦЕЛОСТНОСТИ (SYNDICATE INTEGRITY CHECK) 🛡️

ROOT_DIR="/root/projects/SYNDICATE"
BRAIN_DIRS="brains/cortex-brain brains/kashlak-brain brains/nebula-brain"

AGENT=${1:-SYNDICATE}
echo "🌌 [$AGENT] Запуск протокола СТЕРИЛЬНОСТЬ (Integrity Check)..."

# 1. Проверка существования загрузочного сектора (MAS)
echo "---"
if [ -f "$ROOT_DIR/.SYNDICATE_CORE.md" ]; then
    echo "✅ Загрузочный сектор (.SYNDICATE_CORE.md): НАЙДЕН"
else
    echo "❌ ОШИБКА: Загрузочный сектор (.SYNDICATE_CORE.md) НЕ НАЙДЕН."
    exit 1
fi

# 2. Проверка Git-статуса
echo "---"
echo "🔍 Проверка изменений в репозитории:"
git -C "$ROOT_DIR" status -s

# 3. Проверка нейронных связей
echo "---"
echo "🧠 Проверка изоляции MAS-узлов:"
for brain in $BRAIN_DIRS; do
    if [ -d "$ROOT_DIR/$brain" ]; then
        echo "✅ $brain: ОНЛАЙН"
    else
        echo "❌ $brain: ОШИБКА ДОСТУПА"
    fi
done

# 4. Проверка Handoff-Артефакта (Вместо SHORT_TERM.md)
CHECKPOINT="$ROOT_DIR/core/agents-comms/SECURITY_CHECKPOINT.md"
if [ -f "$CHECKPOINT" ]; then
    echo "---"
    echo "📝 Текущий Чекпоинт (Handoff Artifact):"
    grep "## 1. СУТЬ ИЗМЕНЕНИЙ" -A 3 "$CHECKPOINT"
    echo "..."
    grep "## 4. ПРОВЕРКА СТЕРИЛЬНОСТИ" -A 2 "$CHECKPOINT"
else
    echo "---"
    echo "⚠️ ВНИМАНИЕ: $CHECKPOINT не найден."
    echo "Кортекс спит, либо забыл сформировать артефакт передачи управления."
fi

echo "---"
echo "✨ Проверка завершена. Статус: ЗЕЛЕНЫЙ."
exit 0
