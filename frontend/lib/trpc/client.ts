import { createTRPCReact } from "@trpc/react-query";

// Define el router del frontend basado en los endpoints del backend
// Este archivo debe mantenerse sincronizado con el backend o generarse automáticamente
export const trpc = createTRPCReact<{
  auth: {
    login: {
      input: { email: string; contrasena: string };
      output: { accessToken: string; refreshToken: string; user: { id: number; email: string; rol: string } };
    };
    register: {
      input: { email: string; contrasena: string; rol: string; nombres?: string; apellidos?: string; carrera?: string; razon_social?: string; ruc?: string };
      output: { accessToken: string; refreshToken: string; user: { id: number; email: string; rol: string } };
    };
    refresh: {
      input: { refreshToken: string };
      output: { accessToken: string; refreshToken: string };
    };
  };
  dashboard: {
    adminKpis: { input?: { from?: string; to?: string; carrera?: string; sector?: string }; output: unknown };
    egresadoKpis: { input: undefined; output: unknown };
    empresaKpis: { input: undefined; output: unknown };
    tendencias: { input?: { from?: string; to?: string; carrera?: string; sector?: string }, output: unknown };
    topHabilidades: { input?: { from?: string; to?: string; carrera?: string; sector?: string }; output: unknown };
    ofertasRecomendadas: { input: undefined; output: unknown };
  };
  egresados: {
    list: { input?: { search?: string; carrera?: string; ciudad?: string; habilidad?: number } | undefined; output: unknown };
    byId: { input: number; output: unknown };
    create: { input: unknown; output: unknown };
    update: { input: { id: number; data: unknown }; output: unknown };
    remove: { input: number; output: unknown };
    habilidades: { input: { egresadoId: number }; output: unknown };
    agregarHabilidad: { input: { egresadoId: number; habilidadId: number }; output: unknown };
    eliminarHabilidad: { input: { egresadoId: number; habilidadId: number }; output: unknown };
  };
  ofertas: {
    list: { input?: unknown; output: unknown };
    byId: { input: number; output: unknown };
    create: { input: unknown; output: unknown };
    update: { input: { id: number; data: unknown }; output: unknown };
    remove: { input: number; output: unknown };
    misOfertas: { input?: { titulo?: string; activa?: string | boolean }; output: any[] };
    alternarEstado: { input: number; output: unknown };
    postular: { input: unknown; output: unknown };
    cambiarEstadoPostulacion: { input: { postulacionId: number; estado: string; motivo?: string }; output: unknown };
    listarPostulacionesPorOferta: { input: { ofertaId: number }; output: any[] };
    listarPostulacionesEmpresa: { input: unknown; output: any[] };
    misPostulaciones: { input: unknown; output: any[] };
    historialPostulacion: { input: number; output: any[] };
  };
  habilidades: {
    listar: { input?: { search?: string; categoria?: string }; output: unknown };
    crear: { input: { nombre_habilidad: string; categoria?: string }; output: unknown };
    editar: { input: { id: number; data: { nombre_habilidad?: string; categoria?: string } }; output: unknown };
    eliminar: { input: number; output: unknown };
  };
  notificaciones: {
    listarTodas: { input: { userId: number }; output: unknown };
    listarNoLeidas: { input: { userId: number }; output: unknown };
    marcarLeida: { input: { notificacionId: number; userId: number }; output: unknown };
  };
  reportes: {
    solicitar: {
      input: {
        tipo:
          | "egresados_por_carrera"
          | "ofertas_activas"
          | "postulaciones_por_oferta"
          | "empleabilidad_por_carrera"
          | "habilidades_mas_demandadas";
        parametros: { fechaDesde?: string; fechaHasta?: string; carrera?: string; sector?: string; ofertaId?: number };
      };
      output: unknown;
    };
    estado: { input: number; output: unknown };
    misReportes: { output: unknown };
  };
}>();
