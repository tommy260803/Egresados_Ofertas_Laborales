import { trpc } from "@/lib/trpc/client";

interface UseOfertasParams {
  ofertaId?: number;
  postulacionId?: number;
  misPostulaciones?: boolean;
  misOfertas?: boolean;
  filtrosMisOfertas?: { titulo?: string; activa?: string | boolean };
  postulacionesEmpresa?: boolean;
  search?: string;
  empresaId?: number;
}

export function useOfertas(params?: UseOfertasParams) {
  // Siempre habilitar la query de listado cuando no se solicita detalle específico
  const shouldEnableList = !params?.ofertaId && !params?.misPostulaciones && !params?.postulacionesEmpresa && !params?.postulacionId && !params?.misOfertas;
  
  const query = (trpc as any).ofertas.list.useQuery(undefined, { enabled: shouldEnableList || shouldEnableList === undefined });
  const ofertaDetalle = (trpc as any).ofertas.byId.useQuery(params?.ofertaId || 0, { enabled: !!params?.ofertaId });
  const misPostulaciones = (trpc as any).ofertas.misPostulaciones.useQuery(undefined, { enabled: !!params?.misPostulaciones });
  const misOfertas = (trpc as any).ofertas.misOfertas.useQuery(params?.filtrosMisOfertas, { enabled: !!params?.misOfertas });
  const postulacionesEmpresa = (trpc as any).ofertas.listarPostulacionesEmpresa.useQuery(undefined, { enabled: !!params?.postulacionesEmpresa });
  const historialPostulacion = (trpc as any).ofertas.historialPostulacion.useQuery(params?.postulacionId || 0, { enabled: !!params?.postulacionId });

  const crearOferta = (trpc as any).ofertas.create.useMutation();
  const updateOferta = (trpc as any).ofertas.update.useMutation();
  const postular = (trpc as any).ofertas.postular.useMutation();
  const cambiarEstado = (trpc as any).ofertas.cambiarEstadoPostulacion.useMutation();
  const eliminarOferta = (trpc as any).ofertas.remove.useMutation();
  const alternarEstado = (trpc as any).ofertas.alternarEstado.useMutation();

  // isLoading solo debe ser true para la query relevante
  const isLoading = params?.ofertaId ? ofertaDetalle.isLoading : 
                    params?.misPostulaciones ? misPostulaciones.isLoading :
                    params?.misOfertas ? misOfertas.isLoading :
                    params?.postulacionId ? historialPostulacion.isLoading :
                    query.isLoading;

  return {
    ofertas: query.data,
    oferta: ofertaDetalle.data,
    misPostulaciones: misPostulaciones.data,
    misOfertas: misOfertas.data,
    postulaciones: postulacionesEmpresa.data,
    historial: historialPostulacion.data,
    isLoading,
    isError: query.isError || ofertaDetalle.isError || misPostulaciones.isError || historialPostulacion.isError || misOfertas.isError,
    error: query.error || ofertaDetalle.error || misPostulaciones.error || historialPostulacion.error || misOfertas.error,
    crearOferta,
    updateOferta,
    postular,
    cambiarEstado,
    eliminarOferta,
    alternarEstado,
  };
}