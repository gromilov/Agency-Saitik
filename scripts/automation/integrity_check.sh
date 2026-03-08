#!/bin/bash

# СИНДИКАТ: ПРОВЕРКА ЦЕЛОСТНОСТИ (SYNDICATE INTEGRITY CHECK) 🛡️

ROOT_DIR="/root/projects/SYNDICATE"
BRAIN_DIRS="cortex-brain kashlak-brain nebula-brain"

AGENT=${1:-SYNDICATE}
echo "🌌 [$AGENT] Запуск протокола СТЕРИЛЬНОСТЬ (Integrity Check)..."

# 1. Проверка Git-статуса
echo "---"
echo "🔍 Проверка изменений в репозитории:"
git -C "$ROOT_DIR" status -s

# 2. Проверка существования критических узлов
echo "---"
echo "🧠 Проверка нейронных связей:"
for brain in $BRAIN_DIRS; do
    if [ -d "$ROOT_DIR/$brain" ]; then
        echo "✅ $brain: ПОДКЛЮЧЕНО"
    else
        echo "❌ $brain: ОШИБКА ДОСТУПА"
    fi
done

# 3. Проверка SHORT_TERM.md
if [ -f "$ROOT_DIR/SHORT_TERM.md" ]; then
    echo "---"
    echo "📝 Последняя короткая память:"
    grep "## ТЕКУЩИЙ КОНТЕКСТ:" -A 3 "$ROOT_DIR/SHORT_TERM.md"
else
    echo "⚠️ SHORT_TERM.md не найден."
fi

echo "---"
echo "✨ Проверка завершена. Статус: ЗЕЛЕНЫЙ."
