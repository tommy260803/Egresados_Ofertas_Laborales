"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ExternalLink } from "lucide-react";

const egresadoSchema = z.object({
  email: z.string().email("Email inválido").min(1, "El email es obligatorio"),
  nombres: z.string().min(1, "El nombre es obligatorio"),
  apellidos: z.string().min(1, "El apellido es obligatorio"),
  documento_identidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  carrera: z.string().min(1, "La carrera es obligatoria"),
  universidad: z.string().optional(),
  anio_graduacion: z.number().optional(),
  perfil_laboral: z.string().optional(),
  cv_url: z.string().optional(),
});

type EgresadoFormData = z.infer<typeof egresadoSchema>;

export function EgresadoForm({ initialData, onSubmit, isLoading, isEdit = false }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm<EgresadoFormData>({
    resolver: zodResolver(egresadoSchema),
    defaultValues: {
      ...initialData,
      email: initialData?.usuario?.email || initialData?.email || "",
    },
  });

  const cvUrl = initialData?.cv_url;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className={isEdit ? "opacity-50" : ""}>
          <Label>Email *</Label>
          <Input {...register("email")} type="email" placeholder="ejemplo@correo.com" readOnly={isEdit} />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>
        </div>
        <div className="hidden md:block"></div> {/* Espaciador */}
        <div><Label>Nombres *</Label><Input {...register("nombres")} /><p className="text-red-500 text-sm">{errors.nombres?.message}</p></div>
        <div><Label>Apellidos *</Label><Input {...register("apellidos")} /><p className="text-red-500 text-sm">{errors.apellidos?.message}</p></div>
        <div><Label>Documento</Label><Input {...register("documento_identidad")} /></div>
        <div><Label>Fecha nacimiento</Label><Input type="date" {...register("fecha_nacimiento")} /></div>
        <div><Label>Teléfono</Label><Input {...register("telefono")} /></div>
        <div><Label>Ciudad</Label><Input {...register("ciudad")} /></div>
        <div><Label>Carrera *</Label><Input {...register("carrera")} /><p className="text-red-500 text-sm">{errors.carrera?.message}</p></div>
        <div><Label>Universidad</Label><Input {...register("universidad")} /></div>
        <div><Label>Año graduación</Label><Input type="number" {...register("anio_graduacion", { valueAsNumber: true })} /></div>
        <div className="col-span-2">
          <Label>CV</Label>
          <div className="flex items-center gap-2 mt-1">
            {cvUrl ? (
              <Button 
                type="button"
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.open(cvUrl, '_blank')}
              >
                <FileText className="w-4 h-4" />
                Ver CV
                <ExternalLink className="w-3 h-3" />
              </Button>
            ) : (
              <span className="text-sm text-slate-400">No has subido un CV aún</span>
            )}
          </div>
          <Input {...register("cv_url")} className="hidden" />
        </div>
      </div>
      <div><Label>Perfil laboral</Label><Textarea {...register("perfil_laboral")} rows={4} /></div>
      <div><Label>Dirección</Label><Textarea {...register("direccion")} /></div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear e invitar egresado"}
      </Button>
    </form>
  );
}