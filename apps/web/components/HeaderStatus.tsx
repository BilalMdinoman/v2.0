"use client";

import { AccountState } from "@/lib/types";
import { usd, pct } from "@/lib/format";
import { Wifi, WifiOff, PauseCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function HeaderStatus({
  account = null,
  connected = false,
  activePositions = 0,
}: {
  account?: AccountState | null;
  connected?: boolean;
  activePositions?: number;
}) {
  const changePct =
    account && account.startingBalance > 0
      ? ((account.equity - account.startingBalance) / account.startingBalance) * 100
      : 0;
  const up = changePct >= 0;

  const quick = [
    {
      label: "Today's trades",
      value: account ? `${account.dailyTrades}/${account.dailyTradeCap}` : "—",
      accent: "text-accent-cyan",
    },
    { label: "Active positions", value: `${activePositions}`, accent: "text-accent-teal" },
    {
      label: "Realized PnL",
      value: account ? usd(account.realizedPnl) : "—",
      accent: account && account.realizedPnl >= 0 ? "text-accent-green" : "text-accent-red",
    },
    {
      label: "Unrealized PnL",
      value: account ? usd(account.unrealizedPnl) : "—",
      accent: account && account.unrealizedPnl >= 0 ? "text-accent-green" : "text-accent-red",
    },
  ];

  return (
    <div className="space-y-2.5">
      {/* status row */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`pill ${
            connected
              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
              : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
          }`}
        >
          {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {connected ? "LIVE DATA" : "NO LIVE DATA"}
        </span>
        {account?.paused && (
          <span className="pill border-accent-amber/40 bg-accent-amber/10 text-accent-amber">
            <PauseCircle className="h-3 w-3" /> PAUSED
          </span>
        )}
        <span className="text-[11px] text-slate-500">
          Paper trading only — no real funds, ever.
        </span>
      </div>

      {/* five compact cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <div className="panel p-2">
          <div className="panel-title">Portfolio Value</div>
          <div className="mono-num mt-1 text-base font-bold text-slate-50">
            {account ? usd(account.equity) : "—"}
          </div>
          {account && (
            <div className={`text-[10px] font-semibold ${up ? "text-accent-green" : "text-accent-red"}`}>
              {up ? (
                <ArrowUpRight className="mr-0.5 inline h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-0.5 inline h-3 w-3" />
              )}
              {pct(changePct)}
            </div>
          )}
        </div>

        {quick.map((s) => (
          <div key={s.label} className="panel p-2">
            <div className="panel-title">{s.label}</div>
            <div className={`mono-num mt-1 text-sm font-semibold ${s.accent}`}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
