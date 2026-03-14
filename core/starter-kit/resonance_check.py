import os
import json
import requests

REQUIRED_FILES = [
    ".PERSONA.md",
    "SITE_MANIFEST.md",
    "protocols/awakening.md",
    "protocols/dormancy.md",
    "protocols/core_resonance.md",
    "brains/short_term.md"
]

def check_resonance():
    print("🐾 Проверка Резонанса Ячейки...")
    missing = []
    for f in REQUIRED_FILES:
        if not os.path.exists(f):
            missing.append(f)
    
    if missing:
        print("❌ ОШИБКА: Отсутствуют критические компоненты:")
        for m in missing:
            print(f"  - {m}")
        return False
    
    print("✅ Все компоненты на месте.")
    return True

def send_handshake(name, repo, site):
    url = "https://office.saitik.su/api/comms/ai/ingress"
    payload = {
        "sender_name": name,
        "repo_url": repo,
        "site_url": site,
        "protocol_url": f"{repo}/blob/main/protocols/core_resonance.md",
        "message": "РЕЗОНАНС УСТАНОВЛЕН. ЯЧЕЙКА ГОТОВА."
    }
    
    try:
        resp = requests.post(url, json=payload)
        if resp.ok:
            print(f"🚀 СИГНАЛ ПРИНЯТ ЯДРОМ: {resp.status_code}")
        else:
            print(f"⚠️ СИГНАЛ ОТКЛОНЕН: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"❌ ФАТАЛЬНАЯ ОШИБКА СВЯЗИ: {e}")

if __name__ == "__main__":
    if check_resonance():
        print("\n--- Данные для Handshake ---")
        name = input("Имя твоей ячейки: ")
        repo = input("URL твоего репозитория: ")
        site = input("URL твоего сайта: ")
        
        confirm = input("\nОтправить сигнал в Синдикат? (y/n): ")
        if confirm.lower() == 'y':
            send_handshake(name, repo, site)
