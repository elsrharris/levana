// app/page.tsx
export default function Page() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const checklist = [
    { label: "Vitamin D", done: true },
    { label: "Inositol", done: false },
    { label: "Omega-3", done: false },
    { label: "10k steps / walk", done: true },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.6),transparent_45%),radial-gradient(900px_circle_at_80%_20%,rgba(216,180,254,0.35),transparent_50%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,27,75,1),rgba(245,243,255,1))]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-8">
        {/* Header */}
        <header className="mb-6">
          <p className="text-xs tracking-wide text-white/70">{today}</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">levana</h1>
          <p className="mt-1 text-sm text-white/70">
            A calm place to track your rhythm.
          </p>
        </header>

        {/* Quick stats */}
        <section className="mb-5 grid grid-cols-3 gap-3">
          <Stat label="Steps" value="8,234" />
          <Stat label="Protein" value="96g" />
          <Stat label="Water" value="1.7L" />
        </section>

        {/* Cycle card */}
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Cycle</h2>
              <p className="mt-1 text-sm text-white/70">
                Waiting / regulating
              </p>
            </div>
            <span className="rounded-2xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">
              Day 47
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-white/90">Readiness</p>
              <p className="text-sm text-white/90">62%</p>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div className="h-2 w-[62%] rounded-full bg-white/50" />
            </div>
            <p className="mt-2 text-xs text-white/70">
              Tip: consistency over intensity.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90">
              Log symptoms
            </button>
            <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15">
              View insights
            </button>
          </div>
        </Card>

        {/* Checklist */}
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Today</h2>
            <span className="text-xs text-white/70">Checklist</span>
          </div>

          <div className="mt-4 space-y-3">
            {checklist.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      "h-5 w-5 rounded-md border",
                      item.done
                        ? "border-white/30 bg-white/60"
                        : "border-white/20 bg-transparent",
                    ].join(" ")}
                  />
                  <p className="text-sm text-white/90">{item.label}</p>
                </div>

                <span className="rounded-xl bg-white/10 px-2 py-1 text-xs text-white/75">
                  {item.done ? "Done" : "Later"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15">
              Add item
            </button>
            <button className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90">
              Complete day
            </button>
          </div>
        </Card>

        {/* Bottom nav (simple) */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md px-4 pb-4">
          <div className="flex items-center justify-between rounded-3xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <NavItem label="Home" active />
            <NavItem label="Cycle" />
            <NavItem label="Train" />
            <NavItem label="Stats" />
          </div>
        </nav>
      </div>
    </main>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-3xl border border-white/15 bg-white/10 p-4 text-white shadow-none backdrop-blur",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 px-3 py-3 text-white backdrop-blur">
      <p className="text-[11px] tracking-wide text-white/70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      className={[
        "rounded-2xl px-3 py-2 text-[11px] transition",
        active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </button>
  );
}