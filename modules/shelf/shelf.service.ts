import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { ShelfItem } from '../../shared/types';

export async function listShelfItems(search?: string) {
  try {
    const q = search
      ? `SELECT si.*, u.name as holder_name FROM shelf_items si LEFT JOIN users u ON si.current_holder_id = u.id WHERE si.status != 'archivalt' AND si.name ILIKE $1 ORDER BY si.name`
      : `SELECT si.*, u.name as holder_name FROM shelf_items si LEFT JOIN users u ON si.current_holder_id = u.id WHERE si.status != 'archivalt' ORDER BY si.name`;
    const res = await db.query(q, search ? [`%${search}%`] : []);
    return res.rows;
  } catch (err) {
    console.error('[shelf.listShelfItems] Hiba:', err);
    return [];
  }
}

export async function scanOut(qrCode: string, userId: string) {
  try {
    const item = await db.query('SELECT * FROM shelf_items WHERE qr_code = $1', [qrCode]);
    if (!item.rows[0]) throw new Error(`[shelf.scan_out] QR azonosító nem található: ${qrCode}`);
    if (item.rows[0].status === 'kiveve') throw new Error(`[shelf.scan_out] Már kivett eszköz: ${qrCode}`);

    await db.query(
      `UPDATE shelf_items SET status='kiveve', current_holder_id=$1, taken_at=NOW() WHERE qr_code=$2`,
      [userId, qrCode]
    );
    await db.query(
      `INSERT INTO shelf_movements (shelf_item_id, movement_type, user_id, quantity_before, quantity_after, event_date)
       VALUES ($1, 'ki', $2, $3, $3, CURRENT_DATE)`,
      [item.rows[0].id, userId, item.rows[0].quantity_percent]
    );
    await writeAuditLog({ userId, module: 'shelf', functionName: 'scanOut', eventType: 'SCAN_OUT', newValue: { qrCode } });
    return item.rows[0];
  } catch (err) {
    console.error('[shelf.scanOut] Hiba:', err);
    throw err;
  }
}

export async function scanIn(qrCode: string, userId: string, quantityUsedPercent?: number) {
  try {
    const item = await db.query('SELECT * FROM shelf_items WHERE qr_code = $1', [qrCode]);
    if (!item.rows[0]) throw new Error(`[shelf.scan_in] QR azonosító nem található: ${qrCode}`);

    const before = item.rows[0].quantity_percent ?? 100;
    const after = item.rows[0].item_type === 'foyoeszkoz'
      ? Math.max(0, before - (quantityUsedPercent || 0))
      : before;

    await db.query(
      `UPDATE shelf_items SET status='polcon', current_holder_id=NULL, taken_at=NULL, quantity_percent=$1 WHERE qr_code=$2`,
      [after, qrCode]
    );
    await db.query(
      `INSERT INTO shelf_movements (shelf_item_id, movement_type, user_id, quantity_before, quantity_after, event_date)
       VALUES ($1, 'be', $2, $3, $4, CURRENT_DATE)`,
      [item.rows[0].id, userId, before, after]
    );
    await writeAuditLog({ userId, module: 'shelf', functionName: 'scanIn', eventType: 'SCAN_IN', newValue: { qrCode, after } });
    return { ...item.rows[0], quantity_percent: after };
  } catch (err) {
    console.error('[shelf.scanIn] Hiba:', err);
    throw err;
  }
}
