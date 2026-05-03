import { trpc } from "@/lib/trpc/client";
import { useState } from "react";
import { getAccessTokenCookie } from "@/lib/auth/cookies";

export function useReportes() {
  const utils = trpc.useUtils();
  const [reporteId, setReporteId] = useState<number | null>(null);
  const solicitarReporte = trpc.reportes.solicitar.useMutation({
    onSuccess: async (data: any) => {
      setReporteId(data.id_reporte);
      await utils.reportes.misReportes.invalidate();
    },
  });
  const estadoQuery = trpc.reportes.estado.useQuery(reporteId || 0, {
    enabled: !!reporteId,
    refetchInterval: (query) => {
      const estado = query?.state?.data?.estado;
      if (estado === "completado" || estado === "fallido") return false;
      return 2000;
    },
  });
  const misReportes = trpc.reportes.misReportes.useQuery();

  const downloadReporte = async (id: number) => {
    const token = getAccessTokenCookie();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reportes/descargar/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `reporte_${id}.pdf`; a.click();
  };
  return {
    solicitarReporte,
    reporteEstado: estadoQuery.data,
    reportes: misReportes.data || [],
    downloadReporte,
    isLoading: solicitarReporte.isLoading || estadoQuery.isLoading,
  };
}