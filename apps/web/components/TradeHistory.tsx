"use client";

import Link from "next/link";
import { TradeRecord } from "@/lib/types";
import { usd, pct } from "@/lib/format";
import { History, ArrowRight } from "lucide-react";

export default function TradeHistory({ trades = [] }: { trades?: TradeRecord[] }) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-accent-blue" /> Trade History
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
          No closed trades yet. History appears after the first paper position closes.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr className="border-b border-terminal-border">
                <th className="py-2 pr-3 font-medium">Token</th>
                <th className="py-2 pr-3 font-medium">Entry</th>
                <th className="py-2 pr-3 font-medium">Exit</th>
                <th className="py-2 pr-3 font-medium">PnL</th>
                <th className="py-2 pr-3 font-medium">Result</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr key={t.id} className="border-b border-terminal-border/40 transition last:border-0 hover:bg-terminal-bg2/60">
                  <td className="py-2 pr-3">
                    <Link href={`/trades/${t.id}`} className="font-semibold text-slate-200 hover:text-accent-cyan">
                      {t.tokenSymbol}
                    </Link>
                  </td>
                  <td className="mono-num py-2 pr-3 text-slate-300">{t.entryPrice}</td>
                  <td className="mono-num py-2 pr-3 text-slate-300">{t.exitPrice}</td>
                  <td className={`mono-num py-2 pr-3 ${t.netPnlUsd >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                    {usd(t.netPnlUsd)} ({pct(t.pnlPercentage)})
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={`pill ${
                        t.result === "WIN"
                          ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                          : "border-accent-red/40 bg-accent-red/10 text-accent-red"
                      }`}
                    >
                      {t.result}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <Link href={`/trades/${t.id}`} className="text-[11px] text-accent-cyan hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
