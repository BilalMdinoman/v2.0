"use client";

import Link from "next/link";
import TradePerformance from "@/components/TradePerformance";
import { useLiveData } from "@/lib/live-data";
import { buildEquitySeries } from "@/lib/equity";
import { usd } from "@/lib/format";
import { ArrowLeft, Wallet, ShieldCheck } from "lucide-react";

export default function WalletPage() {
  const { data } = useLiveData();
  const a = data.account;

  const stats = [
    { label: "Available cash", value: a ? usd(a.availableCash) : "—" },
    { label: "Realized PnL", value: a ? usd(a.realizedPnl) : "—", accent: a && a.realizedPnl >= 0 ? "text-accent-green" : "text-accent-red" },
    { label: "Unrealized PnL", value: a ? usd(a.unrealizedPnl) : "—", accent: a && a.unrealizedPnl >= 0 ? "text-accent-green" : "text-accent-red" },
    { label: "Daily trades", value: a ? `${a.dailyTrades}/${a.dailyTradeCap}` : "—" },
  ];

  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Command Center
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
          <Wallet className="h-4 w-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100">Virtual Wallet</h1>
          <p className="text-[11px] text-slate-500">Your paper-trading balance and holdings.</p>
        </div>
      </div>

      {/* balance */}
      <div className="panel p-4">
        <div className="panel-title">Portfolio Value</div>
        <div className="mono-num mt-2 text-3xl font-bold tracking-tight text-slate-50">
          {a ? usd(a.equity) : "—"}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {a ? `Starting balance ${usd(a.startingBalance)}.` : "The balance appears once live data connects."}
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-3">
            <div className="panel-title">{s.label}</div>
            <div className={`mono-num mt-1 text-lg ${s.accent ?? "text-slate-100"}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <TradePerformance trades={data.trades} equitySeries={buildEquitySeries(data.trades)} />

      {/* holdings */}
      <div className="panel p-4">
        <h2 className="panel-title mb-3">Holdings</h2>
        {data.positions.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600">No holdings yet.</p>
        ) : (
          <div className="space-y-2">
            {data.positions.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-terminal-border bg-terminal-bg2/60 px-3 py-2">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{p.tokenSymbol}</div>
                  <div className="mono-num text-[10px] text-slate-500">{p.tokenQuantity} tokens</div>
                </div>
                <div className="text-right">
                  <div className="mono-num text-sm text-slate-200">{usd(p.amountUsd)}</div>
                  <div className="mono-num text-[10px] text-slate-500">@{p.entryPrice}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* recent activity */}
      <div className="panel p-4">
        <h2 className="panel-title mb-3">Recent activity</h2>
        {data.trades.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600">No closed trades yet.</p>
        ) : (
          <div className="space-y-2">
            {data.trades.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-terminal-border bg-terminal-bg2/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`pill ${t.result === "WIN" ? "border-accent-green/40 bg-accent-green/10 text-accent-green" : "border-accent-red/40 bg-accent-red/10 text-accent-red"}`}>{t.result}</span>
                  <span className="text-sm font-semibold text-slate-200">{t.tokenSymbol}</span>
                </div>
                <span className={`mono-num text-sm ${t.netPnlUsd >= 0 ? "text-accent-green" : "text-accent-red"}`}>{usd(t.netPnlUsd)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-accent-cyan/20 bg-accent-cyan/5 px-3 py-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-accent-cyan" />
        This is a virtual paper wallet. No real funds are connected or at risk.
      </div>
    </div>
  );
}
