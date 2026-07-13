export const STATUS_BY_SCORE = [
  { max: 34, status: 'Verde', capacity: 'Baja' },
  { max: 67, status: 'Amarillo', capacity: 'Moderada' },
  { max: Infinity, status: 'Rojo', capacity: 'Alta' },
] as const;

export const REPORT_LEVELS = {
  vacio: { label: 'Vacío', status: 'Verde', score: 12 },
  poco: { label: 'Poco concurrido', status: 'Verde', score: 28 },
  moderado: { label: 'Moderado', status: 'Amarillo', score: 58 },
  lleno: { label: 'Lleno', status: 'Rojo', score: 82 },
  saturado: { label: 'Saturado', status: 'Rojo', score: 95 },
} as const;

export type ReportLevelId = keyof typeof REPORT_LEVELS;

export const INITIAL_ZONES = [
  {
    slug: 'biblioteca',
    name: 'Biblioteca Central',
    status: 'Verde',
    capacity: 'Baja',
    occupancy: 22,
    trend: [22, 18, 25, 30, 28, 35, 32, 26],
  },
  {
    slug: 'buffet',
    name: 'Buffet Facultad',
    status: 'Amarillo',
    capacity: 'Moderada',
    occupancy: 65,
    trend: [40, 45, 52, 60, 58, 65, 70, 62],
  },
  {
    slug: 'carritos',
    name: 'Carritos de Comida',
    status: 'Rojo',
    capacity: 'Alta',
    occupancy: 91,
    trend: [55, 62, 70, 78, 85, 90, 95, 92],
  },
] as const;

export const REPORT_LEVEL_SEED = [
  { id: 'vacio', label: 'Vacío', statusColor: 'Verde', score: 12, sortOrder: 1 },
  { id: 'poco', label: 'Poco concurrido', statusColor: 'Verde', score: 28, sortOrder: 2 },
  { id: 'moderado', label: 'Moderado', statusColor: 'Amarillo', score: 58, sortOrder: 3 },
  { id: 'lleno', label: 'Lleno', statusColor: 'Rojo', score: 82, sortOrder: 4 },
  { id: 'saturado', label: 'Saturado', statusColor: 'Rojo', score: 95, sortOrder: 5 },
] as const;

export const ALLOWED_CAMPUS_IP_SEED = [
  { ipAddress: '172.23.1.78', description: 'Wi-Fi campus UCASAL (red 1)' },
  { ipAddress: '172.25.9.160', description: 'Wi-Fi campus UCASAL (red 2)' },
] as const;
