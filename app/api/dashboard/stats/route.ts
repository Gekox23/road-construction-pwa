import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req, 'dashboard.view');
  if (auth instanceof NextResponse) return auth;

  const [machines, sites, issues, workorders, orders] = await Promise.all([
    db.query(`SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status='aktiv') as aktiv,
      COUNT(*) FILTER (WHERE status='szervizen') as szervizen
      FROM machines`),
    db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='aktiv') as aktiv FROM sites`),
    db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='nyitott') as nyitott FROM issues`),
    db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status IN ('uj','folyamatban')) as aktiv FROM workorders`),
    db.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='fuggoben') as fuggoben FROM orders`),
  ]);

  return NextResponse.json({
    machines: machines.rows[0],
    sites: sites.rows[0],
    issues: issues.rows[0],
    workorders: workorders.rows[0],
    orders: orders.rows[0],
  });
}
