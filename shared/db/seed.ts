/**
 * Superuser seed script
 * Futtatás: npx ts-node shared/db/seed.ts
 * Vagy Supabase SQL Editorban futtasd a shared/db/seed.sql fájlt
 */
import bcrypt from 'bcryptjs';
import db from './client';

async function seed() {
  const email = 'gekox1111@gmail.com';
  const name = 'Admin (Gekox)';
  const password = process.env.SUPERUSER_PASSWORD || 'Admin2026!';

  const hash = await bcrypt.hash(password, 12);

  await db.query(
    `INSERT INTO users (email, name, password_hash, active, must_change_password)
     VALUES ($1, $2, $3, TRUE, FALSE)
     ON CONFLICT (email) DO UPDATE SET password_hash = $3, active = TRUE`,
    [email, name, hash]
  );

  const user = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  const userId = user.rows[0].id;

  const allPerms = [
    'schedule.view','schedule.edit',
    'machine.view','machine.create','machine.edit','machine.hour_log','machine.fuel_log',
    'site.view','site.view_own','site.create','site.edit',
    'workorder.view','workorder.create','workorder.edit',
    'issue.view','issue.create','issue.resolve',
    'order.view','order.create','order.approve',
    'shelf.view','shelf.scan_out','shelf.scan_in','shelf.manage',
    'finance.view',
    'user.view','user.create','user.edit','user.permission_grant',
  ];

  for (const perm of allPerms) {
    await db.query(
      `INSERT INTO user_permissions (user_id, permission_key, granted)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (user_id, permission_key) DO NOTHING`,
      [userId, perm]
    );
  }

  console.log(`✅ Superuser létrehozva: ${email}`);
  console.log(`✅ ${allPerms.length} jogosultság beállítva`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed hiba:', err);
  process.exit(1);
});
