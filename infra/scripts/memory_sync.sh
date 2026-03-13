#!/bin/bash
# SYNDICATE MEMORY SYNC v2.0-ALPHA 🐾⚙️⚓
# Протокол: Дистилляция Опыта и Генерация Handoffs

SYNDICATE_ROOT="/root/projects/SYNDICATE"
SESSION_LOGS="$SYNDICATE_ROOT/core/memory/SESSION_LOGS.md"
HANDOFF_DIR="$SYNDICATE_ROOT/core/handoffs"
DATE=$(date +"%d.%m.%Y")
TIMESTAMP=$(date +"%H:%M:%S")

echo "🐾 Запуск процесса дистилляции [$DATE $TIMESTAMP]..."

# 1. Сбор измененных файлов (Git Context)
cd $SYNDICATE_ROOT
MODIFIED_FILES=$(git status --porcelain | awk '{print $2}')

# 2. Генерация Handoff-артефакта
HANDOFF_FILE="$HANDOFF_DIR/HANDOFF_${DATE}.md"
echo "# SESSION HANDOFF: $DATE 🐾🤝" > $HANDOFF_FILE
echo "## Modified Files during session:" >> $HANDOFF_FILE
if [ -z "$MODIFIED_FILES" ]; then
    echo "- No changes detected in repo." >> $HANDOFF_FILE
else
    echo "$MODIFIED_FILES" | sed 's/^/- /' >> $HANDOFF_FILE
fi
echo "" >> $HANDOFF_FILE
echo "## Active Tasks (Placeholder):" >> $HANDOFF_FILE
echo "- [ ] Manually describe pending tasks here." >> $HANDOFF_FILE

# 3. Обновление Общих Логов
echo "---" >> $SESSION_LOGS
echo "## Сессия: $DATE // Дистилляция v2.0" >> $SESSION_LOGS
echo "- **Modified Assets**: $(echo $MODIFIED_FILES | wc -w) files." >> $SESSION_LOGS
echo "- **Handoff Artifact**: [HANDOFF_${DATE}.md](file://$HANDOFF_FILE)" >> $SESSION_LOGS
echo "- **Status**: RESONANCE_STABLE" >> $SESSION_LOGS

echo "✅ Дистилляция завершена. Handoff создан: $HANDOFF_FILE"
echo "⚠️ Требуется ручное подтверждение смыслов в SESSION_LOGS.md"
