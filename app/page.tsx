"use client";

import { useMemo, useState } from "react";

/**
 * ProveX Sacrifice Schedule (your spec)
 *
 * Start:        2025-11-11
 * Flat $1:      2025-11-11 through 2025-12-02 inclusive
 * Decay start:  2025-12-03
 * End:          2026-01-09
 *
 * Flat period: 22 days @ $1
 * Decay period: 38 days @ +6.25% per day
 * Final rate ≈ $10.0115 per 10,000 points
 */

const BASE_RATE = 1; // $1 per 10,000 points
const DAILY_DECAY = 0.0625; // 6.25% per day

const START_DATE = new Date("2025-11-11T00:00:00Z");
const BASE_END_DATE = new Date("2025-12-02T00:00:00Z"); // last $1 day
const END_DATE = new Date("2026-01-09T00:00:00Z"); // final day
const MAX_RATE = 10.0115; // cap at official final rate

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value === 0) return "0";
  if (Math.abs(value) < 1) return value.toFixed(4);
  if (Math.abs(value) < 1_000_000) {
    return value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

/**
 * Given a YYYY-MM-DD string, compute the correct rate (USD per 10,000 points)
 * according to your schedule. Returns null if the date is invalid.
 */
function computeRateForDate(dateStr: string): number | null {
  if (!dateStr) return null;

  const msPerDay = 1000 * 60 * 60 * 24;
  const d = new Date(dateStr + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;

  // Before start: just use base rate
  if (d < START_DATE) return BASE_RATE;

  // After end: cap at max rate
  if (d > END_DATE) return MAX_RATE;

  // Flat $1 period: 2025-11-11 → 2025-12-02 inclusive
  if (d <= BASE_END_DATE) {
    return BASE_RATE;
  }

  // After 2025-12-02, we apply 6.25% daily increase
  const decayDays = Math.floor(
    (d.getTime() - BASE_END_DATE.getTime()) / msPerDay,
  );

  let newRate = BASE_RATE * Math.pow(1 + DAILY_DECAY, decayDays);
  if (newRate > MAX_RATE) newRate = MAX_RATE;

  return newRate;
}

export default function HomePage() {
  const [usd, setUsd] = useState<string>("1000");
  const [rate, setRate] = useState<string>(BASE_RATE.toFixed(4));
  const [bonus, setBonus] = useState<string>("2.0");
  const [sacrificeDate, setSacrificeDate] = useState<string>("2025-11-11");

  const {
    usdAmount,
    ratePer10k,
    bonusX,
    basePoints,
    totalPoints,
    effectivePerUsd,
  } = useMemo(() => {
    const usdAmount = parseFloat(usd) || 0;
    const ratePer10k = parseFloat(rate) || 0;
    const bonusX = parseFloat(bonus) || 1;

    let basePoints = 0;
    let totalPoints = 0;
    let effectivePerUsd = 0;

    if (usdAmount > 0 && ratePer10k > 0) {
      // basePoints = USD * (10,000 points / ratePer10k USD)
      basePoints = usdAmount * (10_000 / ratePer10k);
      totalPoints = basePoints * bonusX;
      effectivePerUsd = totalPoints / usdAmount;
    }

    return {
      usdAmount,
      ratePer10k,
      bonusX,
      basePoints,
      totalPoints,
      effectivePerUsd,
    };
  }, [usd, rate, bonus]);

  const handleDateChange = (value: string) => {
    setSacrificeDate(value);
    const computed = computeRateForDate(value);
    if (computed !== null) {
      setRate(computed.toFixed(4));
    }
  };

  const handleUseToday = () => {
    const today = new Date();
    const iso = today.toISOString().slice(0, 10); // YYYY-MM-DD
    setSacrificeDate(iso);
    const computed = computeRateForDate(iso);
    if (computed !== null) {
      setRate(computed.toFixed(4));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 shadow-2xl">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_0%_0%,#22d3ee_0,transparent_40%),radial-gradient(circle_at_100%_0%,#a855f7_0,transparent_45%),radial-gradient(circle_at_50%_100%,#f97316_0,transparent_40%)]" />

          <div className="relative z-10 p-6 sm:p-10 space-y-8">
            {/* Header */}
            <header className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-slate-700/70 px-3 py-1 text-xs font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Unofficial • ProveX Sacrifice Points Estimator
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-50">
                ProveX{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400">
                  Sacrifice Calculator
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
                Estimate how many points you might get for sacrificing to ProveX
                based on your USD amount, current rate per 10,000 points, and
                your bonus multiplier X.
              </p>
              <p className="text-xs text-slate-400">
                This is an <span className="font-semibold">unofficial</span>{" "}
                tool for rough estimates only. Always verify against the
                official ProveX dashboard.
              </p>
            </header>

            {/* Inputs */}
            <section className="grid gap-6 md:grid-cols-2">
              {/* Left column */}
              <div className="space-y-4">
                {/* USD Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Sacrifice Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
                      $
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={usd}
                      onChange={(e) => setUsd(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-9 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                      placeholder="Enter USD sacrificed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Example: <span className="font-mono">$40,000</span>.
                  </p>
                </div>

                {/* Sacrifice Date → Auto Rate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Sacrifice Date
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={sacrificeDate}
                      min="2025-11-11"
                      max="2026-01-09"
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-0 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/40"
                    />
                    <button
                      type="button"
                      onClick={handleUseToday}
                      className="flex-1 rounded-2xl bg-violet-600/90 px-3 py-2 text-xs font-semibold text-slate-50 hover:bg-violet-500 transition-colors"
                    >
                      Use today
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    2025-11-11 → 2025-12-02:{" "}
                    <span className="font-mono">$1.0000</span> per 10,000
                    points. After that, the rate increases ~6.25% per day until
                    2026-01-09, capped around{" "}
                    <span className="font-mono">$10.0115</span>.
                  </p>
                </div>

                {/* Rate Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Rate (USD per 10,000 points)
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-xs">
                      USD /
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.0001}
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 pl-14 pr-3 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40"
                      placeholder="1.0000"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Automatically filled from the date picker, but you can
                    override it if needed.
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Bonus Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Bonus Multiplier (X)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      step={0.0001}
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
                      placeholder="e.g. 2.7053"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Use your estimated bonus from the leaderboard (e.g.{" "}
                    <span className="font-mono">2.7053x</span>).
                  </p>
                </div>

                {/* Summary mini card */}
                <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 space-y-3">
                  <h2 className="text-sm font-semibold text-slate-100">
                    Input Summary
                  </h2>
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <dt className="text-slate-400">USD Sacrifice</dt>
                      <dd className="font-mono text-slate-50">
                        ${formatNumber(usdAmount)}
                      </dd>
                    </div>
                    <div className="space-y-0.5">
                      <dt className="text-slate-400">Rate / 10,000 pts</dt>
                      <dd className="font-mono text-slate-50">
                        ${formatNumber(ratePer10k)}
                      </dd>
                    </div>
                    <div className="space-y-0.5">
                      <dt className="text-slate-400">Bonus Multiplier</dt>
                      <dd className="font-mono text-slate-50">
                        {formatNumber(bonusX)}x
                      </dd>
                    </div>
                    <div className="space-y-0.5">
                      <dt className="text-slate-400">
                        Effective pts per $ (with X)
                      </dt>
                      <dd className="font-mono text-slate-50">
                        {effectivePerUsd
                          ? formatNumber(effectivePerUsd)
                          : "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            {/* Results */}
            <section className="rounded-2xl border border-slate-700/90 bg-slate-900/80 p-4 sm:p-5 space-y-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
                Estimated Points
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                  Rough estimate • not official
                </span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Base Points (no bonus)
                  </p>
                  <p className="text-lg sm:text-xl font-semibold font-mono text-cyan-300">
                    {basePoints ? formatNumber(basePoints) : "-"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Raw points before any leaderboard / volume bonuses.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Bonus Applied
                  </p>
                  <p className="text-lg sm:text-xl font-semibold font-mono text-emerald-300">
                    {bonusX ? `${formatNumber(bonusX)}x` : "-"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    From rank, volume, or other bonus mechanics.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Total Est. Points
                  </p>
                  <p className="text-lg sm:text-xl font-semibold font-mono text-amber-300">
                    {totalPoints ? formatNumber(totalPoints) : "-"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Estimated points including your bonus multiplier.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Example sanity check: at{" "}
                <span className="font-mono">$1 per 10,000 points</span>, a{" "}
                <span className="font-mono">$40,000</span> sacrifice has
                400,000,000 base points. With a{" "}
                <span className="font-mono">2.2743x</span> bonus like a current
                high-rank slot, that’s ≈{" "}
                <span className="font-mono">909,720,000</span> points (ignoring
                leaderboard nuances).
              </p>
            </section>

            {/* Footer */}
            <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500 max-w-md">
                Double-check everything against the official{" "}
                <a
                  href="https://provex.info/#/sac/provex/global"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                >
                  ProveX sacrifice dashboard
                </a>
                . This calculator doesn’t account for all edge cases.
              </p>
              <p className="text-[11px] text-slate-500">
                Built by <span className="font-semibold text-slate-300">you</span> •
                open-source on GitHub.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
