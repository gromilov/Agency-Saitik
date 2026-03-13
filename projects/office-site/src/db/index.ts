import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const dbPath = '/root/projects/SYNDICATE/projects/office-site/data/syndicate.db';
const sqlite = new Database(dbPath);
console.log('🐾 [DB_CORE] Подключена база:', dbPath);
export const db = drizzle(sqlite, { schema });
