"use client";

import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2, Search, FilterX, History, User, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc/client";

export default function PostulacionesEmpresaPage() {
  const [filtros, setFiltros] = useState({ estado: "todos", busqueda: "" });
  const { postulaciones, cambiarEstado, isLoading } = useOfertas({ postulacionesEmpresa: true });
  const utils = trpc.useUtils();

  const handleCambiarEstado = async (postulacionId: number, nuevoEstado: string) => {
    try {
      await cambiarEstado.mutateAsync({ postulacionId, estado: nuevoEstado });
      utils.ofertas.listarPostulacionesEmpresa.invalidate();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const filtered = postulaciones?.filter((p: any) => {
    const matchesEstado = filtros.estado === "todos" || p.estado_actual === filtros.estado;
    const matchesBusqueda = !filtros.busqueda || 
      `${p.egresado?.nombres} ${p.egresado?.apellidos}`.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      p.oferta?.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    return matchesEstado && matchesBusqueda;
  });

  const estadoColor: Record<string, string> = {
    postulado: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    revisado: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    preseleccionado: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    entrevista: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    rechazado: "bg-red-500/10 text-red-500 border-red-500/20",
    contratado: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <DashboardShell>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Postulaciones Recibidas</h2>
        <p className="text-slate-400">Gestiona los candidatos que han aplicado a tus vacantes</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por egresado u oferta..." 
            value={filtros.busqueda}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            className="pl-10 border-white/10 bg-white/5 text-slate-200"
          />
        </div>
        <Select value={filtros.estado} onValueChange={(val) => setFiltros({ ...filtros, estado: val })}>
          <SelectTrigger className="border-white/10 bg-white/5 text-slate-200">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="postulado">Postulado</SelectItem>
            <SelectItem value="revisado">Revisado</SelectItem>
            <SelectItem value="preseleccionado">Preseleccionado</SelectItem>
            <SelectItem value="entrevista">Entrevista</SelectItem>
            <SelectItem value="contratado">Contratado</SelectItem>
            <SelectItem value="rechazado">Rechazado</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          className="border-white/10 hover:bg-white/5 text-slate-300"
          onClick={() => setFiltros({ estado: "todos", busqueda: "" })}
        >
          <FilterX className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-300 font-semibold">Candidato</TableHead>
              <TableHead className="text-slate-300 font-semibold">Oferta</TableHead>
              <TableHead className="text-slate-300 font-semibold">Fecha</TableHead>
              <TableHead className="text-slate-300 font-semibold">Estado</TableHead>
              <TableHead className="text-slate-300 font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-slate-400">Cargando postulaciones...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !filtered || filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <p className="text-slate-400 italic text-lg">No hay postulaciones registradas</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p: any) => (
                <TableRow key={p.id_postulacion} className="border-white/10 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">{p.egresado?.nombres} {p.egresado?.apellidos}</span>
                      <span className="text-xs text-slate-400">{p.egresado?.usuario?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-200">{p.oferta?.titulo}</TableCell>
                  <TableCell className="text-slate-300">{new Date(p.fecha_postulacion).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${estadoColor[p.estado_actual]} font-medium`}>
                      {p.estado_actual.charAt(0).toUpperCase() + p.estado_actual.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <HistorialDialog postulacionId={p.id_postulacion} />
                      
                      {p.mensaje && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" title="Ver mensaje">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle>Mensaje del Candidato</DialogTitle>
                            </DialogHeader>
                            <div className="p-4 bg-white/5 rounded-lg text-slate-300 italic">
                              "{p.mensaje}"
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Select onValueChange={(val) => handleCambiarEstado(p.id_postulacion, val)}>
                        <SelectTrigger className="h-8 w-36 border-white/10 bg-white/5 text-xs text-white">
                          <SelectValue placeholder="Acción" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                          <SelectItem value="revisado">Marcar revisado</SelectItem>
                          <SelectItem value="preseleccionado">Preseleccionar</SelectItem>
                          <SelectItem value="entrevista">Invitar entrevista</SelectItem>
                          <SelectItem value="contratado">Contratar</SelectItem>
                          <SelectItem value="rechazado">Rechazar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}

function HistorialDialog({ postulacionId }: { postulacionId: number }) {
  const { data: historial, isLoading } = (trpc as any).ofertas.historialPostulacion.useQuery(postulacionId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" title="Ver historial">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Historial de la Postulación</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !historial || historial.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 italic">Sin cambios registrados.</p>
          ) : (
            <div className="space-y-4">
              {historial.map((h: any) => (
                <div key={h.id_historial} className="flex flex-col border-l-2 border-primary/20 pl-4 pb-4 last:pb-0 relative">
                  <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-sm capitalize text-slate-200">{h.estado_nuevo}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(h.fecha_cambio).toLocaleString()}
                    </span>
                  </div>
                  {h.motivo && <p className="text-xs text-slate-400">{h.motivo}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}