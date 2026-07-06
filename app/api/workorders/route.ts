import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';
import { writeAuditLog } from '../../../shared/utils/audit';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'workorder.view');
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const machineId = searchParams.get('machineId');
  const status = searchParams.get('status');
  const limit = searchParams.get('limit');
  let query = `SELECT w.*, m.type as machine_type, m.machine_code FROM workorders w LEFT JOIN machines m ON w.machine_id = m.id WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;
  if (machineId) { query += ` AND w.machine_id=$${idx++}`; values.push(machineId); }
  if (status) { query += ` AND w.status=$${idx++}`; values.push(status); }
  query += ` ORDER BY w.event_date DESC`;
  if (limit) query += ` LIMIT ${parseInt(limit)}`;
  const res = await db.query(query, values);
  return NextResponse.json({ data: res.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'workorder.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `INSERT INTO workorders (machine_id, work_type, description, event_date, assigned_to, status, created_by)
     VALUES ($1,$2,$3,$4,$5,'uj',$6) RETURNING *`,
    [body.machineId || null, body.workType || null, body.description || null,
     body.eventDate, body.assignedTo || null, auth.user.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'workorders', functionName: 'createWorkorder', eventType: 'CREATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] }, { status: 201 });
}
