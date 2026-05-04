"use client";

import { useRouter } from "next/navigation";
import { useEgresados } from "@/hooks/use-egresados";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { EgresadoForm } from "@/components/egresados/EgresadoForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NuevoEgresadoPage() {
  const router = useRouter();
  const { invitar } = useEgresados();

  return (
    <DashboardShell>
      <Link href="/admin/egresados" className="mb-4 inline-block">
        <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a tabla</Button>
      </Link>
      <Card>
        <CardHeader><CardTitle>Nuevo egresado e invitación</CardTitle></CardHeader>
        <CardContent>
          <EgresadoForm
            initialData={{}}
            onSubmit={async (data: any) => {
              await invitar.mutateAsync(data);
              router.push("/admin/egresados");
            }}
            isLoading={invitar.isPending}
          />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
