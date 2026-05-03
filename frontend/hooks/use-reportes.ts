import { useState } from "react";
import { getAccessTokenCookie } from "@/lib/auth/cookies";

export function useReportes() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generarReporteDirecto = async (params: { tipo: string; parametros: any }) => {
    setIsGenerating(true);
    try {
      console.log('Frontend - params recibidos:', params);
      console.log('Frontend - JSON.stringify(params):', JSON.stringify(params));
      
      const token = getAccessTokenCookie();
      const bodyString = JSON.stringify(params);
      console.log('Frontend - body a enviar:', bodyString);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reportes/generar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: bodyString,
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData?.message || errorData?.error || 'Error al generar el reporte';
        console.error('Backend error:', errorData);
        throw new Error(errorMessage);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${params.tipo}_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo generar el reporte. Por favor, intente de nuevo.';
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generarReporteDirecto,
    isGenerating,
  };
}