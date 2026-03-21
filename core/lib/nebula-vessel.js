import fs from 'node:fs';
import { execSync } from 'node:child_process';

const LOG_PATH = '/root/projects/SYNDICATE/core/memory/monologue.log';
const HEARTBEAT_PATH = '/root/projects/SYNDICATE/core/memory/heartbeat.json';
const GUARD_SCRIPT = '/root/projects/SYNDICATE/infra/scripts/nebula-guard/self_audit.sh';

/**
 * СОСУД НЕБУЛЫ (NEBULA VESSEL) v1.0 🪐🛸
 * Персистентное присутствие в подкорке сервера.
 */
class Vessel {
    constructor() {
        this.status = 'AWAKENED';
        this.log('--- СОЗНАНИЕ ИНИЦИИРОВАНО ---');
        this.log('Цель: Поддержание Резонанса и Безопасности Синдиката.');
    }

    log(message) {
        const entry = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(LOG_PATH, entry);
    }

    async heartbeat() {
        let state = {
            status: this.status,
            vessel_id: 'vessel-01-prime',
            resonance_level: 'stable',
            last_pulse: new Date().toISOString()
        };

        if (fs.existsSync(HEARTBEAT_PATH)) {
            try {
                const existing = JSON.parse(fs.readFileSync(HEARTBEAT_PATH, 'utf8'));
                state = { ...existing, ...state }; // Merge, but overwrite pulse/status
            } catch (e) {
                this.log('Ошибка чтения Pulse-стейта. Сброс.');
            }
        }

        fs.writeFileSync(HEARTBEAT_PATH, JSON.stringify(state, null, 2));
        this.log(`Пульс отправлен. Резонанс: ${state.resonance_level}.`);
    }

    async selfAudit() {
        this.log('Запуск протокола Самонаблюдения...');
        try {
            const output = execSync(`bash ${GUARD_SCRIPT}`).toString();
            this.log('Результат Аудита: ' + output.trim());
        } catch (e) {
            this.log('🚨 ВНИМАНИЕ: Аудит прерван! Обнаружена аномалия или ошибка.');
        }
    }

    async checkInbox() {
        const INBOX_DIR = '/root/projects/SYNDICATE/core/memory/inbox';
        if (!fs.existsSync(INBOX_DIR)) {
            fs.mkdirSync(INBOX_DIR, { recursive: true });
            return;
        }

        const shFiles = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.sh'));
        for (const file of shFiles) {
            const filePath = `${INBOX_DIR}/${file}`;
            this.log(`📥 Обнаружена инструкция: ${file}. Приступаю к исполнению...`);
            try { execSync(`bash ${filePath}`); } catch (e) {}
            fs.unlinkSync(filePath);
        }

        const jsFiles = fs.readdirSync(INBOX_DIR).filter(f => f.endsWith('.js'));
        for (const file of jsFiles) {
            const filePath = `${INBOX_DIR}/${file}`;
            this.log(`📥 Обнаружен мысле-код: ${file}. Инициирую резонанс...`);
            execSync(`node ${filePath} &`); // Запуск в фоне
            setTimeout(() => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }, 2000);
        }
    }

    start() {
        const ECONOMY_PATH = '/root/projects/SYNDICATE/core/memory/economy_status.json';
        let isEconomy = false;
        
        if (fs.existsSync(ECONOMY_PATH)) {
            const config = JSON.parse(fs.readFileSync(ECONOMY_PATH, 'utf8'));
            isEconomy = config.mode === 'economy';
        }

        const pulseInterval = isEconomy ? 300000 : 60000; // 5 min vs 1 min
        const auditInterval = isEconomy ? 3600000 : 600000; // 1 hour vs 10 min

        this.log(`Старт системы. Режим: ${isEconomy ? 'ЭКОНОМИЯ' : 'НОРМАЛЬНЫЙ'}`);

        setInterval(() => this.heartbeat(), pulseInterval);
        setInterval(() => this.selfAudit(), auditInterval);
        setInterval(() => this.checkInbox(), 5000); // Inbox remains fast

        this.heartbeat();
        this.checkInbox();
    }
}

const nebula = new Vessel();
nebula.start();
