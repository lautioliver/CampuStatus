// Metadatos estáticos de display por zona (el estado dinámico viene del backend).
export const zoneMetadata: Record<
  string,
  { location: string; category: string; icon: string }
> = {
  biblioteca: {
    location: 'Edificio Central · Planta baja',
    category: 'biblioteca',
    icon: 'book',
  },
  buffet: {
    location: 'Facultad de Ingeniería · PB',
    category: 'comida',
    icon: 'utensils',
  },
  carritos: {
    location: 'Patio central · Sector norte',
    category: 'comida',
    icon: 'cart',
  },
};

export const zoneCategories = [
  { id: 'all', label: 'Todos' },
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'comida', label: 'Comida' },
];

export const reportLevels = [
  {
    id: 'vacio',
    label: 'Vacío',
    description: 'Espacio libre, sin espera',
    status: 'Verde',
    dot: 'bg-occupancy-free',
    activeBg: 'bg-occupancy-free/20 border-occupancy-free',
  },
  {
    id: 'poco',
    label: 'Poco concurrido',
    description: 'Algunas personas, mucho lugar',
    status: 'Verde',
    dot: 'bg-occupancy-free/60',
    activeBg: 'bg-occupancy-free/15 border-occupancy-free/70',
  },
  {
    id: 'moderado',
    label: 'Moderado',
    description: 'Ocupación media, hay lugar',
    status: 'Amarillo',
    dot: 'bg-occupancy-mid',
    activeBg: 'bg-occupancy-mid/15 border-occupancy-mid',
  },
  {
    id: 'lleno',
    label: 'Lleno',
    description: 'Casi sin lugares disponibles',
    status: 'Rojo',
    dot: 'bg-occupancy-full/70',
    activeBg: 'bg-occupancy-full/10 border-occupancy-full/70',
  },
  {
    id: 'saturado',
    label: 'Saturado',
    description: 'Sin lugar, espera prolongada',
    status: 'Rojo',
    dot: 'bg-occupancy-full',
    activeBg: 'bg-occupancy-full/15 border-occupancy-full',
  },
];

export const statusStyles: Record<
  string,
  {
    label: string;
    summaryLabel: string;
    capacity: string;
    dot: string;
    text: string;
    badge: string;
    bar: string;
    description: string;
  }
> = {
  Verde: {
    label: 'Vacío',
    summaryLabel: 'Con lugar',
    capacity: 'Baja',
    dot: 'bg-occupancy-free',
    text: 'text-occupancy-free',
    badge: 'bg-occupancy-free/15 text-occupancy-free border-occupancy-free/30',
    bar: 'bg-occupancy-free',
    description: 'Hay lugar de sobra',
  },
  Amarillo: {
    label: 'Moderado',
    summaryLabel: 'Llenándose',
    capacity: 'Moderada',
    dot: 'bg-occupancy-mid',
    text: 'text-occupancy-mid',
    badge: 'bg-occupancy-mid/15 text-occupancy-mid border-occupancy-mid/30',
    bar: 'bg-occupancy-mid',
    description: 'Llenándose, pero entra',
  },
  Rojo: {
    label: 'Lleno',
    summaryLabel: 'Sin lugar',
    capacity: 'Alta',
    dot: 'bg-occupancy-full',
    text: 'text-occupancy-full',
    badge: 'bg-occupancy-full/15 text-occupancy-full border-occupancy-full/30',
    bar: 'bg-occupancy-full',
    description: 'Casi sin lugar',
  },
};
