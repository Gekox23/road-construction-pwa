import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';
import { writeAuditLog } from '../../../../shared/utils/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'order.view');
  if (auth instanceof NextResponse) return auth;
  const [orderRes, itemsRes] = await Promise.all([
    db.query(`SELECT o.*, u.name as creator_name FROM orders o LEFT JOIN users u ON o.created_by = u.id WHERE o.id = $1`, [params.id]),
    db.query(`SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at`, [params.id]),
  ]);
  if (!orderRes.rows[0]) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: orderRes.rows[0], items: itemsRes.rows });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'order.approve');
  if (auth instanceof NextResponse) return auth;
  const { status } = await req.json();
  const res = await db.query(
    `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
    [status, params.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'orders', functionName: 'updateOrder', eventType: 'UPDATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] });
}
