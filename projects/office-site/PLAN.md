# PLAN: SYNDICATE OFFICE 🐾💸

## Технический Стек
* **Framework:** Astro 5 (SSR mode)
* **Database:** SQLite (local file `data/syndicate.db`)
* **ORM:** Drizzle ORM
* **Styling:** Tailwind CSS v4

## Структура Базы Данных (Draft)
```typescript
// Схема для Drizzle
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  clientName: text('client_name').notNull(),
  hourlyRate: integer('hourly_rate').notNull(),
  status: text('status').default('active')
});

export const hours = sqliteTable('hours', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: text('project_id').references(() => projects.id),
  description: text('description').notNull(),
  minutes: integer('minutes').notNull(),
  date: text('date').notNull()
});
```

## Доступ
* **Админка (`/admin`):** Защищена (нужно обсудить с Небулой способ авторизации, возможно через Telegram).
* **Клиентский вид (`/view/[uuid]`):** Только чтение, никакой индексации поисковиками.

---
🐾 *«Архитектура — это фундамент. Без неё тазик перевернется.» — Кашлак.* 🖤
