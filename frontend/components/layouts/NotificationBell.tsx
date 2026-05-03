"use client";

import { useState } from "react";
import { useNotificaciones } from "@/hooks/use-notificaciones";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell() {
  const { notificaciones, noLeidas, marcarLeida } = useNotificaciones();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative border border-white/10 bg-white/5 hover:bg-white/10">
          <Bell className="h-5 w-5" />
          {noLeidas > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {noLeidas}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-white/10 bg-slate-950 p-0 text-slate-50 shadow-2xl shadow-black/20" align="end">
        <div className="border-b border-white/10 p-3 font-semibold">Notificaciones</div>
        <ScrollArea className="h-80">
          {notificaciones?.length === 0 ? (
            <div className="p-4 text-center text-slate-400">No hay notificaciones</div>
          ) : (
            notificaciones?.map((notif: any) => (
              <div key={notif.id_notificacion} className={`border-b border-white/5 p-3 transition-colors hover:bg-white/5 ${!notif.leida ? "bg-emerald-400/5" : ""}`}>
                <div className="flex justify-between">
                  <p className="font-medium text-sm">{notif.asunto}</p>
                  <button onClick={() => marcarLeida.mutate(notif.id_notificacion)} className="text-xs text-emerald-300">Marcar leída</button>
                </div>
                <p className="mt-1 text-xs text-slate-300">{notif.contenido}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDistanceToNow(new Date(notif.fecha_envio), { addSuffix: true, locale: es })}</p>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}