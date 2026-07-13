'use client';

import { zoneCategories } from '@/data/zoneMetadata';

export default function CategoryFilters({
  activeCategory,
  onChange,
}: {
  activeCategory: string;
  onChange: (category: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 sm:mb-6">
      {zoneCategories.map((cat) => {
        const active = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
            aria-pressed={active}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
