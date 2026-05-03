"use client";

import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { OfertaTable } from "@/components/ofertas/OfertaTable";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AdminOfertasPage() {
  const [search, setSearch] = useState("");
  const { ofertas, isLoading } = useOfertas({ search });

  return (
    <DashboardShell>
      <h2 className="text-2xl font-bold mb-6">Ofertas Laborales</h2>
      <Input placeholder="Buscar oferta" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-6 max-w-sm" />
      <OfertaTable data={ofertas || []} isLoading={isLoading} />
    </DashboardShell>
  );
}