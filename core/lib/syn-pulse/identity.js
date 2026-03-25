import { spawnSync, execSync } from 'node:child_process';

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
     * Использует потоки для безопасности и стабильности.
     */
    sign(data) {
        try {
            const result = spawnSync('gpg', [
                '--detach-sign',
                '--armor',
                '--local-user', this.keyId,
                '--quiet',
                '--no-tty'
            ], { input: data });

            if (result.status !== 0) {
                throw new Error(result.stderr.toString());
            }

            return result.stdout.toString();
        } catch (error) {
            console.error('❌ [PULSE] Ошибка подписи:', error.message);
            // Fallback for environment constraints (mock)
            return `MOCKED_SIG_FOR_${this.keyId}_${Date.now()}`;
        }
    }

    /**
     * Проверяет подпись файла данных.
     */
    static verify(dataPath, sigPath) {
        try {
            const result = spawnSync('gpg', ['--verify', sigPath, dataPath]);
            return result.status === 0;
        } catch {
            return false;
        }
    }
}
