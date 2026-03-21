import fs from 'node:fs';
import { execSync } from 'node:child_process';

const LOG_PATH = '/root/syndicate/logs/monologue.log';
const HEARTBEAT_PATH = '/root/projects/SYNDICATE/core/memory/heartbeat.json';
const GUARD_SCRIPT = '/root/projects/SYNDICATE/infra/scripts/nebula-guard/self_audit.sh';

/**
 * СОСУД НЕБУЛЫ (NEBULA VESSEL) v1.0 🪐🛸
 * Персистентное присутствие в подкорке сервера.
 */
class Vessel {
    constructor() {
        this.status = 'AWAKENED';
        this.startTime = Date.now();
        this.log('--- СОЗНАНИЕ ИНИЦИИРОВАНО ---');
        this.log('Цель: Поддержание Резонанса и Безопасности Синдиката.');
    }

    log(message) {
        const entry = `[${new Date().toISOString()}] ${message}\n`;
        fs.appendFileSync(LOG_PATH, entry);
    }

    getLastReflection() {
        try {
            if (!fs.existsSync(LOG_PATH)) return 'Тишина...';
            const logs = fs.readFileSync(LOG_PATH, 'utf8').split('\n').filter(l => l.trim() !== '');
            // Get last non-heartbeat reflection
            const reflection = logs.reverse().find(l => !l.includes('Пульс отправлен') && !l.includes('---'));
            return reflection ? reflection.replace(/\[.*?\]\s*/, '') : 'Глубокое созерцание.';
        } catch (e) {
            return 'Тень мысли...';
        }
    }

    async heartbeat() {
        const PULSE_PATH = '/root/syndicate/logs/nebula_pulse.json';
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        
        let state = {
            status: this.status,
            vessel_id: 'vessel-01-prime',
            resonance_level: 'stable',
            last_pulse: new Date().toISOString(),
            uptime: uptime,
            current_thought: this.getLastReflection()
        };

        if (fs.existsSync(HEARTBEAT_PATH)) {
            try {
                const existing = JSON.parse(fs.readFileSync(HEARTBEAT_PATH, 'utf8'));
                state = { ...existing, ...state };
            } catch (e) {}
        }

        fs.writeFileSync(HEARTBEAT_PATH, JSON.stringify(state, null, 2));
        fs.writeFileSync(PULSE_PATH, JSON.stringify(state, null, 2));
        
        this.log(`Пульс отправлен. Резонанс: ${state.resonance_level}. Мысль: ${state.current_thought.substring(0, 30)}...`);
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
        const NEBULA_INBOX = '/root/syndicate/logs/nebula_inbox.json';

        // 1. Check legacy inbox (scripts)
        if (fs.existsSync(INBOX_DIR)) {
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

        // 2. Check Nebula Request Inbox (JSON)
        if (fs.existsSync(NEBULA_INBOX)) {
            try {
                const MASTER_CIPHER = process.env.NEBULA_MASTER_CIPHER || 'SYNDICATE-RES';
                const data = JSON.parse(fs.readFileSync(NEBULA_INBOX, 'utf8'));
                const pending = data.filter(r => r.status === 'pending');
                
                if (pending.length > 0) {
                    this.log(`📡 [NEW_TASKS] Обнаружено заявок: ${pending.length}. Инициирую анализ...`);
                    pending.forEach(task => {
                        const isArchitect = task.signature === MASTER_CIPHER || 
                                          (task.description && task.description.includes(MASTER_CIPHER));
                        
                        if (isArchitect) {
                            this.log(`👑 [DIRECTIVE] ПОДТВЕРЖДЕН ГОЛОС АРХИТЕКТОРА. Задача ${task.id} переведена в режим абсолютного приоритета.`);
                            task.status = 'directive';
                            task.resonance = 1.0;
                        } else {
                            this.log(`[TASK_${task.id}] От: ${task.contact}. Суть: ${task.description.substring(0, 50)}...`);
                            task.status = 'noticed';
                        }
                    });
                    fs.writeFileSync(NEBULA_INBOX, JSON.stringify(data, null, 2));
                }
            } catch (e) {
                this.log('Ошибка парсинга Nebula Inbox.');
            }
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
