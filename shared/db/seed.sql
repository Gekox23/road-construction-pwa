-- ================================================================
-- SUPERUSER SEED
-- Supabase SQL Editorban futtasd: migrate.sql UTÁN
-- Jelszó: Admin2026! (bcrypt cost 12)
-- FIX: valódi bcrypt hash – már nem placeholder
-- ================================================================

-- 1. Superuser létrehozása
INSERT INTO users (email, name, password_hash, active, must_change_password)
VALUES (
  'gekox1111@gmail.com',
  'Admin (Gekox)',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4AqH9pLDei',
  TRUE,
  FALSE
)
ON CONFLICT (email) DO NOTHING;

-- 2. Superusernek MINDEN jogosultság (ALL_PERMISSIONS listával szinkronban)
DO $$
DECLARE
  uid UUID;
  perms TEXT[] := ARRAY[
    'user.view', 'user.create', 'user.edit', 'user.delete', 'user.permission_grant',
    'machine.view', 'machine.create', 'machine.edit', 'machine.delete',
    'machine.transfer', 'machine.fuel_log', 'machine.hour_log',
    'site.view', 'site.view_own', 'site.create', 'site.edit', 'site.delete',
    'site.assign_machine', 'site.assign_leader', 'site.log_own',
    'order.view', 'order.create', 'order.approve', 'order.edit',
    'schedule.view', 'schedule.edit',
    'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.edit_any', 'workorder.close',
    'issue.view', 'issue.create', 'issue.resolve',
    'shelf.view', 'shelf.scan_out', 'shelf.scan_in', 'shelf.manage', 'shelf.export',
    'finance.view', 'finance.export',
    'notification.receive_service', 'notification.receive_order', 'notification.receive_issue',
    'audit.view'
  ];
  perm TEXT;
BEGIN
  SELECT id INTO uid FROM users WHERE email = 'gekox1111@gmail.com';
  FOREACH perm IN ARRAY perms LOOP
    INSERT INTO user_permissions (user_id, permission_key, granted)
    VALUES (uid, perm, TRUE)
    ON CONFLICT (user_id, permission_key) DO UPDATE SET granted = TRUE;
  END LOOP;
END $$;

-- 3. Sablon adatok (ha permission_templates üres)
INSERT INTO permission_templates (name, permissions)
VALUES
  ('Építésvezető', ARRAY[
    'order.create', 'order.view',
    'site.view_own',
    'schedule.view',
    'machine.view', 'machine.hour_log', 'machine.fuel_log',
    'site.log_own',
    'issue.create', 'issue.view',
    'workorder.view',
    'notification.receive_order'
  ]),
  ('Logisztikus', ARRAY[
    'order.view', 'order.approve', 'order.edit',
    'site.view', 'site.create', 'site.edit', 'site.assign_machine', 'site.assign_leader',
    'machine.view', 'machine.create', 'machine.edit', 'machine.transfer',
    'machine.hour_log', 'machine.fuel_log',
    'schedule.view', 'schedule.edit',
    'shelf.view', 'shelf.export',
    'notification.receive_order', 'notification.receive_issue'
  ]),
  ('Szervizes', ARRAY[
    'machine.view', 'machine.hour_log',
    'site.view',
    'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.close',
    'issue.view', 'issue.create', 'issue.resolve',
    'shelf.view', 'shelf.scan_out', 'shelf.scan_in',
    'schedule.view',
    'notification.receive_service', 'notification.receive_issue'
  ]),
  ('Gazdasági', ARRAY[
    'site.view', 'machine.view', 'order.view',
    'schedule.view',
    'workorder.view',
    'finance.view', 'finance.export',
    'shelf.view'
  ]),
  ('Teljes hozzáférés', ARRAY[
    'user.view', 'user.create', 'user.edit', 'user.delete', 'user.permission_grant',
    'machine.view', 'machine.create', 'machine.edit', 'machine.delete',
    'machine.transfer', 'machine.fuel_log', 'machine.hour_log',
    'site.view', 'site.view_own', 'site.create', 'site.edit', 'site.delete',
    'site.assign_machine', 'site.assign_leader', 'site.log_own',
    'order.view', 'order.create', 'order.approve', 'order.edit',
    'schedule.view', 'schedule.edit',
    'workorder.view', 'workorder.create', 'workorder.edit', 'workorder.edit_any', 'workorder.close',
    'issue.view', 'issue.create', 'issue.resolve',
    'shelf.view', 'shelf.scan_out', 'shelf.scan_in', 'shelf.manage', 'shelf.export',
    'finance.view', 'finance.export',
    'notification.receive_service', 'notification.receive_order', 'notification.receive_issue',
    'audit.view'
  ])
ON CONFLICT (name) DO NOTHING;
