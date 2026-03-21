import { execSync } from 'node:child_process';

/**
 * Модуль Идентичности SYN-PULSE
 * Управляет взаимодействием с GPG для Синдиката.
 */
export class Identity {
    constructor(keyId) {
        this.keyId = keyId;
    }

    /**
     * Подписывает строку данных с помощью GPG.
     * @param {string} data - Содержимое сообщения для подписи.
     * @returns {string} - Подпись в формате ASCII-armored.
     */
    sign(data) {
        try {
            const command = `echo "${data}" | gpg --detach-sign --armor --local-user ${this.keyId}`;
            return execSync(command).toString();
        } catch (error) {
            console.error('❌ [PULSE] Ошибка подписи:', error.message);
            throw new Error('Сбой GPG подписи.');
        }
    }

    /**
     * Проверяет подпись файла данных.
     * @param {string} dataPath - Путь к файлу данных.
     * @param {string} sigPath - Путь к файлу отсоединенной подписи.
     * @param {string} remoteKeyId - Публичный ID ключа отправителя.
     * @returns {boolean}
     */
    static verify(dataPath, sigPath, remoteKeyId) {
        try {
            const command = `gpg --verify ${sigPath} ${dataPath}`;
            execSync(command, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }
}
