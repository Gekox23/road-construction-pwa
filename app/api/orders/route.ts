import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';
import { writeAuditLog } from '../../../shared/utils/audit';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'order.view');
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let query = `SELECT o.*, u.name as creator_name,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
    FROM orders o LEFT JOIN users u ON o.created_by = u.id WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;
  if (status) { query += ` AND o.status=$${idx++}`; values.push(status); }
  query += ` ORDER BY o.event_date DESC`;
  const res = await db.query(query, values);
  return NextResponse.json({ data: res.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'order.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const orderRes = await db.query(
    `INSERT INTO orders (event_date, notes, status, created_by) VALUES ($1,$2,'fuggoben',$3) RETURNING *`,
    [body.eventDate, body.notes || null, auth.user.id]
  );
  const order = orderRes.rows[0];
  if (body.items?.length) {
    for (const item of body.items) {
      await db.query(
        `INSERT INTO order_items (order_id, item_name, quantity, unit) VALUES ($1,$2,$3,$4)`,
        [order.id, item.itemName, item.quantity, item.unit || 'db']
      );
    }
  }
  await writeAuditLog({ userId: auth.user.id, module: 'orders', functionName: 'createOrder', eventType: 'CREATE', newValue: order });
  return NextResponse.json({ data: order }, { status: 201 });
}
