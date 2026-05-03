import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";

interface DashboardFilters {
  from?: Date;
  to?: Date;
  carrera?: string;
  sector?: string;
}

export function useDashboard(rol: "admin" | "egresado" | "empresa", filters?: DashboardFilters) {
  const { isAuthenticated } = useAuth();
  const trpcFilters = filters
    ? {
        from: filters.from?.toISOString(),
        to: filters.to?.toISOString(),
        carrera: filters.carrera && filters.carrera !== "all" ? filters.carrera : undefined,
        sector: filters.sector && filters.sector !== "all" ? filters.sector : undefined,
      }
    : undefined;

  const adminKpis = trpc.dashboard.adminKpis.useQuery(trpcFilters, { enabled: isAuthenticated && rol === "admin" });
  const egresadoKpis = trpc.dashboard.egresadoKpis.useQuery(undefined, { enabled: isAuthenticated && rol === "egresado" });
  const empresaKpis = trpc.dashboard.empresaKpis.useQuery(undefined, { enabled: isAuthenticated && rol === "empresa" });
  const tendencias = trpc.dashboard.tendencias.useQuery(trpcFilters, { enabled: isAuthenticated });
  const topHabilidades = trpc.dashboard.topHabilidades.useQuery(trpcFilters, { enabled: isAuthenticated && rol === "admin" });
  const ofertasRecomendadas = trpc.dashboard.ofertasRecomendadas.useQuery(undefined, { enabled: isAuthenticated && rol === "egresado" });

  const dashboardQuery =
    rol === "admin" ? adminKpis : rol === "egresado" ? egresadoKpis : empresaKpis;

  const adminQueries = [adminKpis, tendencias, topHabilidades];
  const roleQueries = rol === "admin" ? adminQueries : rol === "egresado" ? [egresadoKpis, tendencias, ofertasRecomendadas] : [empresaKpis, tendencias];

  return {
    kpis: dashboardQuery.data,
    tendencias: tendencias.data ?? [],
    topHabilidades: rol === "admin" ? topHabilidades.data ?? [] : [],
    ofertasRecomendadas: rol === "egresado" ? ofertasRecomendadas.data ?? [] : [],
    isLoading: roleQueries.some((query) => query.isLoading),
    error: roleQueries.find((query) => query.error)?.error ?? null,
  };
}