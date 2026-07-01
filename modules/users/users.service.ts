import db from '../../shared/db/client';
import bcrypt from 'bcryptjs';
import { writeAuditLog } from '../../shared/utils/audit';
import { isSuperUser } from '../auth/auth.service';
import type { Permission } from '../../shared/types';
import type { UserRow, UserPermissionRow, PermissionTemplateRow } from '../../shared/types/db-rows';

export async function listUsers(): Promise<UserRow[]> {
  try {
    const res = await db.query<UserRow>(
      `SELECT id, email, name, active, last_login_at, created_at FROM users ORDER BY name`
    );
    return res.rows;
  } catch (err) {
    console.error('[users.listUsers] Hiba:', err);
    return [];
  }
}

export async function getUserWithPermissions(id: string) {
  try {
    const [user, perms] = await Promise.all([
      db.query<UserRow>('SELECT id, email, name, active, last_login_at FROM users WHERE id = $1', [id]),
      db.query<UserPermissionRow>('SELECT permission_key, granted FROM user_permissions WHERE user_id = $1', [id]),
    ]);
    return { ...user.rows[0], permissions: perms.rows };
  } catch (err) {
    console.error('[users.getUserWithPermissions] Hiba:', err);
    return null;
  }
}

export async function createUser(data: { email: string; name: string; password: string; templateName?: string }, actorId: string): Promise<UserRow> {
  try {
    const hash = await bcrypt.hash(data.password, 12);
    const res = await db.query<UserRow>(
      `INSERT INTO users (email, name, password_hash, active, must_change_password)
       VALUES ($1, $2, $3, TRUE, TRUE) RETURNING id, email, name`,
      [data.email.toLowerCase().trim(), data.name, hash]
    );
    const userId = res.rows[0].id;

    if (data.templateName) {
      const tpl = await db.query<PermissionTemplateRow>('SELECT permissions FROM permission_templates WHERE name = $1', [data.templateName]);
      if (tpl.rows[0]) {
        for (const perm of tpl.rows[0].permissions as Permission[]) {
          await db.query(
            `INSERT INTO user_permissions (user_id, permission_key, granted) VALUES ($1, $2, TRUE) ON CONFLICT DO NOTHING`,
            [userId, perm]
          );
        }
      }
    }

    await writeAuditLog({ userId: actorId, module: 'users', functionName: 'createUser', eventType: 'CREATE', newValue: { email: data.email, name: data.name } });
    return res.rows[0];
  } catch (err) {
    console.error('[users.createUser] Hiba:', err);
    throw err;
  }
}

export async function setPermission(targetUserId: string, permissionKey: Permission, granted: boolean, actorId: string): Promise<void> {
  try {
    const targetUser = await db.query<UserRow>('SELECT email FROM users WHERE id = $1', [targetUserId]);
    if (targetUser.rows[0] && isSuperUser(targetUser.rows[0].email)) {
      throw new Error('[users.setPermission] Superuser jogosultságai nem módosíthatók');
    }
    await db.query(
      `INSERT INTO user_permissions (user_id, permission_key, granted)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, permission_key) DO UPDATE SET granted = $3`,
      [targetUserId, permissionKey, granted]
    );
    await writeAuditLog({ userId: actorId, module: 'users', functionName: 'setPermission', eventType: 'PERMISSION_CHANGE', newValue: { targetUserId, permissionKey, granted } });
  } catch (err) {
    console.error('[users.setPermission] Hiba:', err);
    throw err;
  }
}

export async function listTemplates(): Promise<PermissionTemplateRow[]> {
  const res = await db.query<PermissionTemplateRow>('SELECT * FROM permission_templates ORDER BY name');
  return res.rows;
}
