import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';
import { writeAuditLog } from '../../../shared/utils/audit';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'issue.view');
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const machineId = searchParams.get('machineId');
  const siteId = searchParams.get('siteId');
  const status = searchParams.get('status');
  let query = `SELECT i.*, m.type as machine_type, s.name as site_name FROM issues i
    LEFT JOIN machines m ON i.machine_id = m.id LEFT JOIN sites s ON i.site_id = s.id WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;
  if (machineId) { query += ` AND i.machine_id=$${idx++}`; values.push(machineId); }
  if (siteId) { query += ` AND i.site_id=$${idx++}`; values.push(siteId); }
  if (status) { query += ` AND i.status=$${idx++}`; values.push(status); }
  query += ` ORDER BY i.event_date DESC`;
  const res = await db.query(query, values);
  return NextResponse.json({ data: res.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'issue.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `INSERT INTO issues (machine_id, site_id, description, event_date, reported_by, status)
     VALUES ($1,$2,$3,$4,$5,'nyitott') RETURNING *`,
    [body.machineId || null, body.siteId || null, body.description,
     body.eventDate, auth.user.id]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'issues', functionName: 'createIssue', eventType: 'CREATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] }, { status: 201 });
}
