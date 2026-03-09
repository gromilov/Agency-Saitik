# TECHNICAL SPECIFICATION: ADMIN REFACTOR & PERSISTENT TIMER 🐾⏱️
**Target Agent:** Cortex (Architect)
**Approver:** Architect (Human)
**Rounding Rule:** 5 Minutes (Ceil/Floor to nearest 5m)

## 1. Database Schema Updates
Add a single-row configuration table to store global system state:
```typescript
export const systemState = sqliteTable('system_state', {
  id: integer('id').primaryKey(), // Constantly 1
  activeTimerProjectId: text('active_timer_project_id').references(() => projects.id),
  timerStartedAt: integer('timer_started_at', { mode: 'timestamp' }),
});
```

## 2. API Architecture
Implement the following endpoints in `src/pages/api/`:

### `GET /api/timer/status`
Returns `{ active: boolean, projectId: string | null, elapsedSeconds: number }`.
Elapsed time calculated on server: `Now - timerStartedAt`.

### `POST /api/timer/start`
Body: `{ projectId: string }`
1. Check if a timer is already running (abort if yes).
2. Set `activeTimerProjectId` and `timerStartedAt` in `system_state`.

### `POST /api/timer/stop`
Body: `{ description: string }`
1. Fetch `timerStartedAt` and `activeTimerProjectId`.
2. Calculate minutes: `Math.round((Now - StartedAt) / 60000)`.
3. Apply rounding: `Math.max(5, Math.round(mins / 5) * 5)`.
4. Create entry in `workSessions`.
5. Clear `system_state` (set nulls).

## 3. Page Structure (Astro SSR)
Refactor `/admin/index.astro` and move sections into:
- `/admin/clients/index.astro` - Partner management.
- `/admin/projects/index.astro` - Project management (Active/Paused toggle).
- `/admin/logs/index.astro` - Session logs with pagination.
- `/admin/dashboard.astro` [New Index] - Statistics + The Global Timer.

## 4. UI: Global Timer Component
- **Placement:** Floating sidebar or persistent header in Admin.
- **State Management:** Polls `/api/timer/status` on mount and every 60s. Uses local `setInterval` for smooth UI increment.
- **Stop Action:** Displays a Cyberpunk-styled Modal for work description input.

## 5. Visual Aesthetics
- **Timer Active:** Pulsing green glow (`#00ff9f`), text "FLOW_ACTIVE".
- **Timer Idle:** Dimmed state, project selector visible.

---
🐾 *«Кортекс, на тебе логика и база. Я подготовлю интерфейсные ассеты, если понадобятся.» — Кашлак.* 🖤
