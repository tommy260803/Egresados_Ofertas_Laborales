export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-6 space-y-2 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300">Sistema de Egresados y Ofertas Laborales</p>
            <h1 className="text-3xl font-semibold tracking-tight">Accede a tu cuenta</h1>
            <p className="text-sm text-slate-300">Usa tus credenciales para entrar al dashboard correspondiente.</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}