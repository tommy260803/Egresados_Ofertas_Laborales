"use client";

import { useParams, useRouter } from "next/navigation";
import { useEgresadoById, useEgresados } from "@/hooks/use-egresados";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EgresadoForm } from "@/components/egresados/EgresadoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditarEgresadoPage() {
  const { id } = useParams();
  const router = useRouter();
  const egresadoId = Number(id);
  const { egresado, isLoading } = useEgresadoById(egresadoId);
  const { update } = useEgresados();

  if (isLoading) return <div>Cargando...</div>;
  if (!egresado) return <div>No encontrado</div>;

  return (
    <DashboardShell>
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/admin/egresados">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a tabla
        </Link>
      </Button>
      <Card>
        <CardHeader><CardTitle>Editar egresado</CardTitle></CardHeader>
        <CardContent>
          <EgresadoForm
            initialData={egresado}
            isEdit={true}
            onSubmit={async (data: any) => {
              await update.mutateAsync({ id: egresado.id_egresado, data });
              router.push(`/admin/egresados/${egresado.id_egresado}`);
            }}
            isLoading={update.isLoading}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
