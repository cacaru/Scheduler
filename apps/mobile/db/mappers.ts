import type { RawEntry } from '@project/shared/src/repositories/entryRepository';

/** SQLite 행의 모양 (모든 컬럼이 nullable, location은 JSON string) */
export interface SQLEntryRow {
  id: string;
  user_id: string | null;
  date: string;
  type: string;
  title: string;
  content: string;
  completed: number | null;
  color: string | null;
  icon: string | null;
  is_recurring: number | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function rowToRaw(row: SQLEntryRow): RawEntry {
  return {
    id: row.id,
    user_id: row.user_id ?? undefined,
    date: row.date,
    type: row.type as RawEntry['type'],
    title: row.title,
    content: row.content,
    completed: row.completed === null ? null : row.completed === 1,
    color: row.color,
    icon: row.icon,
    is_recurring: row.is_recurring === null ? null : row.is_recurring === 1,
    location: row.location ? JSON.parse(row.location) : null,
    start_date: row.start_date,
    end_date: row.end_date,
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  };
}

export function rawToColumns(raw: Partial<RawEntry>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if ('id' in raw) out.id = raw.id;
  if ('user_id' in raw) out.user_id = raw.user_id ?? null;
  if ('date' in raw) out.date = raw.date;
  if ('type' in raw) out.type = raw.type;
  if ('title' in raw) out.title = raw.title;
  if ('content' in raw) out.content = raw.content;
  if ('completed' in raw) out.completed = raw.completed === null || raw.completed === undefined ? null : raw.completed ? 1 : 0;
  if ('color' in raw) out.color = raw.color ?? null;
  if ('icon' in raw) out.icon = raw.icon ?? null;
  if ('is_recurring' in raw) out.is_recurring = raw.is_recurring === null || raw.is_recurring === undefined ? null : raw.is_recurring ? 1 : 0;
  if ('location' in raw) out.location = raw.location ? JSON.stringify(raw.location) : null;
  if ('start_date' in raw) out.start_date = raw.start_date ?? null;
  if ('end_date' in raw) out.end_date = raw.end_date ?? null;
  if ('created_at' in raw) out.created_at = raw.created_at ?? null;
  if ('updated_at' in raw) out.updated_at = raw.updated_at ?? null;
  return out;
}
