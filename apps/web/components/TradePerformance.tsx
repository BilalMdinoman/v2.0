"use client";

import Link from "next/link";
import { useState } from "react";
import EquityChart from "./EquityChart";
import { TradeRecord, EquitySeriesKey, EquityPoint } from "@/lib/types";
import { TrendingUp, ArrowUpRight } from "lucide-react";

const TIMEFRAMES: { key: EquitySeriesKey; label: string }[] = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "ALL", label: "ALL" },
];

export default function TradePerformance({
  trades = [],
  equitySeries,
}: {
  trades?: TradeRecord[];
  equitySeries?: Record<EquitySeriesKey, EquityPoint[]>;
}) {
  const [tf, setTf] = useState<EquitySeriesKey>("1M");

  const total = trades.length;
  const wins = trades.filter((t) => t.result === "WIN").length;
  const winRate = total ? Math.round((wins / total) * 100) : 0;
  const avgPnl = total ? trades.reduce((s, t) => s + t.pnlPercentage, 0) / total : 0;
  const winTrades = trades.filter((t) => t.result === "WIN");
  const lossTrades = trades.filter((t) => t.result === "LOSS");
  const best = winTrades.length ? Math.max(...winTrades.map((t) => t.pnlPercentage)) : null;
  const worst = lossTrades.length ? Math.min(...lossTrades.map((t) => t.pnlPercentage)) : null;

  if (total === 0) {
    return (
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="panel-title flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent-green" /> Trade Performance
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <TrendingUp className="h-6 w-6 text-slate-600" />
          <p className="text-sm text-slate-500">No performance data yet.</p>
          <p className="max-w-sm text-xs text-slate-600">
            The equity curve and win-rate stats appear once the backend closes its first paper trades.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Win Rate", value: `${winRate}%`, accent: "text-accent-green" },
    { label: "Total Trades", value: `${total}`, accent: "text-slate-100" },
    {
      label: "Avg. PnL",
      value: `${avgPnl >= 0 ? "+" : ""}${avgPnl.toFixed(2)}%`,
      accent: avgPnl >= 0 ? "text-accent-green" : "text-accent-red",
    },
    {
      label: "Best Trade",
      value: best != null ? `+${best.toFixed(2)}%` : "—",
      accent: "text-accent-green",
    },
    {
      label: "Worst Trade",
      value: worst != null ? `${worst.toFixed(2)}%` : "—",
      accent: "text-accent-red",
    },
  ];

  const curve = equitySeries ? equitySeries[tf] ?? [] : [];

  return (
    <div className="panel p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-accent-green" /> Trade Performance
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-terminal-border bg-terminal-bg2 p-0.5">
            {TIMEFRAMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTf(t.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-medium transition ${
                  tf === t.key ? "bg-accent-green/15 text-accent-green" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Link href="/wallet" className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline">
            Open Wallet <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Link href="/wallet" className="group rounded-lg border border-terminal-border bg-terminal-bg2/50 p-2 transition hover:border-accent-green/40 lg:col-span-2">
          <EquityChart data={curve} />
        </Link>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:content-start">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
              <div className="panel-title">{s.label}</div>
              <div className={`mono-num mt-1 text-lg font-semibold ${s.accent}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
