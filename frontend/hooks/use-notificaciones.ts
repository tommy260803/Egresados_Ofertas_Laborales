import { trpc } from "@/lib/trpc/client";
import { useAuth } from "@/hooks/use-auth";

export function useNotificaciones() {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const { data: notificaciones } = trpc.notificaciones.listarTodas.useQuery(
    { userId: user?.userId || 0 },
    { enabled: isAuthenticated && !!user?.userId }
  );
  const { data: noLeidasData } = trpc.notificaciones.listarNoLeidas.useQuery(
    { userId: user?.userId || 0 },
    { enabled: isAuthenticated && !!user?.userId }
  );
  const marcarLeida = trpc.notificaciones.marcarLeida.useMutation({
    onSuccess: () => {
      utils.notificaciones.listarNoLeidas.invalidate();
      utils.notificaciones.listarTodas.invalidate();
    }
  });

  return {
    notificaciones,
    noLeidas: noLeidasData?.length || 0,
    marcarLeida,
  };
}