import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Клиенты (Партнеры Синдиката)
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  name: text('name').notNull(),
  email: text('email'),
  telegram: text('telegram'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Проекты
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  clientId: text('client_id').references(() => clients.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  hourlyRate: integer('hourly_rate').notNull(), // в копейках/центах для точности
  currency: text('currency').default('RUB'),
  status: text('status', { enum: ['active', 'paused', 'completed'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Сессии работы (Тайм-трекинг)
export const workSessions = sqliteTable('work_sessions', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  minutes: integer('minutes').notNull(),
  date: text('date').notNull(), // ГГГГ-ММ-ДД
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Счета
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  projectId: text('project_id').references(() => projects.id),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'cancelled'] }).default('draft'),
  dueDate: text('due_date'),
  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Глобальное состояние системы (Таймер и прочее)
export const systemState = sqliteTable('system_state', {
  id: integer('id').primaryKey(), // Всегда 1
  activeTimerProjectId: text('active_timer_project_id').references(() => projects.id),
  timerStartedAt: integer('timer_started_at', { mode: 'timestamp' }),
});

// Черновики для Telegram (The Jump)
export const telegramDrafts = sqliteTable('telegram_drafts', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  content: text('content').notNull(),
  imageUrl: text('image_url'),
  audioUrl: text('audio_url'),
  status: text('status', { enum: ['draft', 'queued', 'posted'] }).default('draft'),
  telegramMessageId: text('telegram_message_id'),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  postedAt: integer('posted_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});


// Связи
export const clientRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}));

export const projectRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  workSessions: many(workSessions),
  systemStates: many(systemState), // Техническая связь
}));

export const workSessionRelations = relations(workSessions, ({ one }) => ({
  project: one(projects, {
    fields: [workSessions.projectId],
    references: [projects.id],
  }),
}));
