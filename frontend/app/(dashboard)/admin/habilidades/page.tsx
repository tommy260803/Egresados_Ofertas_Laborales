"use client";

import { useHabilidadesGlobal } from "@/hooks/use-habilidades";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AdminHabilidadesPage() {
  const [search, setSearch] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const { habilidades, crearHabilidad, editarHabilidad, eliminarHabilidad, isLoading } = useHabilidadesGlobal({
    search,
    categoria: categoriaFiltro,
  });
  const [nuevaHabilidad, setNuevaHabilidad] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNombre, setEditingNombre] = useState("");
  const [editingCategoria, setEditingCategoria] = useState("");

  const handleCreate = async () => {
    if (nuevaHabilidad.trim()) {
      await crearHabilidad.mutateAsync({ nombre_habilidad: nuevaHabilidad, categoria: nuevaCategoria || undefined });
      setNuevaHabilidad("");
      setNuevaCategoria("");
    }
  };

  const startEdit = (habilidad: any) => {
    setEditingId(habilidad.id_habilidad);
    setEditingNombre(habilidad.nombre_habilidad || "");
    setEditingCategoria(habilidad.categoria || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await editarHabilidad.mutateAsync({
      id: editingId,
      data: {
        nombre_habilidad: editingNombre,
        categoria: editingCategoria || undefined,
      },
    });
    setEditingId(null);
    setEditingNombre("");
    setEditingCategoria("");
  };

  return (
    <DashboardShell>
      <h2 className="text-2xl font-bold mb-6">Catálogo de habilidades</h2>
      <div className="mb-4 grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Buscar por nombre o categoría"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input
          placeholder="Filtrar por categoría"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <Input placeholder="Nueva habilidad" value={nuevaHabilidad} onChange={(e) => setNuevaHabilidad(e.target.value)} className="max-w-sm" />
        <Input placeholder="Categoría (opcional)" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="max-w-sm" />
        <Button onClick={handleCreate} disabled={crearHabilidad.isLoading}><Plus className="h-4 w-4 mr-2" />Agregar</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Categoría</TableHead><TableHead>Acciones</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && (!habilidades || habilidades.length === 0) ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-400">
                No hay habilidades para mostrar.
              </TableCell>
            </TableRow>
          ) : null}
          {habilidades?.map((h: any) => (
            <TableRow key={h.id_habilidad}>
              <TableCell>{h.id_habilidad}</TableCell>
              <TableCell>
                {editingId === h.id_habilidad ? (
                  <Input value={editingNombre} onChange={(e) => setEditingNombre(e.target.value)} />
                ) : (
                  h.nombre_habilidad
                )}
              </TableCell>
              <TableCell>
                {editingId === h.id_habilidad ? (
                  <Input value={editingCategoria} onChange={(e) => setEditingCategoria(e.target.value)} placeholder="Sin categoría" />
                ) : (
                  h.categoria || "-"
                )}
              </TableCell>
              <TableCell className="flex gap-2">
                {editingId === h.id_habilidad ? (
                  <>
                    <Button size="sm" onClick={saveEdit} disabled={editarHabilidad.isLoading}>Guardar</Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditingNombre("");
                        setEditingCategoria("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => startEdit(h)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => eliminarHabilidad.mutateAsync(h.id_habilidad)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardShell>
  );
}