"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Briefcase, FileText, UserCircle, Building, ClipboardList, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const itemsByRol = {
  administrador: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Egresados", href: "/admin/egresados", icon: Users },
    { title: "Ofertas", href: "/admin/ofertas", icon: Briefcase },
    { title: "Habilidades", href: "/admin/habilidades", icon: FileText },
    { title: "Reportes", href: "/admin/reportes", icon: FileText },
  ],
  egresado: [
    { title: "Mi Dashboard", href: "/egresado/dashboard", icon: LayoutDashboard },
    { title: "Mi Perfil", href: "/egresado/perfil", icon: UserCircle },
    { title: "Ofertas", href: "/egresado/ofertas", icon: Briefcase },
    { title: "Mis Postulaciones", href: "/egresado/postulaciones", icon: ClipboardList },
  ],
  empresa: [
    { title: "Dashboard", href: "/empresa/dashboard", icon: LayoutDashboard },
    { title: "Mis Ofertas", href: "/empresa/ofertas", icon: Briefcase },
    { title: "Nueva Oferta", href: "/empresa/ofertas/nueva", icon: Building },
    { title: "Postulaciones", href: "/empresa/postulaciones-recibidas", icon: ClipboardList },
  ],
};

export function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();
  const items = (itemsByRol as Record<string, Array<{ title: string; href: string; icon: LucideIcon }>>)[rol] || [];

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-slate-950/80 text-white backdrop-blur xl:flex xl:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">Egresados+Jobs</p>
        <h2 className="mt-1 text-xl font-semibold">Sistema de gestión</h2>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
