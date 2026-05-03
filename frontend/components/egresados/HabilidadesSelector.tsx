"use client";

import { useState } from "react";
import { useHabilidades } from "@/hooks/use-habilidades";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface HabilidadesSelectorProps {
  egresadoId: number;
}

export function HabilidadesSelector({ egresadoId }: HabilidadesSelectorProps) {
  const { habilidades, catalogo, agregarHabilidad, eliminarHabilidad } = useHabilidades(egresadoId);
  const [selectedHabilidad, setSelectedHabilidad] = useState("");

  if (!egresadoId) {
    return <p className="text-slate-300">Cargando habilidades...</p>;
  }

  const handleAdd = async () => {
    if (selectedHabilidad && egresadoId) {
      await agregarHabilidad.mutateAsync({ egresadoId, habilidadId: Number(selectedHabilidad) });
      setSelectedHabilidad("");
    }
  };

  const habilidadesDisponibles = catalogo.filter(
    (habilidad: { id_habilidad: number }) =>
      !habilidades.some((actual: { id_habilidad: number }) => actual.id_habilidad === habilidad.id_habilidad)
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select onValueChange={setSelectedHabilidad} value={selectedHabilidad}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Seleccionar habilidad" /></SelectTrigger>
          <SelectContent>
            {habilidadesDisponibles.map((h: { id_habilidad: number; nombre_habilidad: string }) => (
              <SelectItem key={h.id_habilidad} value={h.id_habilidad.toString()}>{h.nombre_habilidad}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd} disabled={agregarHabilidad.isLoading}>Agregar</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {habilidades.map((h: { id_habilidad: number; nombre_habilidad: string }) => (
          <Badge key={h.id_habilidad} variant="secondary" className="px-3 py-1">
            {h.nombre_habilidad}
            <button
              onClick={() => eliminarHabilidad.mutateAsync({ egresadoId, habilidadId: h.id_habilidad })}
              className="ml-2 text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}