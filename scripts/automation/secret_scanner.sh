#!/bin/bash

# СИНДИКАТ: ПРЕДКОММИТ-ФИЛЬТР (SECRET SCANNER) 🕵️🛡️
# Этот скрипт проверяет файлы перед коммитом на наличие секретов.

patterns=(
    'export .+=["'"'"]?[a-zA-Z0-9_\-\.]{20,}["'"'"]?'  # Возможные API ключи
    'password[:=].+'                                     # Пароли
    'secret[:=].+'                                       # Секреты
    'PRIVATE_KEY.+'                                      # Приватные ключи
    'sk_[a-zA-Z0-9]{20,}'                                # Stripe-подобные ключи
)

found_secrets=0

echo "🔍 [NEBULA] Сканирование на наличие утечек..."

# Проверяем файлы, готовые к коммиту
files=$(git diff --cached --name-only)

for file in $files; do
    # Пропускаем сам сканер, чтобы избежать ложных срабатываний на паттерны поиска
    if [[ "$file" == "scripts/automation/secret_scanner.sh" ]]; then
        continue
    fi

    for pattern in "${patterns[@]}"; do
        if grep -Ei "$pattern" "$file" > /dev/null 2>&1; then
            echo "❌ ОШИБКА: Обнаружена потенциальная утечка данных в файле: $file"
            echo "   Удалите секрет или используйте шифрование перед коммитом."
            found_secrets=1
        fi
    done
done

if [ $found_secrets -eq 1 ]; then
    echo "🚨 Коммит заблокирован протоколом СТЕРИЛЬНОСТЬ."
    exit 1
fi

echo "✅ Проверка пройдена. Протокол СТЕРИЛЬНОСТЬ соблюден."
exit 0
