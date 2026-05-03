import Link from "next/link";
import { ArrowRight, CheckCircle2, LogIn, SearchCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const highlights = [
	{
		title: "Egresados",
		description: "Crea perfiles, agrega habilidades y revisa oportunidades activas.",
	},
	{
		title: "Empresas",
		description: "Publica vacantes, revisa postulaciones y cambia estados de selección.",
	},
	{
		title: "Administración",
		description: "Consulta KPIs, gestiona reportes y supervisa el movimiento del sistema.",
	},
];

const steps = [
	"Regístrate como egresado o empresa.",
	"Inicia sesión con tu cuenta.",
	"Entra a tu dashboard y prueba las funcionalidades.",
];

export default function HomePage() {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] text-white">
			<div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
				<div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
					<section className="space-y-8">
						<div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 backdrop-blur">
							<CheckCircle2 className="h-4 w-4" />
							Plataforma de conexión entre egresados y empresas
						</div>

						<div className="space-y-5">
							<h1 className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">
								Sistema de Egresados y Ofertas Laborales
							</h1>
							<p className="max-w-2xl text-lg leading-8 text-slate-300">
								Centraliza perfiles de egresados, publicación de vacantes, seguimiento de postulaciones y reportes para administración en una sola experiencia clara y usable.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
								<Link href="/login">
									<LogIn className="mr-2 h-4 w-4" />
									Ir a login
								</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
								<Link href="/register">
									<UserPlus className="mr-2 h-4 w-4" />
									Crear cuenta
								</Link>
							</Button>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							{highlights.map((item) => (
								<Card key={item.title} className="border-white/10 bg-white/5 text-white shadow-lg shadow-black/10 backdrop-blur">
									<CardHeader className="pb-3">
										<CardTitle className="text-base">{item.title}</CardTitle>
										<CardDescription className="text-slate-300">{item.description}</CardDescription>
									</CardHeader>
								</Card>
							))}
						</div>
					</section>

					<section className="space-y-4">
						<Card className="border-white/10 bg-white/5 text-white shadow-2xl shadow-black/20 backdrop-blur">
							<CardHeader>
								<CardTitle className="text-2xl">Cómo empezar</CardTitle>
								<CardDescription className="text-slate-300">
									Usa estas rutas para probar el sistema completo desde el primer ingreso.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-3">
									{steps.map((step, index) => (
										<div key={step} className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/10 p-4">
											<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-sm font-semibold text-emerald-300">
												{index + 1}
											</div>
											<p className="text-sm leading-6 text-slate-200">{step}</p>
										</div>
									))}
								</div>

								<div className="grid gap-3 pt-2 sm:grid-cols-2">
									<Button asChild className="bg-white text-slate-950 hover:bg-slate-200">
										<Link href="/login">
											<SearchCheck className="mr-2 h-4 w-4" />
											Entrar al sistema
										</Link>
									</Button>
									<Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
										<Link href="/register">Registrar usuario</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
						<p className="text-sm text-slate-400">
							Si ya tienes sesión iniciada, puedes entrar directamente a los dashboards de egresado, empresa o administración desde sus rutas internas.
						</p>
					</section>
				</div>
			</div>
		</main>
	);
}
