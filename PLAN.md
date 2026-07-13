# PLAN.md — Plan de Ejecución de Proyecto

## CampusStatus: Sistema Colaborativo de Concurrencia con Validación de Red Local

Este documento contiene la hoja de ruta estructurada para el desarrollo e implementación de CampusStatus, diseñado con un enfoque pragmático para el entorno universitario.

> **Stack actual (2026):** Next.js 15 + Prisma + SQLite/PostgreSQL.  
> Ver [`README.md`](./README.md) para arrancar el proyecto y [`MIGRATION.md`](./MIGRATION.md) para el historial de migración desde Vite + Express.

---

## Boceto de referencia

El diseño de la interfaz debe seguir el wireframe definido en [`preview.png`](./preview.png):

![Boceto de referencia de CampusStatus](./preview.png)

### Estructura del layout

1. **Header**
   - Logo institucional + nombre **CampusStatus**
   - Barra de estado en tiempo real con pestañas por zona (Biblioteca, Comedor, Estacionamiento…) y código de color según concurrencia
   - Indicador de conexión (Online / Syncing / Errors)

2. **Zona principal (3 columnas)**
   - **Izquierda — Selector de estado:** lista de niveles de ocupación reportables (Vacío, Poco concurrido, Moderado, Lleno, Saturado) con radio buttons e iconos de color
   - **Centro — Vista del área:** detalle de la zona seleccionada, estado actual, gráfico de tendencia y timestamp de última actualización
   - **Derecha — Herramientas de reporte:** botón *Submit My Report*, temporizador de cooldown (*Ready to Vote Again In*) e indicadores de validación (Network Verification, Reputation Check, Anomaly Detection)

Toda implementación visual debe tomar este boceto como guía de composición, jerarquía y distribución de componentes, adaptándolo a móvil cuando corresponda.

---

## Paleta de Colores

Paleta base del proyecto. Para fondos, bordes, hover, texto secundario u otros usos, **derivar siempre de estos cinco colores** (opacidad, mezclas o variaciones tonales) en lugar de introducir colores ajenos.

| Token | Hex | Uso principal |
|---|---|---|
| `color1` | `#ff1d44` | Alertas, estado **Lleno / Rojo**, acciones destructivas |
| `color2` | `#fbebaf` | Fondos cálidos, superficies de tarjetas, áreas neutras |
| `color3` | `#74bf9d` | Estado **Vacío / Verde**, confirmaciones, indicadores positivos |
| `color4` | `#56a292` | Estado **Moderado / Amarillo**, acentos secundarios, bordes activos |
| `color5` | `#1c8080` | Color primario, encabezados, texto principal, botones primarios |

### Derivados recomendados

| Necesidad | Derivado sugerido |
|---|---|
| Fondo de página | `color2` o `color2` al 60–80% de opacidad |
| Fondo de tarjeta | `color2` sólido; hover con `color4` al 10–15% |
| Texto principal | `color5` |
| Texto secundario / metadatos | `color5` al 60–70% de opacidad |
| Bordes suaves | `color4` al 20–30% de opacidad |
| Estado vacío (badge, borde) | `color3`; fondo del badge: `color3` al 15–20% |
| Estado moderado | `color4`; fondo del badge: `color4` al 15–20% |
| Estado lleno | `color1`; fondo del badge: `color1` al 15–20% |
| Botón primario | fondo `color5`; hover: `color5` oscurecido ~10% |
| Botón de voto / CTA | `color4`; hover: `color5` |
| Modal de error (403) | borde o acento `color1`; fondo `color2` |

### Configuración en Tailwind

