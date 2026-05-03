"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  UserCircle,
  Building,
  ClipboardList,
} from "lucide-react";

const itemsByRol = {
  administrador: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Egresados", href: "/admin/egresados", icon: Users },
    { title: "Ofertas", href: "/admin/ofertas", icon: Briefcase },
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
    { title: "Postulaciones", href: "/empresa/postulaciones", icon: ClipboardList },
    { title: "Reportes", href: "/empresa/reportes", icon: FileText },
  ],
};

export function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname();
  const items = itemsByRol[rol] || [];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-xl font-bold border-b border-gray-800">
        Egresados+Jobs
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                pathname === item.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}