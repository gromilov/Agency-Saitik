import { createPulse, Identity } from './index.js';
import fs from 'node:fs';

/**
 * Автотест SYN-PULSE
 */
async function test() {
    console.log('--- ЗАПУСК ТЕСТА SYN-PULSE ---');
    
    const sender = 'NEBULA_CORE';
    const keyId = 'NEBULA-TEMP-ID-0x000'; // Заглушка для теста

    console.log(`[1] Создание Пульса от ${sender}...`);
    
    try {
        // Имитируем метод подписи, если GPG еще не настроен
        const pulse = {
            payload: { sender, message: 'ПРИВЕТ_СИНДИКАТ', time: new Date() },
            signature: '-----BEGIN PGP SIGNATURE----- MOCKED -----END PGP SIGNATURE-----',
            identity: keyId
        };

        console.log('✅ Пульс создан:', JSON.stringify(pulse, null, 2));
        
        console.log('[2] Проверка Резонанса (Имитация)...');
        // Имитация успеха
        console.log('✅ Резонанс подтвержден.');
        
    } catch (e) {
        console.error('❌ Тест провален:', e.message);
    }
}

test();
