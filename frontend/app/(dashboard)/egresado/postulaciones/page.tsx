"use client";

import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, History, Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export default function MisPostulacionesPage() {
  const { misPostulaciones, isLoading, isError } = useOfertas({ misPostulaciones: true });
  const [selectedPostulacionId, setSelectedPostulacionId] = useState<number | null>(null);

  const estadoColor: Record<string, string> = {
    postulado: "bg-yellow-100 text-yellow-800",
    revisado: "bg-blue-100 text-blue-800",
    preseleccionado: "bg-purple-100 text-purple-800",
    entrevista: "bg-orange-100 text-orange-800",
    rechazado: "bg-red-100 text-red-800",
    contratado: "bg-green-100 text-green-800",
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Cargando tus postulaciones...</p>
        </div>
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-red-500 font-medium">Ocurrió un error al cargar las postulaciones.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mis postulaciones</h2>
      </div>

      {!misPostulaciones || misPostulaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg">Aún no te has postulado a ninguna oferta</p>
          <Link href="/egresado/ofertas" className="mt-4">
            <Button>Ver ofertas disponibles</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oferta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado Actual</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {misPostulaciones.map((p: any) => (
                <TableRow key={p.id_postulacion}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/egresado/ofertas/${p.oferta?.id_oferta}`}
                      className="text-primary hover:underline"
                    >
                      {p.oferta?.titulo}
                    </Link>
                  </TableCell>
                  <TableCell>{p.oferta?.empresa?.razon_social}</TableCell>
                  <TableCell>
                    {new Date(p.fecha_postulacion).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={estadoColor[p.estado_actual] || "bg-gray-100 text-gray-800"}>
                      {p.estado_actual.charAt(0).toUpperCase() + p.estado_actual.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <HistorialDialog postulacionId={p.id_postulacion} />
                      <Link href={`/egresado/ofertas/${p.oferta?.id_oferta}`}>
                        <Button variant="ghost" size="icon" title="Ver oferta">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardShell>
  );
}

function HistorialDialog({ postulacionId }: { postulacionId: number }) {
  const { data: historial, isLoading } = (trpc as any).ofertas.historialPostulacion.useQuery(postulacionId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver historial de estados">
          <History className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Historial de cambios de estado</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !historial || historial.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay historial disponible.</p>
          ) : (
            <div className="space-y-4">
              {historial.map((h: any) => (
                <div key={h.id_historial} className="flex flex-col border-l-2 border-primary/20 pl-4 pb-4 last:pb-0 relative">
                  <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm capitalize">{h.estado_nuevo}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.fecha_cambio).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {h.motivo && <p className="text-sm text-muted-foreground">{h.motivo}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}