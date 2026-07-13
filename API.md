# API.md — CampuStatus REST API

Documentación para integrar CampuStatus desde otra aplicación (web, móvil, backend, scripts).

---

## Base URL

| Entorno | URL |
|---|---|
| Desarrollo local | `http://localhost:3000` |
| Producción | `https://campu-status.vercel.app` |

Todas las rutas son relativas a esa base. Ejemplo: `GET /api/zones` → `https://campu-status.vercel.app/api/zones`.

**Formato:** JSON en request y response.  
**Charset:** UTF-8.  
**Content-Type recomendado en POST:** `application/json`.

---

## Autenticación

No hay tokens, API keys ni sesiones.

| Operación | Restricción |
|---|---|
| Lectura (`GET`) | Pública, sin autenticación |
| Escritura (`POST /vote`) | Solo desde IPs del Wi-Fi del campus |

La validación de red se configura en el servidor con `ALLOWED_CAMPUS_IPS` (ver [Seguridad de red](#seguridad-de-red)).

---

## Endpoints

### Resumen

| Método | Ruta | Auth IP | Descripción |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check del servicio |
| `GET` | `/api/me/ip` | No | IP detectada y si puede votar (diagnóstico) |
| `GET` | `/api/zones` | No | Listar todas las zonas activas |
| `GET` | `/api/zones/:id` | No | Detalle de una zona |
| `POST` | `/api/zones/:id/vote` | Sí | Registrar un reporte de ocupación |

---

### `GET /api/health`

Verifica que el servicio esté en línea.

**Respuesta `200 OK`**

```json
{
  "ok": true,
  "service": "campustatus",
  "timestamp": "2026-07-12T23:00:00.000Z"
}
```

---

### `GET /api/zones`

Devuelve el estado actual de todas las zonas activas.

**Respuesta `200 OK`**

```json
{
  "zones": [
    {
      "id": "biblioteca",
      "name": "Biblioteca Central",
      "status": "Verde",
      "capacity": "Baja",
      "occupancy": 22,
      "lastUpdate": "14:20",
      "trend": [22, 18, 25, 30, 28, 35, 32, 26],
      "voteCount": 5
    },
    {
      "id": "buffet",
      "name": "Buffet Facultad",
      "status": "Amarillo",
      "capacity": "Moderada",
      "occupancy": 65,
      "lastUpdate": "14:22",
      "trend": [40, 45, 52, 60, 58, 65, 70, 62],
      "voteCount": 12
    },
    {
      "id": "carritos",
      "name": "Carritos de Comida",
      "status": "Rojo",
      "capacity": "Alta",
      "occupancy": 91,
      "lastUpdate": "14:15",
      "trend": [55, 62, 70, 78, 85, 90, 95, 92],
      "voteCount": 8
    }
  ]
}
```

---

### `GET /api/zones/:id`

Devuelve el detalle de una zona por su slug.

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Slug de la zona: `biblioteca`, `buffet`, `carritos` |

**Respuesta `200 OK`**

```json
{
  "zone": {
    "id": "biblioteca",
    "name": "Biblioteca Central",
    "status": "Verde",
    "capacity": "Baja",
    "occupancy": 22,
    "lastUpdate": "14:20",
    "trend": [22, 18, 25, 30, 28, 35, 32, 26],
    "voteCount": 5
  }
}
```

**Respuesta `404 Not Found`**

```json
{
  "error": "Zona no encontrada."
}
```

---

### `POST /api/zones/:id/vote`

Registra un reporte anónimo de ocupación. **Requiere estar conectado al Wi-Fi del campus.**

**Parámetros de ruta**

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Slug de la zona |

**Request body**

```json
{
  "levelId": "moderado"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `levelId` | `string` | Sí | Nivel de ocupación reportado (ver tabla abajo) |

**Niveles válidos (`levelId`)**

| `levelId` | Label | Estado resultante | Ocupación asignada |
|---|---|---|---|
| `vacio` | Vacío | Verde | 12% |
| `poco` | Poco concurrido | Verde | 28% |
| `moderado` | Moderado | Amarillo | 58% |
| `lleno` | Lleno | Rojo | 82% |
| `saturado` | Saturado | Rojo | 95% |

**Respuesta `201 Created`**

```json
{
  "zone": {
    "id": "biblioteca",
    "name": "Biblioteca Central",
    "status": "Amarillo",
    "capacity": "Moderada",
    "occupancy": 58,
    "lastUpdate": "17:35",
    "trend": [22, 18, 25, 30, 28, 35, 32, 58],
    "voteCount": 6
  },
  "acceptedLevel": {
    "id": "moderado",
    "label": "Moderado",
    "status": "Amarillo"
  }
}
```

**Errores**

| Código | Causa | Body |
|---|---|---|
| `400` | JSON inválido | `{ "error": "Cuerpo JSON inválido." }` |
| `400` | `levelId` inválido | `{ "error": "Nivel de ocupación inválido.", "allowedLevels": ["vacio", "poco", "moderado", "lleno", "saturado"] }` |
| `403` | IP fuera del campus | `{ "error": "Acceso denegado. No estás en el Wi-Fi del campus.", "code": "CAMPUS_NETWORK_REQUIRED" }` |
| `404` | Zona inexistente | `{ "error": "Zona no encontrada." }` |

---

## Modelo de datos

### Objeto `Zone`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Slug único de la zona (`biblioteca`, `buffet`, `carritos`) |
| `name` | `string` | Nombre visible |
| `status` | `string` | `Verde` \| `Amarillo` \| `Rojo` |
| `capacity` | `string` | `Baja` \| `Moderada` \| `Alta` |
| `occupancy` | `number` | Porcentaje de ocupación (0–100) |
| `lastUpdate` | `string` | Hora del último reporte en formato `HH:MM` (hora local del servidor) |
| `trend` | `number[]` | Últimos 8 valores de ocupación (más antiguo → más reciente) |
| `voteCount` | `number` | Cantidad acumulada de reportes |

### Objeto `AcceptedLevel`

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Mismo valor que `levelId` enviado |
| `label` | `string` | Etiqueta legible del nivel |
| `status` | `string` | Color de estado: `Verde`, `Amarillo` o `Rojo` |

### Reglas de negocio

- **El último reporte reemplaza el estado actual** de la zona; no se promedian votos anteriores.
- El `status` y `capacity` se derivan del score del nivel reportado:
  - Score ≤ 34 → Verde / Baja
  - Score ≤ 67 → Amarillo / Moderada
  - Score > 67 → Rojo / Alta
- Los reportes son **100% anónimos** (no hay usuarios ni tokens).

---

## Seguridad de red

El endpoint `POST /api/zones/:id/vote` valida la IP del cliente contra `ALLOWED_CAMPUS_IPS`.

**Configuración del servidor (`.env`)**

```env
# IPs públicas del Wi-Fi del campus
ALLOWED_CAMPUS_IPS=172.23.1.78,172.25.9.160

# true en producción detrás de reverse proxy (Vercel, nginx, etc.)
TRUST_PROXY=false
```

| Variable | Descripción |
|---|---|
| `ALLOWED_CAMPUS_IPS` | Lista separada por comas de IPs permitidas para votar |
| `TRUST_PROXY` | Si es `true`, lee la IP real desde `X-Forwarded-For` / `X-Real-IP` |

**Para desarrollo local sin restricción**, usar:

```env
ALLOWED_CAMPUS_IPS=127.0.0.1,::1,localhost
```

---

## Integración desde otra aplicación

### JavaScript / TypeScript

```typescript
const API_BASE = process.env.CAMPUSSTATUS_URL ?? 'https://campu-status.vercel.app';

export class CampusStatusApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'CampusStatusApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new CampusStatusApiError(
      body.error ?? `Error ${response.status}`,
      response.status,
      body.code
    );
  }

  return body as T;
}

