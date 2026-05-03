"use client";

import { useState } from "react";
import { useEgresados } from "@/hooks/use-egresados";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EgresadoTable } from "@/components/egresados/EgresadoTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function AdminEgresadosPage() {
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const { egresados, isLoading, remove, refetch } = useEgresados({ search, carrera });

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("¿Seguro que deseas eliminar este egresado?");
    if (!confirmed) return;
    await remove.mutateAsync(id);
    await refetch();
  };

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Gestión de Egresados</h2>
        <Link href="/admin/egresados/nuevo">
          <Button><Plus className="mr-2 h-4 w-4" />Nuevo Egresado</Button>
        </Link>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar por nombre o email" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Input placeholder="Filtrar por carrera" value={carrera} onChange={(e) => setCarrera(e.target.value)} className="w-64" />
      </div>
      <EgresadoTable data={egresados || []} isLoading={isLoading} onDelete={handleDelete} />
    </DashboardShell>
  );
}