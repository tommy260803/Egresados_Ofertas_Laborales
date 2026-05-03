"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { useState } from "react";

const ofertaSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().min(20, "La descripción debe ser más detallada"),
  modalidad: z.enum(["presencial", "remoto", "hibrido"]),
  ubicacion: z.string().optional(),
  salario_minimo: z.number().min(0).optional(),
  salario_maximo: z.number().min(0).optional(),
  tipo_salario: z.string().optional(),
  jornada: z.string().optional(),
  experiencia_requerida: z.string().optional(),
  fecha_cierre: z.string().optional(),
  habilidadesIds: z.array(z.number()).default([]),
});

type OfertaForm = z.infer<typeof ofertaSchema>;

export default function NuevaOfertaPage() {
  const router = useRouter();
  const { crearOferta } = useOfertas();
  const [selectedHabilidades, setSelectedHabilidades] = useState<{id: number, nombre: string}[]>([]);
  
  const { data: habilidadesDisponibles } = (trpc as any).habilidades.listar.useQuery();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<OfertaForm>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      modalidad: "presencial",
      habilidadesIds: [],
    }
  });

  const onSubmit = async (data: OfertaForm) => {
    try {
      await crearOferta.mutateAsync(data);
      router.push("/empresa/ofertas");
    } catch (error) {
      console.error("Error al publicar la oferta:", error);
    }
  };

  const addHabilidad = (h: {id_habilidad: number, nombre_habilidad: string}) => {
    if (selectedHabilidades.find(sh => sh.id === h.id_habilidad)) return;
    const newSelection = [...selectedHabilidades, { id: h.id_habilidad, nombre: h.nombre_habilidad }];
    setSelectedHabilidades(newSelection);
    setValue("habilidadesIds", newSelection.map(s => s.id));
  };

  const removeHabilidad = (id: number) => {
    const newSelection = selectedHabilidades.filter(h => h.id !== id);
    setSelectedHabilidades(newSelection);
    setValue("habilidadesIds", newSelection.map(s => s.id));
  };

  return (
    <DashboardShell>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Publicar Nueva Oferta</h2>
        <p className="text-slate-400">Atrae al mejor talento completando los detalles de la posición</p>
      </div>

      <div className="max-w-4xl rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-slate-200">Título de la posición *</Label>
              <Input 
                {...register("titulo")} 
                placeholder="Ej: Senior Fullstack Developer (Next.js / NestJS)"
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
              {errors.titulo && <p className="mt-1 text-xs text-rose-400">{errors.titulo.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label className="text-slate-200">Descripción detallada *</Label>
              <Textarea 
                {...register("descripcion")} 
                rows={6} 
                placeholder="Describe las responsabilidades, requisitos y beneficios..."
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
              {errors.descripcion && <p className="mt-1 text-xs text-rose-400">{errors.descripcion.message}</p>}
            </div>

            <div>
              <Label className="text-slate-200">Modalidad *</Label>
              <Select defaultValue="presencial" onValueChange={(val) => setValue("modalidad", val as any)}>
                <SelectTrigger className="mt-1.5 border-white/10 bg-white/5 text-slate-200">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="hibrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-200">Ubicación</Label>
              <Input 
                {...register("ubicacion")} 
                placeholder="Ej: Lima, Perú / Remoto"
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-200">Salario mínimo (opcional)</Label>
              <Input 
                type="number" 
                {...register("salario_minimo", { valueAsNumber: true })} 
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-200">Salario máximo (opcional)</Label>
              <Input 
                type="number" 
                {...register("salario_maximo", { valueAsNumber: true })} 
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-200">Experiencia requerida</Label>
              <Input 
                {...register("experiencia_requerida")} 
                placeholder="Ej: 3+ años, Junior, Senior..."
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
            </div>

            <div>
              <Label className="text-slate-200">Fecha de cierre</Label>
              <Input 
                type="date" 
                {...register("fecha_cierre")} 
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-slate-200">Habilidades requeridas</Label>
              <div className="mt-1.5 space-y-3">
                <Select onValueChange={(val) => {
                  const hab = (habilidadesDisponibles as any[])?.find(h => h.id_habilidad === parseInt(val));
                  if (hab) addHabilidad(hab);
                }}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-slate-200">
                    <SelectValue placeholder="Agregar habilidad..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(habilidadesDisponibles as any[])?.map(h => (
                      <SelectItem key={h.id_habilidad} value={h.id_habilidad.toString()}>
                        {h.nombre_habilidad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {selectedHabilidades.map(h => (
                    <Badge key={h.id} variant="secondary" className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1 py-1">
                      {h.nombre}
                      <X className="h-3 w-3 cursor-pointer hover:text-white" onClick={() => removeHabilidad(h.id)} />
                    </Badge>
                  ))}
                  {selectedHabilidades.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No se han seleccionado habilidades</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crearOferta.isLoading}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-8"
            >
              {crearOferta.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : "Publicar Oferta"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}