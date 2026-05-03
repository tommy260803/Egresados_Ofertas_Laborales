"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, User } from "lucide-react";
import { NotificationBell } from "@/components/layouts/NotificationBell";

export function Header({ user }: { user: any }) {
  const { logout } = useAuth();
  const initials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Panel de trabajo</p>
          <h1 className="text-lg font-semibold text-white md:text-xl">Bienvenido, {user?.email}</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 rounded-full border border-white/10 bg-white/5 px-2 hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-emerald-400/20 text-emerald-200">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-white/10 bg-slate-950 text-slate-50">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}