import { trpc } from "@/lib/trpc/client";

export function useEgresados(filters?: { search?: string; carrera?: string }) {
  const query = trpc.egresados.list.useQuery(filters);
  const create = trpc.egresados.create.useMutation();
  const update = trpc.egresados.update.useMutation();
  const remove = trpc.egresados.remove.useMutation();

  return {
    egresados: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    create,
    update,
    remove,
  };
}

export function useEgresadoByUsuarioId(usuarioId: number) {
  const query = trpc.egresados.byUsuarioId.useQuery(usuarioId, { enabled: !!usuarioId });
  return {
    egresado: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}