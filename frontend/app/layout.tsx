import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Egresados y Ofertas Laborales",
  description: "Plataforma de gestión de egresados y oportunidades laborales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}