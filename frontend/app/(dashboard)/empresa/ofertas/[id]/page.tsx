"use client";

import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Briefcase, DollarSign, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { trpc } from "@/lib/trpc/client";

export default function OfertaDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  
  const { oferta, isLoading } = useOfertas({ ofertaId: id });
  const { data: postulaciones, isLoading: isLoadingPostulaciones } = (trpc as any).ofertas.listarPostulacionesPorOferta.useQuery({ ofertaId: id });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!oferta) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white">Oferta no encontrada</h2>
          <Button asChild className="mt-4">
            <Link href="/empresa/ofertas">Volver a mis ofertas</Link>
          </Button>
        </div>
      </DashboardShell>
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
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-white">{oferta.titulo}</h2>
              <Badge variant={oferta.activa ? "default" : "secondary"} className={oferta.activa ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}>
                {oferta.activa ? "Activa" : "Cerrada"}
              </Badge>
            </div>
            <p className="text-slate-400">Publicada el {format(new Date(oferta.created_at), "PPP", { locale: es })}</p>
          </div>
          
          <Button asChild className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
            <Link href={`/empresa/ofertas/editar/${id}`}>Editar Oferta</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Descripción del puesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-300 whitespace-pre-wrap">
                {oferta.descripcion}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Postulaciones Recibidas ({postulaciones?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPostulaciones ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : postulaciones && postulaciones.length > 0 ? (
                <div className="space-y-4">
                  {postulaciones.map((p: any) => (
                    <div key={p.id_postulacion} className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-white/5">
                      <div>
                        <p className="font-medium text-white">{p.egresado.nombres} {p.egresado.apellidos}</p>
                        <p className="text-xs text-slate-400">{p.egresado.carrera}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="capitalize">{p.estado_actual}</Badge>
                        <Button variant="outline" size="sm" asChild className="border-white/10 text-slate-300 hover:bg-white/5">
                          <Link href={`/empresa/postulaciones-recibidas?id=${p.id_postulacion}`}>Ver Perfil</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Aún no hay postulantes para esta oferta.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Detalles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Ubicación</p>
                  <p className="text-sm text-slate-400">{oferta.ubicacion || "No especificada"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Modalidad</p>
                  <p className="text-sm text-slate-400 capitalize">{oferta.modalidad}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Salario</p>
                  <p className="text-sm text-slate-400">
                    {oferta.salario_minimo && oferta.salario_maximo 
                      ? `$${oferta.salario_minimo} - $${oferta.salario_maximo}`
                      : oferta.salario_minimo ? `Desde $${oferta.salario_minimo}`
                      : oferta.salario_maximo ? `Hasta $${oferta.salario_maximo}`
                      : "No especificado"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Fecha de Cierre</p>
                  <p className="text-sm text-slate-400">
                    {oferta.fecha_cierre 
                      ? format(new Date(oferta.fecha_cierre), "PPP", { locale: es })
                      : "Abierta hasta completar"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {oferta.habilidades?.map((h: any) => (
                  <Badge key={h.id_habilidad} variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    {h.nombre_habilidad}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
