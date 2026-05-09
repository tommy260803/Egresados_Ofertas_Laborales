"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function CompletarRegistroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: validacion, isLoading: isValidating } =
    trpc.egresados.validarToken.useQuery(
      { token: token || "" },
      { enabled: !!token },
    );

  const completarRegistro = trpc.egresados.completarRegistro.useMutation({
    onSuccess: () => {
      alert("Tu contraseña ha sido establecida. Ya puedes iniciar sesión.");
      router.push("/login");
    },
    onError: (err) => {
      alert(err.message || "No se pudo completar el registro.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (contrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (token) {
      completarRegistro.mutate({ token, contrasena });
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle /> Token faltante
            </CardTitle>
            <CardDescription className="text-slate-400">
              No se proporcionó un token de invitación válido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")} className="w-full">
              Ir al login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Validando invitación...</p>
        </div>
      </div>
    );
  }

  if (!validacion?.valido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle /> Invitación inválida
            </CardTitle>
            <CardDescription className="text-slate-400">
              {validacion?.mensaje ||
                "El enlace de invitación es inválido o ha expirado."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/login")} className="w-full">
              Ir al login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-white shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4 text-indigo-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <CardTitle className="text-2xl text-center">
            Completar Registro
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Establece tu contraseña para activar tu cuenta como{" "}
            <strong>{validacion.email}</strong>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-md text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="contrasena">Nueva Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarContrasena">Confirmar Contraseña</Label>
              <Input
                id="confirmarContrasena"
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-800 border-slate-700 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={completarRegistro.isPending}
            >
              {completarRegistro.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activando cuenta...
                </>
              ) : (
                "Activar mi cuenta"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function CompletarRegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      }
    >
      <CompletarRegistroContent />
    </Suspense>
  );
}