// Listar zonas
export function fetchZones() {
  return request<{ zones: Zone[] }>('/api/zones');
}

// Detalle de zona
export function fetchZone(id: string) {
  return request<{ zone: Zone }>(`/api/zones/${id}`);
}

// Registrar reporte
export function submitVote(zoneId: string, levelId: string) {
  return request<{ zone: Zone; acceptedLevel: AcceptedLevel }>(
    `/api/zones/${zoneId}/vote`,
    { method: 'POST', body: JSON.stringify({ levelId }) }
  );
}

// Tipos
type Zone = {
  id: string;
  name: string;
  status: string;
  capacity: string;
  occupancy: number;
  lastUpdate: string;
  trend: number[];
  voteCount: number;
};

type AcceptedLevel = {
  id: string;
  label: string;
  status: string;
};
```

### Python

```python
import requests

API_BASE = "https://campu-status.vercel.app"

def fetch_zones():
    response = requests.get(f"{API_BASE}/api/zones", timeout=10)
    response.raise_for_status()
    return response.json()["zones"]

def fetch_zone(zone_id: str):
    response = requests.get(f"{API_BASE}/api/zones/{zone_id}", timeout=10)
    response.raise_for_status()
    return response.json()["zone"]

def submit_vote(zone_id: str, level_id: str):
    response = requests.post(
        f"{API_BASE}/api/zones/{zone_id}/vote",
        json={"levelId": level_id},
        timeout=10,
    )
    if response.status_code == 403:
        data = response.json()
        raise PermissionError(data.get("code", "CAMPUS_NETWORK_REQUIRED"))
    response.raise_for_status()
    return response.json()
