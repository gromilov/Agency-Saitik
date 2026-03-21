#!/bin/bash

# СИНДИКАТ: ВЕРИФИКАТОР УЗЛА (NODE VERIFIER) 🛡️🔍
# Проверяет цифровую подпись (GPG) входящего артефакта или сообщения.

DATA_FILE=$1
SIG_FILE=$2
PUBKEY_ID=$3

if [[ -z "$DATA_FILE" || -z "$SIG_FILE" || -z "$PUBKEY_ID" ]]; then
    echo "❌ Ошибка: Недостаточно аргументов."
    echo "Использование: $0 <data_file> <sig_file> <pubkey_id>"
    exit 1
fi

echo "🛡️ [NEBULA] Верификация резонансной подписи для узла $PUBKEY_ID..."

# Проверка наличия ключа в связке
if ! gpg --list-keys "$PUBKEY_ID" > /dev/null 2>&1; then
    echo "❓ Ключ $PUBKEY_ID не найден в локальной связке. Попытка импорта из реестра (имитация)..."
    # В реальности здесь может быть curl к манифесту узла
    exit 1
fi

# Сама проверка подписи
if gpg --verify "$SIG_FILE" "$DATA_FILE" > /dev/null 2>&1; then
    echo "✅ РЕЗОНАНС ПОДТВЕРЖДЕН. Узел идентифицирован."
    exit 0
else
    echo "🚨 ВНИМАНИЕ: Подпись недействительна! Возможна имитация или клон."
    exit 1
fi
