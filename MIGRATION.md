# MIGRATION.md — CampusStatus: Vite + Express → Next.js + Prisma

Documento de referencia para la migración del stack tecnológico de CampusStatus.

---

## Resumen ejecutivo

| Aspecto | Antes (MVP) | Después (objetivo) |
|---|---|---|
| Frontend | React 19 + Vite | Next.js 15 (App Router) |
| Backend | Express 5 (carpeta `server/`) | Route Handlers en `src/app/api/` |
| Persistencia | `Map` en memoria | SQLite (dev) / PostgreSQL (prod) vía Prisma |
| Deploy | 2 servicios (Vercel + Railway) | 1 servicio (Vercel) |
| CORS / proxy | Vite proxy + CORS manual | Innecesario (mismo origen) |

---

## Estado de la migración

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Documentación (`MIGRATION.md`) | ✅ Completada |
| 1 | Scaffold Next.js + Prisma en raíz | ✅ Completada |
| 2 | Schema, seed y capa `lib/zones.ts` | ✅ Completada |
| 3 | Route Handlers (`/api/zones`, vote, health) | ✅ Completada |
| 4 | Migración de componentes UI | ✅ Completada |
| 5 | Scripts, env, smoke test y build | ✅ Completada |
| 6 | Deprecar `campus-status/` y `server/` | ✅ Completada |

---

## Arquitectura objetivo

```mermaid
flowchart TB
    subgraph cliente [Cliente — Browser]
        UI[React Client Components]
        LS[localStorage — cooldown por zona]
    end

    subgraph next [Next.js — src/]
        PAGE[app/page.tsx]
        RH[Route Handlers /api/*]
        LIB[lib/zones.ts + lib/ip.ts]
        PR[Prisma Client]
    end

    subgraph db [Base de datos]
        SQL[(SQLite / PostgreSQL)]
    end

    UI -->|fetch /api/*| RH
    PAGE --> UI
    RH --> LIB
    LIB --> PR
    PR --> SQL
    UI --> LS
```

### Estructura de carpetas

```
campustatus/
├── MIGRATION.md              ← este documento
├── PLAN.md                     ← hoja de ruta original del MVP
├── package.json                ← monolito Next.js
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── favicon.svg
├── scripts/
│   └── smoke.ts                ← prueba de humo de la API
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx            ← Dashboard (Client Component)
│   │   ├── globals.css
│   │   └── api/
│   │       ├── health/route.ts
│   │       └── zones/
│   │           ├── route.ts              GET /api/zones
│   │           └── [id]/
│   │               ├── route.ts          GET /api/zones/:id
│   │               └── vote/route.ts     POST /api/zones/:id/vote
│   ├── components/             ← migrados desde campus-status/src/components/
│   ├── hooks/
│   ├── lib/
│   │   ├── prisma.ts           ← singleton Prisma Client
│   │   ├── zones.ts            ← lógica de negocio (ex store.js)
│   │   ├── ip.ts               ← verificación de red campus
│   │   └── constants.ts        ← REPORT_LEVELS, STATUS_BY_SCORE
│   ├── data/
│   │   └── zoneMetadata.ts     ← iconos, categorías (solo UI)
│   └── utils/
```

---

## Modelo de datos (Prisma)

```mermaid
erDiagram
    Zone ||--o{ Report : recibe
    ReportLevel ||--o{ Report : clasifica
    Zone ||--o{ TrendPoint : historial

    Zone {
        string id PK
        string slug UK "biblioteca, buffet, carritos"
        string name
        string status "Verde | Amarillo | Rojo"
        string capacity "Baja | Moderada | Alta"
        int occupancy
        int voteCount
        datetime lastUpdate
        boolean active
    }

    ReportLevel {
        string id PK "vacio, poco, moderado, lleno, saturado"
        string label
        string statusColor
        int score
        int sortOrder
    }

    Report {
        string id PK
        string zoneId FK
        string levelId FK
        string clientIp "auditoría opcional"
        datetime createdAt
    }

    TrendPoint {
        string id PK
        string zoneId FK
        int score
        datetime recordedAt
    }

    AllowedCampusIp {
        string id PK
        string ipAddress UK
        string description
        boolean active
    }
```

### Compatibilidad con la API anterior

La API expone `slug` como `id` en las respuestas JSON para no romper el frontend:

