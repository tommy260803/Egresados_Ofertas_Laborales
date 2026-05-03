"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { KpiCard } from "@/components/shared/KpiCard";
import { BarChart, LineChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, UserCheck, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EmpresaDashboardPage() {
  const { kpis, tendencias, isLoading } = useDashboard("empresa");

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  const kpiData = [
    { title: "Ofertas activas", value: kpis?.ofertasActivas || 0, icon: Briefcase },
    { title: "Total postulantes", value: kpis?.totalPostulantes || 0, icon: Users },
    { title: "Preseleccionados", value: kpis?.preseleccionados || 0, icon: UserCheck },
    { title: "Contratados", value: kpis?.contratados || 0, icon: TrendingUp },
  ];

  const tendenciasData = tendencias.map((t: any) => ({
    mes: new Date(t.mes).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
    total: Number(t.total),
  }));

  return (
    <DashboardShell>
      <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Dashboard Empresa</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {kpiData.map((kpi) => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
          <CardHeader><CardTitle>Evolución de postulaciones</CardTitle></CardHeader>
          <CardContent>
            {tendenciasData.length > 0 ? (
              <LineChart data={tendenciasData} xKey="mes" yKey="total" />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 italic">
                Aún no hay datos de postulaciones
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Últimas ofertas
              <Link href="/empresa/ofertas" className="text-xs text-primary hover:underline font-normal">Ver todas</Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpis?.ultimasOfertas && kpis.ultimasOfertas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-300">Título</TableHead>
                    <TableHead className="text-slate-300 text-center">Postulaciones</TableHead>
                    <TableHead className="text-slate-300 text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpis.ultimasOfertas.map((o: any) => (
                    <TableRow key={o.id_oferta} className="border-white/10">
                      <TableCell className="font-medium text-slate-200">{o.titulo}</TableCell>
                      <TableCell className="text-center">{o.postulaciones}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={o.activa ? "default" : "secondary"}>
                          {o.activa ? "Activa" : "Cerrada"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 italic">
                No tienes ofertas publicadas
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
        <CardHeader>
          <CardTitle>Tasa de conversión (Efectividad)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {kpis?.totalPostulantes > 0 
                ? `${((kpis.contratados / kpis.totalPostulantes) * 100).toFixed(1)}%` 
                : "0%"}
            </div>
            <div className="text-sm text-slate-400">
              de postulantes han sido contratados
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}