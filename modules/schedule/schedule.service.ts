import db from '../../shared/db/client';
import type { ScheduleEntry } from '../../shared/types';
import type { ScheduleEntryRow } from '../../shared/types/db-rows';

export async function getScheduleForWeek(weekStart: string): Promise<ScheduleEntryRow[]> {
  try {
    const res = await db.query<ScheduleEntryRow>(
      `SELECT se.*,
        s.name as site_name, s.location as site_location,
        m.machine_code, m.type as machine_type,
        u.name as operator_name
       FROM schedule_entries se
       LEFT JOIN sites s ON se.site_id = s.id
       LEFT JOIN machines m ON se.machine_id = m.id
       LEFT JOIN users u ON se.operator_id = u.id
       WHERE se.week_start = $1
       ORDER BY se.site_id, se.day_of_week`,
      [weekStart]
    );
    return res.rows;
  } catch (err) {
    console.error('[schedule.getScheduleForWeek] Hiba:', err);
    return [];
  }
}

export async function upsertScheduleEntry(data: Partial<ScheduleEntry>, userId: string): Promise<ScheduleEntryRow | undefined> {
  try {
    const res = await db.query<ScheduleEntryRow>(
      `INSERT INTO schedule_entries (week_start, site_id, machine_id, operator_id, day_of_week, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING RETURNING *`,
      [data.weekStart, data.siteId || null, data.machineId || null, data.operatorId || null, data.dayOfWeek, data.notes || null, userId]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[schedule.upsertScheduleEntry] Hiba:', err);
    throw err;
  }
}

export async function deleteScheduleEntry(id: string): Promise<void> {
  try {
    await db.query('DELETE FROM schedule_entries WHERE id = $1', [id]);
  } catch (err) {
    console.error('[schedule.deleteScheduleEntry] Hiba:', err);
    throw err;
  }
}
