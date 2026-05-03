"use client";

import { useParams, useRouter } from "next/navigation";
import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, DollarSign, Calendar, Clock, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DetalleOfertaEgresadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { oferta, isLoading, postular, misPostulaciones } = useOfertas({ ofertaId: Number(id), misPostulaciones: true });

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="text-slate-300 text-center py-8">Cargando detalle de oferta...</div>
      </DashboardShell>
    );
  }

  if (!oferta) {
    return (
      <DashboardShell>
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <Card className="border-white/10 bg-white/5 text-white">
            <CardContent className="text-center py-8">
              <p className="text-slate-300">Oferta no encontrada</p>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  const haPostulado = misPostulaciones?.some((p: any) => p.ofertaIdOferta === oferta.id_oferta);
  const ofertaCerrada = !oferta.activa || (oferta.fecha_cierre && new Date(oferta.fecha_cierre) < new Date());

  const handlePostular = async () => {
    if (!oferta.activa || haPostulado || ofertaCerrada) return;
    try {
      await postular.mutateAsync({ id_oferta: oferta.id_oferta });
      alert('Postulación exitosa');
    } catch (error) {
      alert('Error al postular. Por favor, intenta nuevamente.');
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{oferta.titulo}</CardTitle>
                <p className="text-slate-300 mt-1">{oferta.empresa?.razon_social}</p>
              </div>
              <Badge variant={oferta.activa ? "default" : "secondary"}>
                {oferta.activa ? "Activa" : "Cerrada"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {oferta.ubicacion || "No especificada"}</div>
              <div className="flex items-center gap-2"><Building className="w-4 h-4" /> {oferta.modalidad}</div>
              <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> ${oferta.salario_minimo} - ${oferta.salario_maximo}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Publicada: {new Date(oferta.fecha_publicacion).toLocaleDateString()}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Cierre: {oferta.fecha_cierre ? new Date(oferta.fecha_cierre).toLocaleDateString() : "Sin fecha"}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="whitespace-pre-wrap">{oferta.descripcion}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Habilidades requeridas</h3>
              <div className="flex flex-wrap gap-2">
                {oferta.habilidades?.map((h: any) => (
                  <Badge key={h.id_habilidad} variant="outline">{h.nombre_habilidad}</Badge>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              {ofertaCerrada ? (
                <Button disabled className="w-full">Oferta cerrada</Button>
              ) : haPostulado ? (
                <Button disabled className="w-full">Ya postulaste</Button>
              ) : (
                <Button 
                  onClick={handlePostular} 
                  disabled={postular.isLoading}
                  className="w-full"
                >
                  {postular.isLoading ? 'Procesando...' : 'Postularme'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
