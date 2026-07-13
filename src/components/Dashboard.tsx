'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError, fetchZones, submitVote } from '@/lib/api';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import StatusSummary from '@/components/StatusSummary';
import CategoryFilters from '@/components/CategoryFilters';
import ZoneCard from '@/components/ZoneCard';
import ReportModal from '@/components/ReportModal';
import NetworkErrorModal from '@/components/NetworkErrorModal';
import { useCooldown } from '@/hooks/useCooldown';
import { mapZoneFromApi, mapZonesFromApi, type MappedZone } from '@/utils/mapZone';
import { playVoteSound } from '@/utils/playVoteSound';

export default function Dashboard() {
  const [zones, setZones] = useState<MappedZone[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [reportZoneId, setReportZoneId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showNetworkError, setShowNetworkError] = useState(false);

  const reportZone = zones.find((z) => z.id === reportZoneId) ?? null;
  const { isCoolingDown, formatted, startCooldown } = useCooldown(reportZoneId ?? '');

  const connectionStatus = isLoading || isSubmitting ? 'syncing' : loadError ? 'error' : 'online';

  const loadZones = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      const { zones: apiZones } = await fetchZones();
      setZones(mapZonesFromApi(apiZones as Parameters<typeof mapZonesFromApi>[0]));
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : 'No se pudo conectar con el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadZones();
  }, [loadZones]);

  const filteredZones = useMemo(() => {
    if (activeCategory === 'all') return zones;
    return zones.filter((z) => z.category === activeCategory);
  }, [zones, activeCategory]);

  const openReport = (zoneId: string) => {
    setReportZoneId(zoneId);
    setSelectedLevel(null);
  };

  const closeReport = () => {
    setReportZoneId(null);
    setSelectedLevel(null);
  };

  const handleSubmit = async () => {
    if (!selectedLevel || !reportZoneId || isCoolingDown || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { zone: apiZone } = await submitVote(reportZoneId, selectedLevel);
      const updatedZone = mapZoneFromApi(apiZone as Parameters<typeof mapZoneFromApi>[0]);
      if (updatedZone) {
        setZones((prev) => prev.map((z) => (z.id === reportZoneId ? updatedZone : z)));
      }
      playVoteSound();
      startCooldown();
      setSelectedLevel(null);
      closeReport();
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setShowNetworkError(true);
        closeReport();
        return;
      }
      setLoadError(
        error instanceof ApiError ? error.message : 'No se pudo enviar el reporte.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header connectionStatus={connectionStatus} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <HeroSection />
        <StatusSummary zones={zones} />
        <CategoryFilters activeCategory={activeCategory} onChange={setActiveCategory} />

        {loadError && (
          <div className="mb-5 rounded-xl border border-occupancy-full/30 bg-occupancy-full/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-foreground">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadZones()}
              className="shrink-0 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 animate-pulse h-48"
              />
            ))}
          </div>
        ) : filteredZones.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            {zones.length === 0
              ? 'No hay datos disponibles. ¿Está corriendo el servidor?'
              : 'No hay lugares en esta categoría.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {filteredZones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} onReport={openReport} />
            ))}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border">
        CampusStatus v1.0 — Sistema colaborativo de concurrencia
      </footer>

      {reportZone && (
        <ReportModal
          zone={reportZone}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onSubmit={() => void handleSubmit()}
          onClose={closeReport}
          isCoolingDown={isCoolingDown}
          cooldownFormatted={formatted}
          canSubmit={Boolean(selectedLevel) && !isCoolingDown}
          isSubmitting={isSubmitting}
        />
      )}

      {showNetworkError && (
        <NetworkErrorModal onClose={() => setShowNetworkError(false)} />
      )}
    </div>
  );
}
