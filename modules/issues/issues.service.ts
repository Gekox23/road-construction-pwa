import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { Issue } from '../../shared/types';
import type { IssueRow } from '../../shared/types/db-rows';

export async function listIssues(status?: string): Promise<IssueRow[]> {
  try {
    let query = `SELECT i.*, m.type as machine_type, m.machine_code, u.name as reporter_name
                 FROM issues i
                 LEFT JOIN machines m ON i.machine_id = m.id
                 LEFT JOIN users u ON i.reported_by = u.id`;
    const params: unknown[] = [];
    if (status) { query += ` WHERE i.status = $1`; params.push(status); }
    query += ' ORDER BY i.event_date DESC LIMIT 200';
    const res = await db.query<IssueRow>(query, params);
    return res.rows;
  } catch (err) {
    console.error('[issues.listIssues] Hiba:', err);
    return [];
  }
}

export async function createIssue(data: Partial<Issue>, userId: string): Promise<IssueRow> {
  try {
    const res = await db.query<IssueRow>(
      `INSERT INTO issues (machine_id, site_id, description, photo_urls, event_date, reported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'nyitott') RETURNING *`,
      [data.machineId || null, data.siteId || null, data.description, data.photoUrls || [], data.eventDate, userId]
    );
    await writeAuditLog({ userId, module: 'issues', functionName: 'createIssue', eventType: 'CREATE', newValue: res.rows[0] });
    return res.rows[0];
  } catch (err) {
    console.error('[issues.createIssue] Hiba:', err);
    throw err;
  }
}

export async function resolveIssue(id: string, userId: string): Promise<IssueRow> {
  try {
    const res = await db.query<IssueRow>(
      `UPDATE issues SET status = 'megoldott', resolved_by = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [userId, id]
    );
    await writeAuditLog({ userId, module: 'issues', functionName: 'resolveIssue', eventType: 'UPDATE', newValue: { id, status: 'megoldott' } });
    return res.rows[0];
  } catch (err) {
    console.error('[issues.resolveIssue] Hiba:', err);
    throw err;
  }
}
