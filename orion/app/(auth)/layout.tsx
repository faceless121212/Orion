import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(360px,0.85fr)_minmax(560px,1.15fr)]">
      <section className="relative hidden overflow-hidden bg-[#071a33] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_15%_15%,#2563eb_0,transparent_36%),radial-gradient(circle_at_85%_80%,#0ea5e9_0,transparent_32%)]" />
        <Link className="relative flex items-center gap-3" href="/">
          <span className="grid size-11 place-items-center rounded-2xl bg-blue-500 text-xl font-black shadow-lg shadow-blue-950/30">O</span>
          <span className="text-2xl font-bold tracking-tight">Orion</span>
        </Link>
        <div className="relative max-w-md pb-10">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">AI operations workspace</p>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Give every employee a squad of capable AI agents.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">Configure secure agents, run focused missions, and turn results into documents your team can use.</p>
        </div>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-lg">
          <Link className="mb-10 flex items-center gap-3 lg:hidden" href="/">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-600 font-black text-white">O</span>
            <span className="text-xl font-bold text-slate-950">Orion</span>
          </Link>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-10">{children}</div>
          <p className="mt-6 text-center text-xs text-slate-500">Secure single-company workspace · Powered by Supabase</p>
        </div>
      </section>
    </main>
  );
}
