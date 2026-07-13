# CampuStatus

Sistema colaborativo de concurrencia para el campus universitario. Consultá la ocupación de bibliotecas, comedores y otros espacios, y enviá reportes anónimos con cooldown por zona.

**Stack:** Next.js 15 · React 19 · Prisma · PostgreSQL (Neon) · Tailwind CSS

**Producción:** [campu-status.vercel.app](https://campu-status.vercel.app)

---

## Requisitos

- Node.js 18+
- pnpm 8+

---

## Arrancar en local

```bash
pnpm install
pnpm approve-builds --all   # solo la primera vez (pnpm 10+)
cp .env.example .env          # pegá tu DATABASE_URL de Neon
pnpm db:migrate               # aplica migraciones en PostgreSQL
pnpm db:seed                  # datos iniciales (3 zonas)
pnpm dev                      # http://localhost:3000
```

Un solo comando levanta frontend y API en el mismo puerto.

---

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build de producción |
| `pnpm db:migrate` | Aplicar migraciones Prisma |
| `pnpm db:seed` | Cargar zonas y niveles iniciales |
| `pnpm db:reset` | Resetear DB y re-seed |
| `pnpm smoke` | Prueba de humo (lib + HTTP opcional) |
| `pnpm lint` | ESLint |

---

## Variables de entorno

```bash
DATABASE_URL=postgresql://...
ALLOWED_CAMPUS_IPS=172.23.1.78,172.25.9.160
TRUST_PROXY=false   # true en Vercel
```

---

## Deploy en Vercel

El build en Vercel corre migraciones y seed automáticamente (`vercel-build`). Solo tenés que conectar la base de datos:

1. En [vercel.com](https://vercel.com) → proyecto **CampuStatus** → **Storage** → **Create Database** → **Neon**
2. En **Settings → Environment Variables**, agregá:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Connection string de Neon (se puede auto-vincular al crear la DB) |
| `ALLOWED_CAMPUS_IPS` | `172.23.1.78,172.25.9.160` |
| `TRUST_PROXY` | `true` |

3. **Deployments → Redeploy**

Verificá: `curl https://campu-status.vercel.app/api/zones`

---

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/zones` | Listar zonas |
| `GET` | `/api/zones/:id` | Detalle de zona |
| `POST` | `/api/zones/:id/vote` | Registrar reporte (requiere IP de campus) |

---

## Estructura

```
src/
├── app/              # App Router (páginas + Route Handlers)
├── components/       # UI React
├── hooks/            # useCooldown, useLiveTime
├── lib/              # Prisma, lógica de zonas, IP check
├── data/             # Metadatos estáticos de UI
└── utils/            # mapZone, themeTransition, etc.
prisma/
├── schema.prisma
└── seed.ts
```

---

## Documentación relacionada

- [`API.md`](./API.md) — referencia REST para integrar desde otra app
- [`MIGRATION.md`](./MIGRATION.md) — plan y estado de la migración
- [`PLAN.md`](./PLAN.md) — hoja de ruta original del MVP
