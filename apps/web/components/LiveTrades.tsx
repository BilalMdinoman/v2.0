"use client";

import Link from "next/link";
import { LiveTrade } from "@/lib/types";
import { usd } from "@/lib/format";
import { Radio, ArrowRight } from "lucide-react";

export default function LiveTrades({ trades = [] }: { trades?: LiveTrade[] }) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-accent-green" />
          Live Trades
          <span className="flex items-center gap-1 rounded-full border border-accent-green/40 bg-accent-green/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent-green">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-green" />
            LIVE
          </span>
        </h2>
        <Link
          href="/trades"
          className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {trades.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-600">
          No trades yet. Live executions appear here once the daemon runs.
        </p>
      ) : (
        <div className="space-y-2">
          {trades.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-terminal-border bg-terminal-bg2/60 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`pill ${
                    t.side === "BUY"
                      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                      : "border-accent-red/40 bg-accent-red/10 text-accent-red"
                  }`}
                >
                  {t.side}
                </span>
                <span className="text-xs font-semibold text-slate-200">{t.token}</span>
                <span className="mono-num text-[10px] text-slate-500">@{t.price}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="mono-num text-xs text-slate-300">{usd(t.amountUsd)}</span>
                <span className="mono-num text-[10px] text-slate-600">
                  {new Date(t.time).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
