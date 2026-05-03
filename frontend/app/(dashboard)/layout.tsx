"use client";

import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layouts/Sidebar";
import { Header } from "@/components/layouts/Header";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  if (!isAuthenticated) redirect("/");

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] text-slate-50">
      <Sidebar rol={user?.rol || "egresado"} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}