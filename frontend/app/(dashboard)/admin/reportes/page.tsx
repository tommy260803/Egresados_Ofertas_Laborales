"use client";

import { useMemo, useState } from "react";
import { useReportes } from "@/hooks/use-reportes";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<
    "egresados_por_carrera" | "ofertas_activas" | "postulaciones_por_oferta" | "empleabilidad_por_carrera" | "habilidades_mas_demandadas"
  >("empleabilidad_por_carrera");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [carrera, setCarrera] = useState("all");
  const [sector, setSector] = useState("all");
  const [ofertaId, setOfertaId] = useState("all");
  const { solicitarReporte, reporteEstado, reportes, downloadReporte } = useReportes();
  const { data: egresadosData } = trpc.egresados.list.useQuery();
  const { data: ofertasData } = trpc.ofertas.list.useQuery();

  const carreras = useMemo(() => {
    if (!Array.isArray(egresadosData)) return [];
    return Array.from(new Set(egresadosData.map((item: any) => item?.carrera).filter(Boolean))).sort();
  }, [egresadosData]);
  const sectores = useMemo(() => {
    if (!Array.isArray(ofertasData)) return [];
    return Array.from(new Set(ofertasData.map((item: any) => item?.empresa?.sector).filter(Boolean))).sort();
  }, [ofertasData]);

  const handleGenerar = async () => {
    await solicitarReporte.mutateAsync({
      tipo: tipoReporte,
      parametros: {
        fechaDesde: dateRange.from?.toISOString(),
        fechaHasta: dateRange.to?.toISOString(),
        carrera: carrera !== "all" ? carrera : undefined,
        sector: sector !== "all" ? sector : undefined,
        ofertaId: ofertaId !== "all" ? Number(ofertaId) : undefined,
      },
    });
  };

  const handleDescargar = async () => {
    if (reporteEstado?.url_pdf) await downloadReporte(reporteEstado.id_reporte);
  };

  return (
    <DashboardShell>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">Generador de Reportes</h2>
      <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
        <CardHeader><CardTitle>Configuración del reporte</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipo de reporte</Label>
            <Select value={tipoReporte} onValueChange={(value: any) => setTipoReporte(value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="egresados_por_carrera">Listado de egresados por carrera</SelectItem>
                <SelectItem value="ofertas_activas">Listado de ofertas activas</SelectItem>
                <SelectItem value="postulaciones_por_oferta">Postulaciones por oferta</SelectItem>
                <SelectItem value="empleabilidad_por_carrera">Empleabilidad por carrera</SelectItem>
                <SelectItem value="habilidades_mas_demandadas">Habilidades más demandadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rango de fechas</Label>
            <DateRangePicker value={dateRange} onChange={(nextRange: { from?: Date; to?: Date } | undefined) => setDateRange(nextRange ?? {})} />
          </div>
          <div>
            <Label>Carrera</Label>
            <Select value={carrera} onValueChange={setCarrera}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {carreras.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {sectores.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {tipoReporte === "postulaciones_por_oferta" ? (
            <div>
              <Label>Oferta</Label>
              <Select value={ofertaId} onValueChange={setOfertaId}>
                <SelectTrigger><SelectValue placeholder="Selecciona una oferta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Seleccionar</SelectItem>
                  {(ofertasData || []).map((oferta: any) => (
                    <SelectItem key={oferta.id_oferta} value={String(oferta.id_oferta)}>
                      {oferta.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <Button onClick={handleGenerar} disabled={solicitarReporte.isLoading}>
            {solicitarReporte.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Generar reporte
          </Button>
          {reporteEstado && reporteEstado.estado === "pendiente" ? (
            <p className="text-sm text-slate-300">Generando reporte en cola...</p>
          ) : null}
          {reporteEstado && reporteEstado.estado === "completado" && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-50">
              <p>Reporte listo para descargar</p>
              <Button onClick={handleDescargar} variant="outline" className="mt-2 border-emerald-400/30 bg-transparent text-emerald-50 hover:bg-emerald-500/10">
                Descargar PDF
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="mt-6 border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
        <CardHeader><CardTitle>Reportes recientes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(reportes || []).length === 0 ? (
            <p className="text-sm text-slate-300">Aún no hay reportes generados.</p>
          ) : (
            reportes.map((reporte: any) => (
              <div key={reporte.id_reporte} className="flex items-center justify-between rounded border border-white/10 p-3">
                <div>
                  <p className="font-medium">{reporte.tipo_reporte}</p>
                  <p className="text-xs text-slate-300">Estado: {reporte.estado}</p>
                </div>
                {reporte.estado === "completado" ? (
                  <Button variant="outline" onClick={() => downloadReporte(reporte.id_reporte)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Descargar
                  </Button>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}