import { trpc } from "@/lib/trpc/client";

// Para usar en el perfil de egresado (habilidades del egresado)
export function useHabilidades(egresadoId?: number) {
  const utils = trpc.useUtils();
  const habilidadesEgresado = trpc.egresados.habilidades.useQuery(
    { egresadoId: egresadoId || 0 },
    { enabled: !!egresadoId }
  );
  const catalogo = trpc.habilidades.listar.useQuery();
  const agregarHabilidad = trpc.egresados.agregarHabilidad.useMutation({
    onSuccess: () => {
      habilidadesEgresado.refetch();
      utils.egresados.list.invalidate();
      utils.egresados.byId.invalidate();
    },
  });
  const eliminarHabilidad = trpc.egresados.eliminarHabilidad.useMutation({
    onSuccess: () => {
      habilidadesEgresado.refetch();
      utils.egresados.list.invalidate();
      utils.egresados.byId.invalidate();
    },
  });
  return {
    habilidades: habilidadesEgresado.data ?? [],
    catalogo: catalogo.data ?? [],
    agregarHabilidad,
    eliminarHabilidad,
  };
}

// Para administrar el catálogo global
export function useHabilidadesGlobal(filters?: { search?: string; categoria?: string }) {
  const utils = trpc.useUtils();
  const { data: habilidades, isLoading } = trpc.habilidades.listar.useQuery(filters);
  const crearHabilidad = trpc.habilidades.crear.useMutation({
    onSuccess: () => {
      utils.habilidades.listar.invalidate();
      utils.egresados.habilidades.invalidate();
    },
  });
  const editarHabilidad = trpc.habilidades.editar.useMutation({
    onSuccess: () => {
      utils.habilidades.listar.invalidate();
      utils.egresados.habilidades.invalidate();
    },
  });
  const eliminarHabilidad = trpc.habilidades.eliminar.useMutation({
    onSuccess: () => {
      utils.habilidades.listar.invalidate();
      utils.egresados.habilidades.invalidate();
    },
  });
  return { habilidades, isLoading, crearHabilidad, editarHabilidad, eliminarHabilidad };
}