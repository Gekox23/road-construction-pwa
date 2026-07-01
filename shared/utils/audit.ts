import db from '../db/client';

interface AuditParams {
  userId: string | null;
  module: string;
  functionName: string;
  eventType: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, module, function_name, event_type, old_value, new_value, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.userId,
        params.module,
        params.functionName,
        params.eventType,
        params.oldValue ? JSON.stringify(params.oldValue) : null,
        params.newValue ? JSON.stringify(params.newValue) : null,
        params.ipAddress || null,
      ]
    );
  } catch (err) {
    console.error(`[audit.writeAuditLog] Naplózás sikertelen:`, err);
  }
}
