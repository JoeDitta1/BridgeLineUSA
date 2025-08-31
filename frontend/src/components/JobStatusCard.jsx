import React, { useMemo } from "react";

/**
 * JobStatusCard
 * Visual spec:
 * - BIG circle = Overall Sales Order status (green/yellow/red).
 *   - If any router is "active", circle can gently pulse.
 * - Router bars = Each Work Order Router/Process.
 *   - Flash if active (operator clocked in).
 *   - Show elapsed vs estimated time: "0h 42m / 1h 00m".
 *   - Progress bar shows % of estimate (can exceed 100% to indicate overrun).
 *
 * Status colors:
 * - "on_track"     -> green
 * - "falling_behind" -> yellow
 * - "late"         -> red
 * Each status can be "active" (flashing) or "idle" (solid).
 */

// ---- helpers ----
const cls = (...arr) => arr.filter(Boolean).join(" ");

const statusToColor = (status) => {
  switch (status) {
    case "on_track":
      return "bg-green-500 border-green-600";
    case "falling_behind":
      return "bg-yellow-400 border-yellow-500";
    case "late":
      return "bg-red-500 border-red-600";
    default:
      return "bg-gray-300 border-gray-400";
  }
};

const statusToText = (status) => {
  switch (status) {
    case "on_track":
      return "On Track";
    case "falling_behind":
      return "Falling Behind";
    case "late":
      return "Late";
    default:
      return "Unknown";
  }
};

const fmtHM = (mins) => {
  const m = Math.max(0, Math.round(mins ?? 0));
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${String(r).padStart(2, "0")}m`;
};

const pct = (elapsedMin, estMin) => {
  if (!estMin || estMin <= 0) return 0;
  // cap visual bar at 120% so overruns still visible
  return Math.min(120, Math.round((elapsedMin / estMin) * 100));
};

// ---- component ----
export default function JobStatusCard({
  soNumber = "S-3501",
  poNumber = "8168496-1",
  overallStatus = "on_track", // "on_track" | "falling_behind" | "late"
  routers = [
    // Example default
    { name: "Sawing", status: "on_track", active: true, elapsedMin: 18, estMin: 30 },
    { name: "Fitting", status: "falling_behind", active: false, elapsedMin: 42, estMin: 40 },
    { name: "Welding", status: "late", active: true, elapsedMin: 95, estMin: 60 },
  ],
}) {
  const anyActive = routers.some((r) => r.active);
  const overallPct = useMemo(() => {
    // simple average of router completion. You can swap for weighted by estMin.
    if (!routers.length) return 0;
    const vals = routers.map((r) => Math.min(100, (r.elapsedMin / (r.estMin || 1)) * 100));
    return Math.round(vals.reduce((a, b) => a + b, 0) / routers.length);
  }, [routers]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* inline keyframes for flashing/pulsing */}
      <style>{`
        @keyframes flash { 0%, 100% {opacity: 1;} 50% {opacity: .35;} }
        .flash { animation: flash 1.2s linear infinite; }
        @keyframes pulseSoft { 0% { transform: scale(1); } 50% { transform: scale(1.015);} 100% { transform: scale(1); } }
        .pulse-soft { animation: pulseSoft 2.6s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="flex items-baseline justify-between mb-6">
        <div className="text-2xl font-semibold">Job {soNumber}</div>
        <div className="text-lg text-gray-600">PO: {poNumber}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* BIG Overall Circle */}
        <div className="flex justify-center md:col-span-1">
          <div
            className={cls(
              "relative rounded-full border-8 shadow-lg aspect-square",
              "w-64 md:w-72 lg:w-80", // larger than router chips
              statusToColor(overallStatus).replace("bg-", "bg-opacity-80 "),
              anyActive ? "pulse-soft" : ""
            )}
            aria-label={`Overall Job Status: ${statusToText(overallStatus)}`}
            role="img"
          >
            <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center text-white drop-shadow">
              <div className="text-sm opacity-90">Overall Status</div>
              <div className="text-2xl font-bold">{statusToText(overallStatus)}</div>
              <div className="mt-2 text-sm opacity-90">Avg Progress</div>
              <div className="text-3xl font-extrabold">{overallPct}%</div>
            </div>
          </div>
        </div>

        {/* Router Bars */}
        <div className="md:col-span-2 space-y-5">
          <div className="text-xl font-semibold mb-2">Routers</div>
          {routers.map((r, i) => {
            const color = statusToColor(r.status);
            const progress = pct(r.elapsedMin, r.estMin);
            const overrun = progress > 100;

            return (
              <div key={i} className="rounded-2xl shadow p-4 border border-gray-200">
                {/* Title chip */}
                <div
                  className={cls(
                    "inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-white font-semibold",
                    color,
                    r.active ? "flash" : ""
                  )}
                >
                  <span>{r.active ? "🟢" : "⚪"}</span>
                  <span>{r.name}</span>
                  <span className="text-white/90 text-sm">({statusToText(r.status)})</span>
                </div>

                {/* Time + Progress */}
                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="text-sm text-gray-700">
                    Time: <span className="font-mono">{fmtHM(r.elapsedMin)}</span> /{" "}
                    <span className="font-mono">{fmtHM(r.estMin)}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {overrun ? "Over estimate" : `${Math.min(progress, 100)}% of estimate`}
                  </div>
                </div>

                {/* Progress bar (shows up to 120%) */}
                <div className="mt-3 h-3 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={cls(
                      "h-full transition-all",
                      color.split(" ").find((c) => c.startsWith("bg-")) || "bg-gray-400",
                      r.active ? "flash" : ""
                    )}
                    style={{ width: `${progress}%` }}
                    aria-valuemin={0}
                    aria-valuemax={120}
                    aria-valuenow={progress}
                    role="progressbar"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
