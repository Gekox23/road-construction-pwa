-- Road Construction PWA – Teljes adatbázis séma
-- Futtatás: psql $DATABASE_URL -f shared/db/migrate.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- FELHASZNÁLÓK
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- JOGOSULTSÁG SABLONOK
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- USER JOGOSULTSÁGOK (hibrid RBAC+PBAC)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

-- GÉPEK
CREATE TABLE IF NOT EXISTS machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  year INTEGER,
  status TEXT NOT NULL DEFAULT 'raktaron' CHECK (status IN ('raktaron','epitkezesen','szervizben','atadasalatt','archivalt')),
  current_site_id UUID,
  current_operator_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GÉP ÜZEMÓRA LOG
CREATE TABLE IF NOT EXISTS machine_hour_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  hour_value NUMERIC(10,1) NOT NULL,
  photo_url TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_machine_hour_logs_machine_event ON machine_hour_logs(machine_id, event_date);

-- TANKOLÁS LOG
CREATE TABLE IF NOT EXISTS machine_fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  liters NUMERIC(8,2) NOT NULL,
  location TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_machine_fuel_logs_machine_event ON machine_fuel_logs(machine_id, event_date);

-- ÉPÍTKEZÉSEK
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  leader_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','lezart','archivalt')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GÉP-ÉPÍTKEZÉS HOZZÁRENDELÉS
CREATE TABLE IF NOT EXISTS site_machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  hour_on_arrival NUMERIC(10,1),
  hour_on_removal NUMERIC(10,1),
  docs_complete BOOLEAN NOT NULL DEFAULT FALSE
);

-- FELHASZNÁLÓ-ÉPÍTKEZÉS HOZZÁRENDELÉS
CREATE TABLE IF NOT EXISTS site_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(site_id, user_id)
);

-- MEGRENDELÉSEK
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'fuggoben' CHECK (status IN ('fuggoben','jovahagyva','elutasitva','teljesitve')),
  notes TEXT,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT,
  unknown_item BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);

-- HETI VEZÉNYLÉS
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  site_id UUID REFERENCES sites(id),
  machine_id UUID REFERENCES machines(id),
  operator_id UUID REFERENCES users(id),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 7),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_schedule_week ON schedule_entries(week_start);

-- MUNKALAPOK
CREATE TABLE IF NOT EXISTS workorders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  issue_id UUID,
  work_type TEXT,
  description TEXT,
  work_start TIMESTAMPTZ,
  work_end TIMESTAMPTZ,
  event_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'uj' CHECK (status IN ('uj','folyamatban','befejezve','lezarva')),
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workorders_event_date ON workorders(event_date);
CREATE INDEX IF NOT EXISTS idx_workorders_machine ON workorders(machine_id);

-- HIBABEJELENTÉSEK
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  machine_id UUID REFERENCES machines(id),
  site_id UUID REFERENCES sites(id),
  description TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'nyitott' CHECK (status IN ('nyitott','folyamatban','megoldott')),
  reported_by UUID NOT NULL REFERENCES users(id),
  resolved_by UUID REFERENCES users(id),
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- POLCRENDSZER
CREATE TABLE IF NOT EXISTS shelf_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('egyedi','foyoeszkoz')),
  quantity_percent INTEGER CHECK (quantity_percent BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'polcon' CHECK (status IN ('polcon','kiveve','archivalt')),
  current_holder_id UUID REFERENCES users(id),
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shelf_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelf_item_id UUID NOT NULL REFERENCES shelf_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('ki','be')),
  user_id UUID NOT NULL REFERENCES users(id),
  quantity_before INTEGER,
  quantity_after INTEGER,
  notes TEXT,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shelf_movements_item ON shelf_movements(shelf_item_id);

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  module TEXT NOT NULL,
  function_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- GÉPTÍPUS AUTOCOMPLETE INDEX
CREATE INDEX IF NOT EXISTS idx_machines_type_trgm ON machines USING gin(type gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_machines_code_trgm ON machines USING gin(machine_code gin_trgm_ops);
