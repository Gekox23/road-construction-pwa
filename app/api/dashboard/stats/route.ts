import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../modules/auth/auth.middleware';
import db from '../../../../shared/db/client';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const [machines, sites, workorders, issues] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM machines WHERE status != 'archivalt'`),
      db.query(`SELECT COUNT(*) FROM sites WHERE status = 'aktiv'`),
      db.query(`SELECT COUNT(*) FROM workorders WHERE status IN ('uj','folyamatban')`),
      db.query(`SELECT COUNT(*) FROM issues WHERE status IN ('nyitott','folyamatban')`),
    ]);
    return NextResponse.json({
      data: {
        machines: parseInt(machines.rows[0].count),
        activeSites: parseInt(sites.rows[0].count),
        openWorkorders: parseInt(workorders.rows[0].count),
        openIssues: parseInt(issues.rows[0].count),
      },
    });
  } catch (err) {
    console.error('[dashboard.stats] Hiba:', err);
    return NextResponse.json({ error: 'Statisztika lekérdezés sikertelen' }, { status: 500 });
  }
}
