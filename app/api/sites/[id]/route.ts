import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';
import { writeAuditLog } from '../../../../shared/utils/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'site.view');
  if (auth instanceof NextResponse) return auth;
  const res = await db.query(
    `SELECT s.*, u.name as leader_name FROM sites s LEFT JOIN users u ON s.leader_id = u.id WHERE s.id = $1`,
    [params.id]
  );
  if (!res.rows[0]) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: res.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'site.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `UPDATE sites SET name=$1, location=$2, leader_id=$3, status=$4, notes=$5, updated_at=NOW() WHERE id=$6 RETURNING *`,
    [body.name, body.location || null, body.leaderId || null, body.status || 'aktiv', body.notes || null, params.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'sites', functionName: 'updateSite', eventType: 'UPDATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] });
}
