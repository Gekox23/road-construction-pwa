import db from '../../shared/db/client';
import { writeAuditLog } from '../../shared/utils/audit';
import type { Order } from '../../shared/types';
import type { OrderRow } from '../../shared/types/db-rows';

export async function listOrders(status?: string): Promise<OrderRow[]> {
  try {
    let q = `SELECT o.*, u.name as creator_name FROM orders o LEFT JOIN users u ON o.created_by = u.id`;
    const params: unknown[] = [];
    if (status) { q += ' WHERE o.status = $1'; params.push(status); }
    q += ' ORDER BY o.created_at DESC LIMIT 200';
    const res = await db.query<OrderRow>(q, params);
    return res.rows;
  } catch (err) {
    console.error('[orders.listOrders] Hiba:', err);
    return [];
  }
}

export async function createOrder(data: { items: { itemName: string; quantity: number; unit?: string; unknownItem?: boolean }[]; notes?: string; eventDate: string }, userId: string): Promise<OrderRow> {
  try {
    const orderRes = await db.query<OrderRow>(
      `INSERT INTO orders (created_by, status, notes, event_date) VALUES ($1, 'fuggoben', $2, $3) RETURNING *`,
      [userId, data.notes || null, data.eventDate]
    );
    const orderId = orderRes.rows[0].id;
    for (const item of data.items) {
      await db.query(
        `INSERT INTO order_items (order_id, item_name, quantity, unit, unknown_item) VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.itemName, item.quantity, item.unit || null, item.unknownItem || false]
      );
    }
    await writeAuditLog({ userId, module: 'orders', functionName: 'createOrder', eventType: 'CREATE', newValue: { orderId } });
    return orderRes.rows[0];
  } catch (err) {
    console.error('[orders.createOrder] Hiba:', err);
    throw err;
  }
}

export async function approveOrder(id: string, approved: boolean, userId: string): Promise<OrderRow> {
  try {
    const status = approved ? 'jovahagyva' : 'elutasitva';
    const res = await db.query<OrderRow>('UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *', [status, id]);
    await writeAuditLog({ userId, module: 'orders', functionName: 'approveOrder', eventType: 'UPDATE', newValue: { id, status } });
    return res.rows[0];
  } catch (err) {
    console.error('[orders.approveOrder] Hiba:', err);
    throw err;
  }
}