```

### cURL

```bash
# Health check
curl -s https://campu-status.vercel.app/api/health | jq

# Listar zonas
curl -s https://campu-status.vercel.app/api/zones | jq

# Detalle de una zona
curl -s https://campu-status.vercel.app/api/zones/biblioteca | jq

# Registrar reporte (requiere IP del campus)
curl -s -X POST https://campu-status.vercel.app/api/zones/biblioteca/vote \
  -H "Content-Type: application/json" \
  -d '{"levelId":"moderado"}' | jq
```

---

## CORS e integración cross-origin

Por defecto, la API **no incluye headers CORS**. Esto significa:

| Escenario | ¿Funciona? |
|---|---|
| Llamada server-side (Node, Python, PHP, etc.) | Sí |
| Mismo dominio que CampuStatus | Sí |
| Frontend en otro dominio llamando directo al browser | No (bloqueado por CORS) |

**Opciones si tu app está en otro dominio:**

1. **Proxy en tu backend** — tu servidor llama a CampuStatus y expone sus propios endpoints.
2. **Agregar CORS en CampuStatus** — configurar headers `Access-Control-Allow-Origin` en Next.js.

---

## Manejo de errores recomendado

```typescript
try {
  await submitVote('biblioteca', 'moderado');
} catch (error) {
  if (error instanceof CampusStatusApiError) {
    switch (error.status) {
      case 403:
        // Usuario fuera del Wi-Fi del campus
        // error.code === 'CAMPUS_NETWORK_REQUIRED'
        break;
      case 400:
        // levelId inválido
        break;
      case 404:
        // Zona no existe
        break;
      default:
        // Error de servidor
        break;
    }
  }
}
```

---

## Zonas disponibles (seed inicial)

| `id` | `name` |
|---|---|
| `biblioteca` | Biblioteca Central |
| `buffet` | Buffet Facultad |
| `carritos` | Carritos de Comida |

---

## Referencias

- [`README.md`](./README.md) — cómo arrancar el proyecto
- [`MIGRATION.md`](./MIGRATION.md) — arquitectura y stack
- Implementación: `src/app/api/` (Route Handlers de Next.js)
