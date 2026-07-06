import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../modules/auth/auth.middleware';
import db from '../../../shared/db/client';
import { writeAuditLog } from '../../../shared/utils/audit';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'site.view');
  if (auth instanceof NextResponse) return auth;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  let query = `SELECT s.*, u.name as leader_name FROM sites s LEFT JOIN users u ON s.leader_id = u.id WHERE 1=1`;
  const values: unknown[] = [];
  let idx = 1;
  if (status) { query += ` AND s.status=$${idx++}`; values.push(status); }
  query += ` ORDER BY s.created_at DESC`;
  const res = await db.query(query, values);
  return NextResponse.json({ data: res.rows });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req, 'site.create');
  if (auth instanceof NextResponse) return auth;
  const body = await req.json();
  const res = await db.query(
    `INSERT INTO sites (name, location, leader_id, notes, status) VALUES ($1,$2,$3,$4,'aktiv') RETURNING *`,
    [body.name, body.location || null, body.leaderId || null, body.notes || null]
  );
  await writeAuditLog({ userId: auth.user.id, module: 'sites', functionName: 'createSite', eventType: 'CREATE', newValue: res.rows[0] });
  return NextResponse.json({ data: res.rows[0] }, { status: 201 });
}
