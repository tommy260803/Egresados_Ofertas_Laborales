"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  contrasena: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
    } catch (error: any) {
      const msg =
        error?.message || error?.data?.message || "Credenciales inválidas";
      setError("root", { message: msg });
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">
          Acceso seguro
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Ingresa tus credenciales para continuar.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-rose-300">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contrasena">Contraseña</Label>
          <Input id="contrasena" type="password" {...register("contrasena")} />
          {errors.contrasena && (
            <p className="text-sm text-rose-300">{errors.contrasena.message}</p>
          )}
        </div>
        {errors.root && (
          <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {errors.root.message}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400"
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Ingresar"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-300">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="font-medium text-emerald-300 hover:text-emerald-200"
        >
          Regístrate
        </Link>
      </p>
    </>
  );
}