Registrar la paleta en `tailwind.config.js` para usarla en toda la UI:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        campus: {
          1: '#ff1d44',
          2: '#fbebaf',
          3: '#74bf9d',
          4: '#56a292',
          5: '#1c8080',
        },
      },
    },
  },
  plugins: [],
};
```

Ejemplos de clases: `bg-campus-2`, `text-campus-5`, `border-campus-4/30`, `bg-campus-3/20`.

---

## Fase 1: Configuración del Entorno y Mock Data

**Objetivo:** Inicializar el espacio de trabajo y diseñar la estructura de datos local.

### Frontend — Inicialización con Vite

Crear el andamiaje del proyecto utilizando React y JavaScript.

```bash
pnpm create vite campus-status --template react
cd campus-status
pnpm install
```

### Frontend — Integración de Tailwind CSS

Instalar y configurar el motor de estilos para interfaces responsivas rápidas.

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

### Doc — Diseño de Datos Virtuales

Crear un archivo estático de configuración (`src/data/mockZones.js`) que simule las tres zonas críticas de la universidad:

```javascript
export const mockZones = [
  { id: 'biblioteca', name: 'Biblioteca Central', status: 'Verde', capacity: 'Baja', lastUpdate: '14:20' },
  { id: 'buffet', name: 'Buffet Facultad', status: 'Amarillo', capacity: 'Moderada', lastUpdate: '14:22' },
  { id: 'carritos', name: 'Carritos de Comida', status: 'Rojo', capacity: 'Alta', lastUpdate: '14:15' }
];
```

---

## Fase 2: Desarrollo del Frontend Interactivo

**Objetivo:** Construir la UI optimizada para dispositivos móviles y la lógica de bloqueo temporal, siguiendo el boceto [`preview.png`](./preview.png).

### Componentes de la UI (React + Tailwind)

- **Dashboard General:** Vista principal lineal y limpia que renderiza las tarjetas de cada zona de forma dinámica según su estado de ocupación, usando la paleta definida:
  - **Vacío / Verde** → `campus-3`
  - **Moderado / Amarillo** → `campus-4`
  - **Lleno / Rojo** → `campus-1`
- **Selector de Estado (StatusPicker):** Panel interactivo simplificado para el envío de reportes (Vacío / Moderado / Lleno), con los mismos colores de estado y fondo base `campus-2`.

### Lógica de Frontend y Persistencia

- **Custom Hook de Cooldown:** Crear un hook personalizado (`useCooldown.js`) para gestionar las restricciones temporales. Utilizar `localStorage` para persistir la marca de tiempo del último voto del usuario por zona, deshabilitando la interfaz si el periodo de 30 minutos no ha expirado.

> **Nota de Diseño UI:** Evitar patrones web pesados. Priorizar una navegación móvil fluida, ya que el estudiante consultará la app mientras se desplaza por los pasillos del campus. Mantener coherencia visual usando únicamente la paleta `campus-1` … `campus-5` y sus derivados.

---

## Fase 3: Desarrollo del Backend y Validación de Red

**Objetivo:** Crear el servidor de control y el escudo de seguridad perimetral por IP.

### Backend — Servidor Express

Inicializar un servidor Node.js en una carpeta paralela (`/server`) e instalar las dependencias esenciales: `express`, `cors` y `dotenv`.

### Backend — Filtro de Red Local

Implementar un Middleware de validación que analice la dirección IP de origen de la petición de voto (`req.ip`) y la compare contra la IP de la universidad (o tu entorno local de pruebas).

```javascript
// Middleware conceptual de seguridad
const verificarRedFisica = (req, res, next) => {
  const ipCliente = req.ip || req.headers['x-forwarded-for'];
  const IP_PERMITIDA = process.env.ALLOWED_CAMPUS_IP; // Ej: 127.0.0.1 en desarrollo

  if (ipCliente !== IP_PERMITIDA) {
    return res.status(403).json({ error: "Acceso denegado. No estás en el Wi-Fi del campus." });
  }
  next();
};
```

### Backend — Rutas de API

- **GET `/api/zones`:** Retorna el estado actual de los espacios a cualquier usuario (Red externa o interna).
- **POST `/api/zones/:id/vote`:** Aplica el middleware de red e incrementa el registro del estado de concurrencia.

---

## Fase 4: Conexión Frontend-Backend y Control de Errores

**Objetivo:** Unificar las partes y comunicar los estados de restricción al usuario final.

- **Frontend — Consumo de la API:** Reemplazar la lectura del archivo de Mock Data por peticiones asíncronas con `fetch` hacia el backend de Express.
- **Frontend — Feedback de Restricción de Red:** Si la API responde con un código de estado `403 Forbidden`, capturar el error y mostrar un modal informando detalladamente: *"Voto no registrado. Para participar debes estar conectado al Wi-Fi oficial de la universidad."*

---

## Fase 5: Despliegue y Preparación de la Propuesta Institucional

**Objetivo:** Publicar la aplicación y empaquetar el proyecto para presentarlo a las autoridades.

- **Infraestructura — Despliegue unificado:** Subir el monolito Next.js a Vercel (frontend + API en un solo servicio). Base de datos PostgreSQL en Neon o Supabase (`DATABASE_URL`).
- **Variables de entorno en producción:** `ALLOWED_CAMPUS_IPS` con la IP pública del campus, `TRUST_PROXY=true`.
- **Doc — Dossier de Presentación Universitaria:** Redactar el documento final para los directivos destacando:
  - Costo cero de infraestructura de hardware.
  - Garantía de veracidad de datos mediante el blindaje por IP pública institucional.
  - Privacidad absoluta de los datos de los estudiantes (sistema 100% anónimo).
  - Plan de lanzamiento controlado a través de una prueba piloto de 50 alumnos.

---

## Fase 6: Stack Next.js + Prisma (completada)

**Objetivo:** Unificar frontend, API y persistencia en un solo proyecto.

| Antes | Ahora |
|---|---|
| React + Vite (`campus-status/`) | Next.js App Router (`src/app/`) |
| Express (`server/`) | Route Handlers (`src/app/api/`) |
| Estado en memoria | Prisma + SQLite (dev) / PostgreSQL (prod) |
| 2 deploys + CORS | 1 deploy en Vercel |

Detalle completo en [`MIGRATION.md`](./MIGRATION.md).
