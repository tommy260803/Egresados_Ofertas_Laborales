"use client";

import { useMemo, useState } from "react";
import { useReportes } from "@/hooks/use-reportes";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

export default function ReportesPage() {
  const [tipoReporte, setTipoReporte] = useState<
    "egresados_por_carrera" | "ofertas_activas" | "postulaciones_por_oferta" | "empleabilidad_por_carrera" | "habilidades_mas_demandadas"
  >("empleabilidad_por_carrera");
  
  const [fechaDesde, setFechaDesde] = useState(
    format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [fechaHasta, setFechaHasta] = useState(format(new Date(), "yyyy-MM-dd"));

  const [carrera, setCarrera] = useState("all");
  const [sector, setSector] = useState("all");
  const [ofertaId, setOfertaId] = useState("all");
  const { generarReporteDirecto, isGenerating } = useReportes();
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
    const paramsToSend = {
      tipo: tipoReporte,
      parametros: {
        fechaDesde: new Date(fechaDesde).toISOString(),
        fechaHasta: new Date(fechaHasta).toISOString(),
        carrera: carrera !== "all" ? carrera : undefined,
        sector: sector !== "all" ? sector : undefined,
        ofertaId: ofertaId !== "all" ? Number(ofertaId) : undefined,
      },
    };
    
    await generarReporteDirecto(paramsToSend);
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="space-y-2">
              <Label className="text-slate-300 font-medium">Fecha de inicio (Desde)</Label>
              <Input 
                type="date" 
                value={fechaDesde} 
                onChange={(e) => setFechaDesde(e.target.value)}
                className="bg-slate-950/50 border-white/20 focus:border-primary transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300 font-medium">Fecha de fin (Hasta)</Label>
              <Input 
                type="date" 
                value={fechaHasta} 
                onChange={(e) => setFechaHasta(e.target.value)}
                className="bg-slate-950/50 border-white/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
          
          {tipoReporte === "postulaciones_por_oferta" && (
            <div>
              <Label>Oferta específica</Label>
              <Select value={ofertaId} onValueChange={setOfertaId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar oferta" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Seleccionar...</SelectItem>
                  {Array.isArray(ofertasData) && ofertasData.map((o: any) => (
                    <SelectItem key={o.id_oferta} value={String(o.id_oferta)}>{o.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={handleGenerar}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generar y Descargar Reporte
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}