"use client";

import { useState } from "react";
import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Edit, Trash2, Eye, Loader2, Power, Search, FilterX } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

export default function MisOfertasPage() {
  const [filtros, setFiltros] = useState({ titulo: "", activa: "all" });
  const { misOfertas, isLoading, eliminarOferta, alternarEstado } = useOfertas({ 
    misOfertas: true, 
    filtrosMisOfertas: {
      titulo: filtros.titulo || undefined,
      activa: filtros.activa === "all" ? undefined : filtros.activa
    }
  });

  const utils = trpc.useUtils();

  const handleAlternarEstado = async (id: number) => {
    try {
      await alternarEstado.mutateAsync(id);
      utils.ofertas.misOfertas.invalidate();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarOferta.mutateAsync(id);
      utils.ofertas.misOfertas.invalidate();
    } catch (error) {
      console.error("Error al eliminar la oferta:", error);
    }
  };

  return (
    <DashboardShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Mis Ofertas</h2>
          <p className="text-slate-400">Gestiona y publica nuevas oportunidades laborales</p>
        </div>
        <Link href="/empresa/ofertas/nueva">
          <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold px-6 shadow-lg shadow-emerald-500/20">
            + Nueva oferta
          </Button>
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por título..." 
            value={filtros.titulo}
            onChange={(e) => setFiltros({ ...filtros, titulo: e.target.value })}
            className="pl-10 border-white/10 bg-white/5 text-slate-200"
          />
        </div>
        <Select value={filtros.activa} onValueChange={(val) => setFiltros({ ...filtros, activa: val })}>
          <SelectTrigger className="border-white/10 bg-white/5 text-slate-200">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="true">Activas</SelectItem>
            <SelectItem value="false">Cerradas</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          className="border-white/10 hover:bg-white/5 text-slate-300"
          onClick={() => setFiltros({ titulo: "", activa: "all" })}
        >
          <FilterX className="mr-2 h-4 w-4" />
          Limpiar filtros
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-slate-300 font-semibold">Título de la Oferta</TableHead>
              <TableHead className="text-slate-300 font-semibold">Publicación</TableHead>
              <TableHead className="text-slate-300 font-semibold">Cierre</TableHead>
              <TableHead className="text-slate-300 font-semibold">Estado</TableHead>
              <TableHead className="text-slate-300 font-semibold text-center">Postulantes</TableHead>
              <TableHead className="text-slate-300 font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-slate-400">Cargando ofertas...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !misOfertas || misOfertas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <p className="text-slate-400 italic text-lg">No se encontraron ofertas con los filtros aplicados</p>
                </TableCell>
              </TableRow>
            ) : (
              misOfertas.map((o: any) => (
                <TableRow key={o.id_oferta} className="border-white/10 hover:bg-white/5 transition-colors group">
                  <TableCell className="font-medium text-slate-100">{o.titulo}</TableCell>
                  <TableCell className="text-slate-300">{new Date(o.fecha_publicacion).toLocaleDateString()}</TableCell>
                  <TableCell className="text-slate-300">{o.fecha_cierre ? new Date(o.fecha_cierre).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={o.activa ? "default" : "secondary"} className={o.activa ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : ""}>
                      {o.activa ? "Activa" : "Cerrada"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {o.total_postulaciones || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link href={`/empresa/ofertas/${o.id_oferta}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:bg-white/10" title="Ver detalle">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/empresa/ofertas/editar/${o.id_oferta}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:bg-white/10" title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${o.activa ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`} 
                        title={o.activa ? "Cerrar oferta" : "Reabrir oferta"}
                        onClick={() => handleAlternarEstado(o.id_oferta)}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" 
                        title="Eliminar"
                        onClick={() => handleEliminar(o.id_oferta)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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