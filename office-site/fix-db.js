import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'syndicate.db');
console.log(`🔗 Подключение к базе: ${dbPath}`);

const db = new Database(dbPath);

try {
    // Удаляем таблицу, которая вызывает ошибку интроспекции
    db.prepare('DROP TABLE IF EXISTS telegram_drafts').run();
    console.log('✅ Таблица telegram_drafts успешно удалена.');
    
    // Опционально: создаем задел для новой таблицы, если пуш не сработает
    // Но лучше оставить это Drizzle Kit
} catch (e) {
    console.error('❌ Ошибка:', e.message);
} finally {
    db.close();
}
