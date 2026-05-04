"use client";

import { useState, useEffect } from "react";
import { useEgresadoByUsuarioId } from "@/hooks/use-egresados";
import { useEgresados } from "@/hooks/use-egresados";
import { useAuth } from "@/hooks/use-auth";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EgresadoForm } from "@/components/egresados/EgresadoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabilidadesSelector } from "@/components/egresados/HabilidadesSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Download, X } from "lucide-react";

export default function PerfilEgresadoPage() {
  const { user } = useAuth();
  const { egresado: miPerfil, isLoading, refetch } = useEgresadoByUsuarioId(user?.userId || 0);
  const { update } = useEgresados();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);

  // Sincronizar cvUrl con miPerfil.cv_url cuando cambia
  useEffect(() => {
    if (miPerfil?.cv_url) {
      setCvUrl(miPerfil.cv_url);
    } else {
      setCvUrl(null);
    }
  }, [miPerfil?.cv_url]);

  if (!user?.userId) {
    return <div className="text-slate-300">Usuario no autenticado</div>;
  }

  if (isLoading) {
    return <div className="text-slate-300">Cargando perfil...</div>;
  }

  if (!miPerfil) {
    return <div className="text-slate-300">No se encontró el perfil</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF");
        return;
      }
      setCvFile(file);
    }
  };

  const handleUploadCv = async () => {
    if (!cvFile || !miPerfil) return;

    const formData = new FormData();
    formData.append('file', cvFile);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/cv/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el CV');
      }

      const data = await response.json();
      const uploadedUrl = data.url;

      await update.mutateAsync({ 
        id: miPerfil.id_egresado, 
        data: { cv_url: uploadedUrl } 
      });
      refetch();
      setCvUrl(uploadedUrl);
      setCvFile(null);
    } catch (error) {
      console.error('Error al subir CV:', error);
      alert('Error al subir el CV. Por favor, intenta nuevamente.');
    }
  };

  const handleRemoveCv = async () => {
    if (!miPerfil) return;
    await update.mutateAsync({ 
      id: miPerfil.id_egresado, 
      data: { cv_url: null } 
    });
    refetch();
    setCvUrl(null);
    setCvFile(null);
  };

  const handleSavePerfil = async (data: any) => {
    await update.mutateAsync({ id: miPerfil.id_egresado, data });
    refetch();
  };

  return (
    <DashboardShell>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-white">Mi Perfil</h2>
      <Tabs defaultValue="datos">
        <TabsList className="mb-4">
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="habilidades">Habilidades</TabsTrigger>
          <TabsTrigger value="cv">CV y documentos</TabsTrigger>
        </TabsList>
        <TabsContent value="datos">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
            <CardHeader><CardTitle>Editar información</CardTitle></CardHeader>
            <CardContent>
              <EgresadoForm 
                initialData={miPerfil} 
                isEdit={true}
                onSubmit={handleSavePerfil}
                isLoading={update.isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="habilidades">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
            <CardHeader><CardTitle>Mis habilidades</CardTitle></CardHeader>
            <CardContent>
              <HabilidadesSelector 
                egresadoId={miPerfil?.id_egresado} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cv">
          <Card className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
            <CardHeader><CardTitle>Currículum Vitae</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cvUrl ? (
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="font-medium">CV actual</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm text-blue-400 hover:underline"
                        onClick={() => window.open(cvUrl, '_blank')}
                      >
                        Ver CV en nueva pestaña
                      </Button>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleRemoveCv} disabled={update.isLoading}>
                    <X className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-dashed border-white/20 bg-white/5 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-300 mb-4">No has subido ningún CV aún</p>
                </div>
              )}
              
              <div className="space-y-3">
                <Label>Subir CV (PDF)</Label>
                <Input 
                  id="cv-file-input"
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                  className="text-slate-300"
                  style={{ display: 'none' }}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('cv-file-input') as HTMLInputElement;
                      if (input) input.click();
                    }}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seleccionar archivo
                  </Button>
                  <Button 
                    onClick={handleUploadCv} 
                    disabled={!cvFile || update.isLoading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir CV
                  </Button>
                </div>
                {cvFile && (
                  <p className="text-sm text-slate-300">
                    Archivo seleccionado: <span className="text-blue-400">{cvFile.name}</span>
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  Solo archivos PDF. Máximo 5MB.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}