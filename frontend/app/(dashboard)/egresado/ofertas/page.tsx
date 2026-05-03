"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOfertas } from "@/hooks/use-ofertas";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function OfertasEgresadoPage() {
  const router = useRouter();
  const { ofertas, isLoading, isError, error } = useOfertas();
  const [search, setSearch] = useState("");
  const [modalidad, setModalidad] = useState("todas");
  const [ubicacion, setUbicacion] = useState("");

  const filteredOfertas = (ofertas || []).filter((oferta: any) => {
    const matchesSearch = !search || 
      oferta.titulo.toLowerCase().includes(search.toLowerCase()) ||
      oferta.empresa?.razon_social?.toLowerCase().includes(search.toLowerCase());
    
    // Normalizar modalidad para comparar con los valores del backend: presencial, remoto, hibrido
    const normalizeModalidad = (m: string) => {
      if (!m) return '';
      return m.trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quitar tildes
        .replace(/s$/, ''); // quitar 's' final por si acaso
    };
    const ofertaNormalized = normalizeModalidad(oferta.modalidad);
    const filterNormalized = normalizeModalidad(modalidad);
    const matchesModalidad = modalidad === "todas" || ofertaNormalized === filterNormalized;
    
    const matchesUbicacion = !ubicacion || 
      oferta.ubicacion?.toLowerCase().includes(ubicacion.toLowerCase());
    
    return matchesSearch && matchesModalidad && matchesUbicacion;
  });

  return (
    <DashboardShell>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">Ofertas Laborales</h2>
      
      <Card className="mb-6 border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Búsqueda</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar por título o empresa..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-slate-300"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Modalidad</Label>
              <Select value={modalidad} onValueChange={setModalidad}>
                <SelectTrigger className="mt-1 text-slate-300">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="remoto">Remoto</SelectItem>
                  <SelectItem value="híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Ubicación</Label>
              <Input 
                placeholder="Ciudad o país..." 
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                className="mt-1 text-slate-300"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setSearch(""); setModalidad("todas"); setUbicacion(""); }}>
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {isError ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="text-center py-8">
            <p className="text-red-400">Error al cargar ofertas: {String(error)}</p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-slate-300 text-center py-8">Cargando ofertas...</div>
      ) : filteredOfertas.length === 0 ? (
        <Card className="border-white/10 bg-white/5 text-white">
          <CardContent className="text-center py-8">
            <p className="text-slate-300">
              {ofertas && ofertas.length > 0 
                ? "No se encontraron ofertas con los filtros actuales." 
                : "No hay ofertas disponibles en este momento."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOfertas.map((oferta: any) => (
            <Card key={oferta.id_oferta} className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">{oferta.titulo}</CardTitle>
                <p className="text-sm text-slate-300">{oferta.empresa?.razon_social}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-slate-400">Modalidad:</span> {oferta.modalidad}
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">Ubicación:</span> {oferta.ubicacion || "No especificada"}
                </div>
                <div className="text-sm">
                  <span className="text-slate-400">Salario:</span> ${oferta.salario_minimo} - ${oferta.salario_maximo}
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => router.push(`/egresado/ofertas/${oferta.id_oferta}`)}
                >
                  Ver detalle
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
