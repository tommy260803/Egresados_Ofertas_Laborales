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
import Link from "next/link";

const registerSchema = z.discriminatedUnion("rol", [
  z.object({
    rol: z.literal("egresado"),
    email: z.string().email(),
    contrasena: z.string().min(6),
    nombres: z.string().min(1),
    apellidos: z.string().min(1),
    carrera: z.string().min(1),
  }),
  z.object({
    rol: z.literal("empresa"),
    email: z.string().email(),
    contrasena: z.string().min(6),
    razon_social: z.string().min(1),
    ruc: z.string().optional(),
  }),
]);

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [selectedRol, setSelectedRol] = useState<"egresado" | "empresa">("egresado");

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
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
          onValueChange={(val) => setSelectedRol(val as "egresado" | "empresa")}
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
            <div>
              <Label>Nombres</Label>
              <Input {...register("nombres")} />
              {getError("nombres") && <p className="text-red-500">{getError("nombres")}</p>}
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input {...register("apellidos")} />
              {getError("apellidos") && <p className="text-red-500">{getError("apellidos")}</p>}
            </div>
            <div>
              <Label>Carrera</Label>
              <Input {...register("carrera")} />
              {getError("carrera") && <p className="text-red-500">{getError("carrera")}</p>}
            </div>
          </>
        )}

        {selectedRol === "empresa" && (
          <>
            <div>
              <Label>Razón social</Label>
              <Input {...register("razon_social")} />
              {getError("razon_social") && <p className="text-red-500">{getError("razon_social")}</p>}
            </div>
            <div>
              <Label>RUC (opcional)</Label>
              <Input {...register("ruc")} />
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