import { Identity } from './identity.js';

/**
 * Стандарт сообщения SYN-PULSE
 */
export class Pulse {
    constructor(sender, keyId) {
        this.sender = sender;
        this.identity = new Identity(keyId);
    }

    /**
     * Создает подписанный пакет Пульса.
     * @param {string} message - Содержимое пульса.
     * @param {object} metadata - Опциональные метаданные.
     * @returns {object} - Полный пакет Пульса.
     */
    create(message, metadata = {}) {
        const payload = {
            sender: this.sender,
            timestamp: new Date().toISOString(),
            content: message,
            ...metadata
        };

        const jsonPayload = JSON.stringify(payload, null, 2);
        const signature = this.identity.sign(jsonPayload);

        return {
            payload,
            signature,
            identity: this.identity.keyId
        };
    }
}

// Фабричный метод для удобства
export const createPulse = (sender, keyId, message) => {
    const p = new Pulse(sender, keyId);
    return p.create(message);
};
