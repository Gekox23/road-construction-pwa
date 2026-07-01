# Vezénylő Rendszer – PWA

PWA-alapú mobil-first leltározó és vezénylési rendszer útbuildési/mélyépítési vállalat számára.

## Tech Stack
- **Frontend:** Next.js 14+ (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes
- **Adatbázis:** PostgreSQL (Supabase vagy self-hosted)
- **Auth:** JWT HttpOnly cookie, 1 éves session

## Gyors indítás

```bash
# 1. Függőségek
npm install

# 2. Környezeti változók
cp .env.example .env.local
# Töltsd ki: DATABASE_URL, JWT_SECRET, SUPERUSER_PASSWORD

# 3. Adatbázis létrehozás
psql $DATABASE_URL -f shared/db/migrate.sql

# 4. Superuser seed
npx ts-node shared/db/seed.ts

# 5. Fejlesztési szerver
npm run dev
```

## Superuser
- Email: `gekox1111@gmail.com`
- Jelszó: környezeti változóból (`SUPERUSER_PASSWORD`)

## Modulok
| Modul | Útvonal | Leírás |
|---|---|---|
| Auth | `/login` | Bejelentkezés, session |
| Gépek | `/machines` | Gép CRUD, üzemóra, tankolás |
| Építkezések | `/sites` | Helyszínek kezelése |
| Vezénylés | `/schedule` | Heti beütemezés |
| Munkalapok | `/workorders` | Szerviz feladatok |
| Hibabejel. | `/issues` | Hibák, fotókkal |
| Polcrendszer | `/shelf` | QR ki/be szkennelés |
| Megrendelések | `/orders` | Kosár alapú rendelés |
| Pénzügy | `/finance` | Riportok, összesítők |
| Admin | `/admin/users` | Felhasználókezelés, jogosultságok |

## Jogosultságok
Hibrid RBAC+PBAC modell. Sablonok: Építésvezető, Logisztikus, Szervizes, Gazdasági, Teljes hozzáférés.
