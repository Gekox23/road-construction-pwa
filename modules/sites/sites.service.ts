import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { SiteRow } from '../../shared/types/db-rows';

export async function listAllSites(): Promise<SiteRow[]> {
  try {
    const res = await db.query<SiteRow>(
      `SELECT s.*, u.name as leader_name,
        COUNT(DISTINCT sm.machine_id) FILTER (WHERE sm.removed_at IS NULL) as machine_count
       FROM sites s
       LEFT JOIN users u ON s.leader_id = u.id
       LEFT JOIN site_machines sm ON s.id = sm.site_id
       WHERE s.status != 'archivalt'
       GROUP BY s.id, u.name ORDER BY s.status, s.name`
    );
    return res.rows;
  } catch (err) {
    console.error('[sites.listAllSites] Hiba:', err);
    return [];
  }
}

export async function listOwnSites(userId: string): Promise<SiteRow[]> {
  try {
    const res = await db.query<SiteRow>(
      `SELECT s.*, u.name as leader_name,
        COUNT(DISTINCT sm.machine_id) FILTER (WHERE sm.removed_at IS NULL) as machine_count
       FROM sites s
       LEFT JOIN users u ON s.leader_id = u.id
       LEFT JOIN site_machines sm ON s.id = sm.site_id
       LEFT JOIN site_users su ON s.id = su.site_id
       WHERE (s.leader_id = $1 OR su.user_id = $1) AND s.status != 'archivalt'
       GROUP BY s.id, u.name ORDER BY s.name`,
      [userId]
    );
    return res.rows;
  } catch (err) {
    console.error('[sites.listOwnSites] Hiba:', err);
    return [];
  }
}

export async function createSite(data: { name: string; location?: string; leaderId?: string }, userId: string): Promise<SiteRow> {
  try {
    const res = await db.query<SiteRow>(
      'INSERT INTO sites (name, location, leader_id) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.location || null, data.leaderId || null]
    );
    await writeAuditLog({ userId, module: 'sites', functionName: 'createSite', eventType: 'CREATE', newValue: res.rows[0] });
    return res.rows[0];
  } catch (err) {
    console.error('[sites.createSite] Hiba:', err);
    throw err;
  }
}