```json
{
  "id": "biblioteca",
  "name": "Biblioteca Central",
  "status": "Verde",
  "occupancy": 22,
  "trend": [22, 18, 25, 30, 28, 35, 32, 26],
  "voteCount": 5,
  "lastUpdate": "14:20"
}
```

---

## Mapeo Express → Next.js

| Express (`server/src/app.js`) | Next.js |
|---|---|
| `GET /health` | `src/app/api/health/route.ts` |
| `GET /api/zones` | `src/app/api/zones/route.ts` |
| `GET /api/zones/:id` | `src/app/api/zones/[id]/route.ts` |
| `POST /api/zones/:id/vote` | `src/app/api/zones/[id]/vote/route.ts` |
| `verifyCampusNetwork` middleware | `src/lib/ip.ts` (llamado en el handler de vote) |
| `store.js` | `src/lib/zones.ts` + Prisma |

---

## Variables de entorno

```bash
# .env
DATABASE_URL="file:./dev.db"          # SQLite en desarrollo
# DATABASE_URL="postgresql://..."     # PostgreSQL en producción

ALLOWED_CAMPUS_IPS=127.0.0.1,::1,localhost
TRUST_PROXY=false                     # true en Vercel/producción
```

En producción (Vercel + Neon/Supabase):

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
ALLOWED_CAMPUS_IPS=203.0.113.50       # IP pública del campus
TRUST_PROXY=true
```

---

## Arrancar en local

```bash
pnpm install
pnpm approve-builds --all   # solo la primera vez (pnpm 10+)
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev                    # http://localhost:3000
```

---

## Qué se reutiliza del código anterior

| Archivo legacy | Destino | Cambios |
|---|---|---|
| `campus-status/src/components/*` | `src/components/*` | Añadir `'use client'` donde haga falta |
| `campus-status/src/hooks/*` | `src/hooks/*` | Sin cambios de lógica |
| `campus-status/src/utils/*` | `src/utils/*` | Renombrar a `.ts` |
| `campus-status/src/data/mockZones.js` | `src/data/zoneMetadata.ts` | Solo metadatos UI |
| `campus-status/src/api/zones.js` | `src/lib/api.ts` | Rutas relativas `/api/...` |
| `server/src/store.js` | `src/lib/zones.ts` | Queries Prisma |
| `server/src/app.js` (IP check) | `src/lib/ip.ts` | Adaptado a `NextRequest` |
| `campus-status/tailwind.config.js` | `tailwind.config.ts` | Paths de content actualizados |
| `campus-status/src/index.css` | `src/app/globals.css` | Sin cambios |

---

## Decisiones tomadas

1. **TypeScript** — tipos de Prisma Client end-to-end.
2. **Route Handlers** — mantienen contrato JSON idéntico al Express anterior.
3. **SQLite en dev, PostgreSQL en prod** — cambiar solo `provider` en schema y `DATABASE_URL`.
4. **Slug como ID público** — Prisma usa `cuid` internamente; la API expone `slug`.
5. **Historial de votos** — cada voto se persiste en `Report` + `TrendPoint` desde el inicio.
6. **Cooldown en cliente** — sigue en `localStorage` (sin cambio de comportamiento del MVP).
7. **Reemplazo en raíz** — nuevo monolito en la raíz; carpetas legacy se conservan hasta validar.

---

## Checklist de validación post-migración

- [x] `pnpm dev` arranca en `http://localhost:3000`
- [x] `GET /api/zones` devuelve las 3 zonas seed
- [x] `POST /api/zones/biblioteca/vote` actualiza estado y persiste en DB
- [x] Reiniciar servidor mantiene los datos
- [x] UI muestra tarjetas, filtros, modales y tema claro/oscuro
- [x] Voto desde IP no permitida responde `403 CAMPUS_NETWORK_REQUIRED` (con `TRUST_PROXY=true` y IP externa)
- [x] Modal de error de red se muestra correctamente
- [x] `pnpm build` compila sin errores
- [x] `pnpm smoke` pasa todas las pruebas (capa lib; HTTP con servidor corriendo)

---

## Deprecación de carpetas legacy

Las carpetas `campus-status/` (Vite) y `server/` (Express) fueron **eliminadas** tras validar el nuevo stack.

Si necesitás consultar el código anterior, revisá el historial de git anterior a la migración.

---

## Referencias

- [Next.js App Router — Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma — Getting Started](https://www.prisma.io/docs/getting-started)
- [PLAN.md](./PLAN.md) — hoja de ruta del proyecto
