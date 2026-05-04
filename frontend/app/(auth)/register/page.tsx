"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

const registerSchema = z.discriminatedUnion("rol", [
  z.object({
    rol: z.literal("egresado"),
    email: z.string().email(),
    contrasena: z.string().min(6),
    nombres: z.string().min(1, "El nombre es obligatorio"),
    apellidos: z.string().min(1, "El apellido es obligatorio"),
    carrera: z.string().min(1, "La carrera es obligatoria"),
    documento_identidad: z.string().optional(),
    telefono: z.string().optional(),
    ciudad: z.string().optional(),
    universidad: z.string().optional(),
    anio_graduacion: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(1950).max(new Date().getFullYear()).optional()),
    perfil_laboral: z.string().optional(),
    direccion: z.string().optional(),
  }),
  z.object({
    rol: z.literal("empresa"),
    email: z.string().email("Email inválido"),
    contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    razon_social: z.string().min(1, "La razón social es obligatoria"),
    ruc: z.string().optional(),
    sector: z.string().optional(),
    ciudad_empresa: z.string().optional(),
    sitio_web: z.string().optional(),
    telefono_contacto: z.string().optional(),
    direccion_empresa: z.string().optional(),
    descripcion_empresa: z.string().optional(),
  }),
]);

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [selectedRol, setSelectedRol] = useState<"egresado" | "empresa">("egresado");

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { rol: "egresado" },
  });

  const getError = (field: string) => {
    const fieldError = (errors as Record<string, { message?: string } | undefined>)[field];
    return fieldError?.message;
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser.mutateAsync(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Crear cuenta</h2>
        <p className="mt-2 text-sm text-slate-300">Selecciona el tipo de usuario y completa tus datos.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <RadioGroup
          defaultValue="egresado"
          onValueChange={(val) => {
            const role = val as "egresado" | "empresa";
            setSelectedRol(role);
            setValue("rol", role);
          }}
          className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="egresado" id="egresado" />
            <Label htmlFor="egresado">Egresado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="empresa" id="empresa" />
            <Label htmlFor="empresa">Empresa</Label>
          </div>
        </RadioGroup>

        <div>
          <Label>Email</Label>
          <Input {...register("email")} />
          {getError("email") && <p className="text-sm text-rose-300">{getError("email")}</p>}
        </div>
        <div>
          <Label>Contraseña</Label>
          <Input type="password" {...register("contrasena")} />
          {getError("contrasena") && <p className="text-sm text-rose-300">{getError("contrasena")}</p>}
        </div>

        {selectedRol === "egresado" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombres *</Label>
                <Input {...register("nombres")} />
                {getError("nombres") && <p className="text-sm text-rose-300">{getError("nombres")}</p>}
              </div>
              <div>
                <Label>Apellidos *</Label>
                <Input {...register("apellidos")} />
                {getError("apellidos") && <p className="text-sm text-rose-300">{getError("apellidos")}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Carrera *</Label>
                <Input {...register("carrera")} />
                {getError("carrera") && <p className="text-sm text-rose-300">{getError("carrera")}</p>}
              </div>
              <div>
                <Label>Universidad</Label>
                <Input {...register("universidad")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Documento Identidad</Label>
                <Input {...register("documento_identidad")} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input {...register("telefono")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ciudad</Label>
                <Input {...register("ciudad")} />
              </div>
              <div>
                <Label>Año Graduación</Label>
                <Input type="number" {...register("anio_graduacion")} />
                {getError("anio_graduacion") && <p className="text-sm text-rose-300">{getError("anio_graduacion")}</p>}
              </div>
            </div>

            <div>
              <Label>Perfil Laboral (Resumen)</Label>
              <Textarea {...register("perfil_laboral")} placeholder="Ej: Desarrollador Fullstack con interés en..." />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input {...register("direccion")} />
            </div>
          </>
        )}

        {selectedRol === "empresa" && (
          <>
            <div>
              <Label>Razón social *</Label>
              <Input {...register("razon_social")} />
              {getError("razon_social") && <p className="text-sm text-rose-300">{getError("razon_social")}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RUC (opcional)</Label>
                <Input {...register("ruc")} />
              </div>
              <div>
                <Label>Sector</Label>
                <Input {...register("sector")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ciudad</Label>
                <Input {...register("ciudad_empresa")} />
              </div>
              <div>
                <Label>Sitio Web</Label>
                <Input {...register("sitio_web")} placeholder="https://..." />
              </div>
            </div>

            <div>
              <Label>Teléfono de Contacto</Label>
              <Input {...register("telefono_contacto")} />
            </div>

            <div>
              <Label>Dirección</Label>
              <Input {...register("direccion_empresa")} />
            </div>

            <div>
              <Label>Descripción de la Empresa</Label>
              <Textarea {...register("descripcion_empresa")} placeholder="Cuéntanos sobre tu empresa..." />
            </div>
          </>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-300">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}