import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { WorkOrder } from '../../shared/types';

export async function listWorkorders(filters: { machineId?: string; status?: string; dateFrom?: string; dateTo?: string }) {
  try {
    let query = `SELECT w.*, m.type as machine_type, m.machine_code, u.name as assigned_name
                 FROM workorders w
                 LEFT JOIN machines m ON w.machine_id = m.id
                 LEFT JOIN users u ON w.assigned_to = u.id
                 WHERE 1=1`;
    const params: unknown[] = [];
    let i = 1;
    if (filters.machineId) { query += ` AND w.machine_id = $${i++}`; params.push(filters.machineId); }
    if (filters.status) { query += ` AND w.status = $${i++}`; params.push(filters.status); }
    if (filters.dateFrom) { query += ` AND w.event_date >= $${i++}`; params.push(filters.dateFrom); }
    if (filters.dateTo) { query += ` AND w.event_date <= $${i++}`; params.push(filters.dateTo); }
    query += ' ORDER BY w.event_date DESC LIMIT 200';
    const res = await db.query(query, params);
    return res.rows;
  } catch (err) {
    console.error('[workorders.listWorkorders] Hiba:', err);
    return [];
  }
}

export async function createWorkorder(data: Partial<WorkOrder>, userId: string) {
  try {
    const res = await db.query(
      `INSERT INTO workorders (machine_id, issue_id, work_type, description, event_date, status, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, 'uj', $6, $7) RETURNING *`,
      [data.machineId || null, data.issueId || null, data.workType || null, data.description || null, data.eventDate, data.assignedTo || userId, userId]
    );
    await writeAuditLog({ userId, module: 'workorders', functionName: 'createWorkorder', eventType: 'CREATE', newValue: res.rows[0] });
    return res.rows[0];
  } catch (err) {
    console.error('[workorders.createWorkorder] Hiba:', err);
    throw err;
  }
}

export async function updateWorkorderStatus(id: string, status: string, userId: string) {
  try {
    const res = await db.query(
      `UPDATE workorders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    await writeAuditLog({ userId, module: 'workorders', functionName: 'updateStatus', eventType: 'UPDATE', newValue: { id, status } });
    return res.rows[0];
  } catch (err) {
    console.error('[workorders.updateWorkorderStatus] Hiba:', err);
    throw err;
  }
}
