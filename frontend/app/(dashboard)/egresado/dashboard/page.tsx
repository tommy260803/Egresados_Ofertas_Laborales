"use client";

import dynamic from "next/dynamic";
import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { KpiCard } from "@/components/shared/KpiCard";
import { OfertaCard } from "@/components/ofertas/OfertaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle,
  LucideIcon,
} from "lucide-react";

const LineChart = dynamic(
  () =>
    import("@/components/charts/LineChart").then((m) => ({
      default: m.LineChart,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] animate-pulse rounded bg-white/5" />
    ),
  },
);

export default function EgresadoDashboardPage() {
  const { kpis, tendencias, ofertasRecomendadas, isLoading } =
    useDashboard("egresado");

  if (isLoading) return <div className="text-slate-300">Cargando...</div>;

  interface KpiData {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
  }

  const kpiData: KpiData[] = [
    {
      title: "Postulaciones enviadas",
      value: kpis?.totalPostulaciones || 0,
      icon: Briefcase,
    },
    { title: "En proceso", value: kpis?.activas || 0, icon: Clock },
    { title: "Entrevistas", value: kpis?.entrevistas || 0, icon: AlertCircle },
    {
      title: "Contrataciones",
      value: kpis?.contratadas || 0,
      icon: CheckCircle,
    },
  ];

  const tendenciasData = tendencias.map((t: any) => ({
    mes: new Date(t.mes).toLocaleDateString("es-ES", {
      month: "short",
      year: "2-digit",
    }),
    total: Number(t.total),
  }));

  return (
    <DashboardShell>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">
        Mi Dashboard
      </h2>
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

      {tendenciasData.length > 0 ? (
        <Card className="mb-6 border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
          <CardHeader>
            <CardTitle>Postulaciones por mes (últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={tendenciasData} xKey="mes" yKey="total" />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Ofertas recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          {ofertasRecomendadas.length > 0 ? (
            <div className="space-y-4">
              {ofertasRecomendadas.slice(0, 5).map((oferta: any) => (
                <OfertaCard key={oferta.id_oferta} oferta={oferta} />
              ))}
            </div>
          ) : (
            <p className="text-slate-300">
              No hay ofertas recomendadas disponibles en este momento. Agrega
              habilidades a tu perfil para recibir recomendaciones
              personalizadas.
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
