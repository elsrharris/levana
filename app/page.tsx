"use client";

import React, { useEffect, useMemo, useState } from "react";

type Tab = "home" | "cycle" | "train" | "stats";
type ChecklistItem = { id: string; label: string; done: boolean };
type QuickLogKey = "workout" | "hydration" | "mood";

type AppState = {
  tab: Tab;
  cycleDay: number;
  readiness: number; // 0-100
  steps: number;
  protein: number; // grams
  water: number; // liters (one decimal)
  checklist: ChecklistItem[];
  quickLogs: Record<QuickLogKey, number>;
  lastCompletedDate: string | null; // yyyy-mm-dd
};

const STORAGE_KEY = "levana:v1";

function todayKey() {
  // local date key: YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_STATE: AppState = {
  tab: "home",
  cycleDay: 47,
  readiness: 62,
  steps: 8234,
  protein: 96,
  water: 1.7,
  checklist: [
    { id: "vitd", label: "Vitamin D", done: true },
    { id: "inositol", label: "Inositol", done: false },
    { id: "omega3", label: "Omega-3", done: false },
    { id: "walk", label: "10k steps / walk", done: true },
  ],
  quickLogs: { workout: 0, hydration: 0, mood: 0 },
  lastCompletedDate: null,
};

export default function Page() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  // UI-only state
  const [banner, setBanner] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");

  const todayPretty = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, []);

  // Load persisted state once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AppState>;

      // Merge defensively
      setState((prev) => ({
        ...prev,
        ...parsed,
        checklist: Array.isArray(parsed.checklist) ? parsed.checklist : prev.checklist,
        quickLogs: parsed.quickLogs
          ? { ...prev.quickLogs, ...parsed.quickLogs }
          : prev.quickLogs,
      }));
    } catch {
      // ignore
    }
  }, []);

  // Save on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // Auto-clear banners
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 2800);
    return () => clearTimeout(t);
  }, [banner]);

  // “New day” behavior (optional): if lastCompletedDate is not today, do nothing.
  // If you want auto-reset of quick logs daily, uncomment below.
  useEffect(() => {
    const key = todayKey();
    // Example: reset quick logs each day
    // if (state.lastCompletedDate !== key) {
    //   setState((s) => ({ ...s, quickLogs: { workout: 0, hydration: 0, mood: 0 } }));
    // }
    void key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTab(tab: Tab) {
    setState((s) => ({ ...s, tab }));
  }

  function toggleChecklist(id: string) {
    setState((s) => ({
      ...s,
      checklist: s.checklist.map((it) =>
        it.id === id ? { ...it, done: !it.done } : it
      ),
    }));
  }

  function completeDay() {
    const key = todayKey();
    setState((s) => ({
      ...s,
      checklist: s.checklist.map((it) => ({ ...it, done: true })),
      lastCompletedDate: key,
    }));
    setBanner("Day complete ✨ gentle wins count.");
  }

  function addChecklistItem() {
    const label = newItemLabel.trim();
    if (!label) return;
    setState((s) => ({
      ...s,
      checklist: [{ id: uid(), label, done: false }, ...s.checklist],
    }));
    setNewItemLabel("");
    setAddOpen(false);
    setBanner("Added to today ✅");
  }

  function bumpQuickLog(key: QuickLogKey) {
    setState((s) => ({
      ...s,
      quickLogs: { ...s.quickLogs, [key]: s.quickLogs[key] + 1 },
    }));
    const map: Record<QuickLogKey, string> = {
      workout: "Workout logged 💪",
      hydration: "Hydration logged 💧",
      mood: "Mood logged ✨",
    };
    setBanner(map[key]);
  }

  function adjustNumber(field: "steps" | "protein", delta: number) {
    setState((s) => ({ ...s, [field]: Math.max(0, s[field] + delta) }));
  }

  function adjustWater(delta: number) {
    setState((s) => {
      const next = Math.round((s.water + delta) * 10) / 10;
      return { ...s, water: Math.max(0, next) };
    });
  }

  function adjustReadiness(delta: number) {
    setState((s) => ({ ...s, readiness: clamp(s.readiness + delta, 0, 100) }));
  }

  function adjustCycleDay(delta: number) {
    setState((s) => ({ ...s, cycleDay: Math.max(1, s.cycleDay + delta) }));
  }

  const checklistDoneCount = state.checklist.filter((c) => c.done).length;
  const checklistPct =
    state.checklist.length === 0 ? 0 : Math.round((checklistDoneCount / state.checklist.length) * 100);

  return (
    <main className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(255,255,255,0.6),transparent_45%),radial-gradient(900px_circle_at_80%_20%,rgba(216,180,254,0.35),transparent_50%),linear-gradient(135deg,rgba(15,23,42,1),rgba(30,27,75,1),rgba(245,243,255,1))]">
      <div className="mx-auto max-w-md px-4 pb-24 pt-8">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-wide text-white/70">{todayPretty}</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">levana</h1>
            <p className="mt-1 text-sm text-white/70">
              A calm place to track your rhythm.
            </p>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:bg-white/15"
          >
            + Add
          </button>
        </header>

        {/* Banner */}
        {banner && (
          <div className="mb-4 rounded-3xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
            {banner}
          </div>
        )}

        {/* Content */}
        {state.tab === "home" && (
          <>
            <section className="mb-5 grid grid-cols-3 gap-3">
              <Stat
                label="Steps"
                value={state.steps.toLocaleString()}
                actions={
                  <MiniActions
                    onMinus={() => adjustNumber("steps", -500)}
                    onPlus={() => adjustNumber("steps", 500)}
                    minusLabel="-500"
                    plusLabel="+500"
                  />
                }
              />
              <Stat
                label="Protein"
                value={`${state.protein}g`}
                actions={
                  <MiniActions
                    onMinus={() => adjustNumber("protein", -10)}
                    onPlus={() => adjustNumber("protein", 10)}
                    minusLabel="-10"
                    plusLabel="+10"
                  />
                }
              />
              <Stat
                label="Water"
                value={`${state.water.toFixed(1)}L`}
                actions={
                  <MiniActions
                    onMinus={() => adjustWater(-0.2)}
                    onPlus={() => adjustWater(0.2)}
                    minusLabel="-0.2"
                    plusLabel="+0.2"
                  />
                }
              />
            </section>

            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Cycle</h2>
                  <p className="mt-1 text-sm text-white/70">Waiting / regulating</p>
                </div>
                <span className="rounded-2xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  Day {state.cycleDay}
                </span>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm text-white/90">Readiness</p>
                  <p className="text-sm text-white/90">{state.readiness}%</p>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-white/50"
                    style={{ width: `${state.readiness}%` }}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => adjustReadiness(-5)}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => adjustReadiness(5)}
                    className="flex-1 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                  >
                    +5
                  </button>
                </div>

                <p className="mt-2 text-xs text-white/70">
                  Tip: consistency over intensity.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTab("cycle")}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90"
                >
                  Log symptoms
                </button>
                <button
                  onClick={() => setTab("stats")}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
                >
                  View insights
                </button>
              </div>
            </Card>

            <Card className="mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Today</h2>
                <span className="text-xs text-white/70">
                  {checklistDoneCount}/{state.checklist.length} • {checklistPct}%
                </span>
              </div>

              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-white/50"
                    style={{ width: `${checklistPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {state.checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleChecklist(item.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={[
                          "h-5 w-5 rounded-md border transition",
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
                  </button>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAddOpen(true)}
                  className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
                >
                  Add item
                </button>
                <button
                  onClick={completeDay}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90"
                >
                  Complete day
                </button>
              </div>
            </Card>

            <Card className="mt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Quick logs</h2>
                <span className="text-xs text-white/70">Tap to add</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <QuickLog
                  title="Workout"
                  subtitle={`${state.quickLogs.workout}x`}
                  onClick={() => bumpQuickLog("workout")}
                />
                <QuickLog
                  title="Hydration"
                  subtitle={`${state.quickLogs.hydration}x`}
                  onClick={() => bumpQuickLog("hydration")}
                />
                <QuickLog
                  title="Mood"
                  subtitle={`${state.quickLogs.mood}x`}
                  onClick={() => bumpQuickLog("mood")}
                />
              </div>

              <p className="mt-3 text-xs text-white/70">
                Keep it tiny: 10 seconds is enough.
              </p>
            </Card>
          </>
        )}

        {state.tab === "cycle" && (
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Cycle</h2>
                <p className="mt-1 text-sm text-white/70">
                  Track day count and gentle signals.
                </p>
              </div>
              <span className="rounded-2xl border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80 backdrop-blur">
                Day {state.cycleDay}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => adjustCycleDay(-1)}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
              >
                -1 day
              </button>
              <button
                onClick={() => adjustCycleDay(1)}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
              >
                +1 day
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/90">Quick note (demo)</p>
              <p className="mt-1 text-xs text-white/70">
                Next step: add symptom + LH/BBT inputs and save to Supabase.
              </p>
            </div>
          </Card>
        )}

        {state.tab === "train" && (
          <Card>
            <h2 className="text-lg font-semibold text-white">Train</h2>
            <p className="mt-1 text-sm text-white/70">
              Simple training check-ins (demo).
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => bumpQuickLog("workout")}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90"
              >
                Log workout
              </button>
              <button
                onClick={() => setBanner("Saved ✨ (local only for now)")}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
              >
                Save plan
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <PlanRow title="Strength A" subtitle="Lower + core • 45m" />
              <PlanRow title="Strength B" subtitle="Upper • 35m" />
              <PlanRow title="Walk" subtitle="Zone 2 • 30–60m" />
            </div>
          </Card>
        )}

        {state.tab === "stats" && (
          <Card>
            <h2 className="text-lg font-semibold text-white">Stats</h2>
            <p className="mt-1 text-sm text-white/70">
              A soft overview (demo).
            </p>

            <div className="mt-4 space-y-3">
              <StatLine label="Readiness" value={`${state.readiness}%`} />
              <StatLine label="Steps" value={state.steps.toLocaleString()} />
              <StatLine label="Protein" value={`${state.protein}g`} />
              <StatLine label="Water" value={`${state.water.toFixed(1)}L`} />
              <StatLine
                label="Checklist completion"
                value={`${checklistPct}%`}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY);
                  setState(DEFAULT_STATE);
                  setBanner("Reset to default 🌙");
                }}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/15"
              >
                Reset demo data
              </button>
              <button
                onClick={() => setBanner("Next: sync with Supabase ✨")}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90"
              >
                Connect backend
              </button>
            </div>
          </Card>
        )}

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md px-4 pb-4">
          <div className="flex items-center justify-between rounded-3xl border border-white/15 bg-white/10 px-2 py-2 backdrop-blur">
            <NavItem label="Home" active={state.tab === "home"} onClick={() => setTab("home")} />
            <NavItem label="Cycle" active={state.tab === "cycle"} onClick={() => setTab("cycle")} />
            <NavItem label="Train" active={state.tab === "train"} onClick={() => setTab("train")} />
            <NavItem label="Stats" active={state.tab === "stats"} onClick={() => setTab("stats")} />
          </div>
        </nav>
      </div>

      {/* Add item modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/60 p-4 text-white backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold">Add to today</h3>
                <p className="mt-1 text-xs text-white/70">
                  A small habit is enough.
                </p>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="rounded-2xl border border-white/15 bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs text-white/70">Checklist item</label>
              <input
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder="e.g. Magnesium"
                className="mt-2 w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30"
                autoFocus
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setAddOpen(false)}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={addChecklistItem}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-white/90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ---------- UI bits ---------- */

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

function Stat({
  label,
  value,
  actions,
}: {
  label: string;
  value: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 px-3 py-3 text-white backdrop-blur">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-wide text-white/70">{label}</p>
          <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
      </div>
      {actions && <div className="mt-2">{actions}</div>}
    </div>
  );
}

function MiniActions({
  onMinus,
  onPlus,
  minusLabel,
  plusLabel,
}: {
  onMinus: () => void;
  onPlus: () => void;
  minusLabel: string;
  plusLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={onMinus}
        className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2 text-[11px] text-white/90 hover:bg-white/15"
      >
        {minusLabel}
      </button>
      <button
        onClick={onPlus}
        className="rounded-2xl border border-white/15 bg-white/10 px-2 py-2 text-[11px] text-white/90 hover:bg-white/15"
      >
        {plusLabel}
      </button>
    </div>
  );
}

function QuickLog({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/5 px-3 py-4 text-left text-white/90 transition hover:bg-white/10"
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-white/60">{subtitle}</p>
    </button>
  );
}

function PlanRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm font-medium text-white/90">{title}</p>
      <p className="mt-1 text-xs text-white/70">{subtitle}</p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-sm text-white/80">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function NavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "flex-1 rounded-2xl px-3 py-2 text-[11px] transition",
        active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </button>
  );
}