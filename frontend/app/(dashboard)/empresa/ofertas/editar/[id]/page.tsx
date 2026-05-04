"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const ofertaSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().min(20, "La descripción debe ser más detallada"),
  modalidad: z.enum(["presencial", "remoto", "hibrido"]),
  ubicacion: z.string().optional(),
  salario_minimo: z.number().min(0).optional().nullable(),
  salario_maximo: z.number().min(0).optional().nullable(),
  tipo_salario: z.string().optional().nullable(),
  jornada: z.string().optional().nullable(),
  experiencia_requerida: z.string().optional().nullable(),
  fecha_cierre: z.string().optional().nullable(),
  habilidadesIds: z.array(z.number()).default([]),
});

type OfertaForm = z.infer<typeof ofertaSchema>;

export default function EditarOfertaPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  
  const { oferta, isLoading: isLoadingOferta } = useOfertas({ ofertaId: id });
  const updateOferta = (trpc as any).ofertas.update.useMutation();
  const [selectedHabilidades, setSelectedHabilidades] = useState<{id: number, nombre: string}[]>([]);
  
  const { data: habilidadesDisponibles } = (trpc as any).habilidades.listar.useQuery();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<OfertaForm>({
    resolver: zodResolver(ofertaSchema),
  });

  useEffect(() => {
    if (oferta) {
      reset({
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        modalidad: oferta.modalidad,
        ubicacion: oferta.ubicacion,
        salario_minimo: oferta.salario_minimo,
        salario_maximo: oferta.salario_maximo,
        tipo_salario: oferta.tipo_salario,
        jornada: oferta.jornada,
        experiencia_requerida: oferta.experiencia_requerida,
        fecha_cierre: oferta.fecha_cierre ? new Date(oferta.fecha_cierre).toISOString().split('T')[0] : null,
        habilidadesIds: oferta.habilidades?.map((h: any) => h.id_habilidad) || [],
      });
      setSelectedHabilidades(oferta.habilidades?.map((h: any) => ({ id: h.id_habilidad, nombre: h.nombre_habilidad })) || []);
    }
  }, [oferta, reset]);

  const onSubmit = async (data: OfertaForm) => {
    try {
      await updateOferta.mutateAsync({ id, data });
      router.push("/empresa/ofertas");
    } catch (error) {
      console.error("Error al actualizar la oferta:", error);
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

  if (isLoadingOferta) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-slate-400 hover:text-white mb-4">
          <Link href="/empresa/ofertas">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis ofertas
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight text-white">Editar Oferta</h2>
        <p className="text-slate-400">Actualiza los detalles de la posición para atraer candidatos</p>
      </div>

      <div className="max-w-4xl rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label className="text-slate-200">Título de la posición *</Label>
              <Input 
                {...register("titulo")} 
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
              {errors.titulo && <p className="mt-1 text-xs text-rose-400">{errors.titulo.message}</p>}
            </div>

            <div className="md:col-span-2">
              <Label className="text-slate-200">Descripción detallada *</Label>
              <Textarea 
                {...register("descripcion")} 
                rows={6} 
                className="mt-1.5 border-white/10 bg-white/5 text-slate-200"
              />
              {errors.descripcion && <p className="mt-1 text-xs text-rose-400">{errors.descripcion.message}</p>}
            </div>

            <div>
              <Label className="text-slate-200">Modalidad *</Label>
              <Select value={watch("modalidad")} onValueChange={(val) => setValue("modalidad", val as any)}>
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
              disabled={updateOferta.isLoading}
              className="bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-8"
            >
              {updateOferta.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
