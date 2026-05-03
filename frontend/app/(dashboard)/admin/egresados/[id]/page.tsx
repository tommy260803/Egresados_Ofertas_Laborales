"use client";

import { useParams } from "next/navigation";
import { useEgresadoById } from "@/hooks/use-egresados";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EgresadoDetallePage() {
  const { id } = useParams();
  const { egresado, isLoading } = useEgresadoById(Number(id));

  if (isLoading) return <div>Cargando...</div>;
  if (!egresado) return <div>No encontrado</div>;

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/egresados">
          <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a tabla</Button>
        </Link>
        <Link href={`/admin/egresados/${egresado.id_egresado}/editar`}>
          <Button>Editar</Button>
        </Link>
      </div>
      <Card>
        <CardHeader><CardTitle>Detalle del egresado</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">ID</p>
              <p>{egresado.id_egresado || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Nombres</p>
              <p>{egresado.nombres || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Apellidos</p>
              <p>{egresado.apellidos || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p>{egresado.usuario?.email || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Documento de identidad</p>
              <p>{egresado.documento_identidad || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Fecha de nacimiento</p>
              <p>{egresado.fecha_nacimiento ? new Date(egresado.fecha_nacimiento).toLocaleDateString() : "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Genero</p>
              <p>{egresado.genero || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Telefono</p>
              <p>{egresado.telefono || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Ciudad</p>
              <p>{egresado.ciudad || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">Direccion</p>
              <p>{egresado.direccion || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Carrera</p>
              <p>{egresado.carrera || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Universidad</p>
              <p>{egresado.universidad || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Año de egreso</p>
              <p>{egresado.anio_graduacion || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">Perfil laboral</p>
              <p>{egresado.perfil_laboral || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">Habilidades</p>
              {egresado.habilidades?.length ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {egresado.habilidades.map((habilidad: any) => (
                    <span key={habilidad.id_habilidad} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                      {habilidad.nombre_habilidad}
                    </span>
                  ))}
                </div>
              ) : (
                <p>-</p>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">CV</p>
              {egresado.cv_url ? (
                <a href={egresado.cv_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-400 hover:underline">
                  Ver o descargar CV <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">LinkedIn</p>
              {egresado.linkedin_url ? (
                <a href={egresado.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-400 hover:underline">
                  Abrir perfil de LinkedIn <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">GitHub</p>
              {egresado.github_url ? (
                <a href={egresado.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-400 hover:underline">
                  Abrir perfil de GitHub <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              ) : (
                <p>-</p>
              )}
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-slate-400">Foto de perfil URL</p>
              <p className="break-all">{egresado.foto_url || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}