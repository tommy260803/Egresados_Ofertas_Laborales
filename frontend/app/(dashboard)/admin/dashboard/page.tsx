"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { KpiCard } from "@/components/shared/KpiCard";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";

const skeleton = () => (
  <div className="h-[300px] animate-pulse rounded bg-white/5" />
);
const BarChart = dynamic(
  () =>
    import("@/components/charts/BarChart").then((m) => ({
      default: m.BarChart,
    })),
  { ssr: false, loading: skeleton },
);
const LineChart = dynamic(
  () =>
    import("@/components/charts/LineChart").then((m) => ({
      default: m.LineChart,
    })),
  { ssr: false, loading: skeleton },
);
const PieChart = dynamic(
  () =>
    import("@/components/charts/PieChart").then((m) => ({
      default: m.PieChart,
    })),
  { ssr: false, loading: skeleton },
);

export default function AdminDashboardPage() {
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
  );
  const [fechaHasta, setFechaHasta] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const [carreraFilter, setCarreraFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const dashboardFilters = useMemo(
    () => ({
      from: new Date(fechaDesde),
      to: new Date(fechaHasta),
      carrera: carreraFilter,
      sector: sectorFilter,
    }),
    [dateRange.from, dateRange.to, carreraFilter, sectorFilter],
  );

  const { data: egresadosData } = trpc.egresados.list.useQuery();
  const { data: ofertasData } = trpc.ofertas.list.useQuery();
  const { kpis, tendencias, topHabilidades, isLoading, error } = useDashboard(
    "admin",
    dashboardFilters,
  );

  const shouldShowLoading =
    isLoading &&
    !kpis &&
    tendencias.length === 0 &&
    topHabilidades.length === 0;
  const carreras = useMemo(() => {
    if (!Array.isArray(egresadosData)) return [];
    return Array.from(
      new Set(egresadosData.map((item: any) => item?.carrera).filter(Boolean)),
    ).sort();
  }, [egresadosData]);
  const sectores = useMemo(() => {
    if (!Array.isArray(ofertasData)) return [];
    return Array.from(
      new Set(
        ofertasData.map((item: any) => item?.empresa?.sector).filter(Boolean),
      ),
    ).sort();
  }, [ofertasData]);

  if (shouldShowLoading) return <div>Cargando dashboard...</div>;

  interface KpiData {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend: string;
  }

  const kpiData: KpiData[] = [
    {
      title: "Total Egresados",
      value: kpis?.totalEgresados || 0,
      icon: Users,
      trend: "+12%",
    },
    {
      title: "Empresas Activas",
      value: kpis?.totalEmpresas || 0,
      icon: Briefcase,
      trend: "+5%",
    },
    {
      title: "Ofertas Activas",
      value: kpis?.ofertasActivas || 0,
      icon: FileText,
      trend: "+8%",
    },
    {
      title: "Tasa Empleabilidad",
      value: `${kpis?.tasaEmpleabilidad || 0}%`,
      icon: TrendingUp,
      trend: "+2%",
    },
  ];

  return (
    <DashboardShell>
      {error ? (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          No se pudieron cargar todos los datos del dashboard. Se muestran
          valores vacios donde corresponde.
        </div>
      ) : null}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Dashboard Administrativo</h2>
        <div className="flex gap-4">
          <DateRangePicker
            value={dateRange}
            onChange={(nextRange: { from?: Date; to?: Date } | undefined) =>
              setDateRange(nextRange ?? {})
            }
          />
          <Select value={carreraFilter} onValueChange={setCarreraFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Carrera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Carreras</SelectItem>
              {carreras.map((carrera) => (
                <SelectItem key={carrera} value={carrera}>
                  {carrera}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Sectores</SelectItem>
              {sectores.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            trend={kpi.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones por mes</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={tendencias} xKey="mes" yKey="total" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Habilidades más demandadas</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={topHabilidades}
              xKey="nombre_habilidad"
              yKey="cantidad_ofertas_requieren"
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Empleabilidad por carrera</CardTitle>
        </CardHeader>
        <CardContent>
          <PieChart
            data={kpis?.empleabilidadPorCarrera || []}
            nameKey="carrera"
            valueKey="tasa_empleabilidad"
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
