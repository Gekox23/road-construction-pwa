import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';
import { writeAuditLog } from '../../../../shared/utils/audit';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'workorder.view');
  if (auth instanceof NextResponse) return auth;
  const res = await db.query(
    `SELECT w.*, m.type as machine_type, m.machine_code, u.name as assigned_name
     FROM workorders w
     LEFT JOIN machines m ON w.machine_id = m.id
     LEFT JOIN users u ON w.assigned_to = u.id
     WHERE w.id = $1`,
    [params.id]
  );
  if (!res.rows[0]) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json({ data: res.rows[0] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req, 'workorder.edit');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (body.status !== undefined) { fields.push(`status=$${idx++}`); values.push(body.status); }
  if (body.description !== undefined) { fields.push(`description=$${idx++}`); values.push(body.description); }
  if (body.assignedTo !== undefined) { fields.push(`assigned_to=$${idx++}`); values.push(body.assignedTo); }
  fields.push(`updated_at=NOW()`);
  values.push(params.id);
  const res = await db.query(
    `UPDATE workorders SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`,
    values
  );
  await writeAuditLog({ userId: auth.user.id, module: 'workorders', functionName: 'updateWorkorder', eventType: 'UPDATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] });
}
