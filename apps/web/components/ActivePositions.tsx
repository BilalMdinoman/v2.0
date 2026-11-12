"use client";

import Link from "next/link";
import { ActivePosition } from "@/lib/types";
import { usd, pct } from "@/lib/format";
import { Crosshair, ArrowRight } from "lucide-react";

export default function ActivePositions({
  positions = [],
}: {
  positions?: ActivePosition[];
}) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title flex items-center gap-1.5">
          <Crosshair className="h-3.5 w-3.5 text-accent-teal" /> Active Positions
        </h2>
        <Link
          href="/trades"
          className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {positions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-600">No open paper positions.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500">
              <tr className="border-b border-terminal-border">
                <th className="py-2 pr-3 font-medium">Token</th>
                <th className="py-2 pr-3 font-medium">Size</th>
                <th className="py-2 pr-3 font-medium">Entry</th>
                <th className="py-2 pr-3 font-medium">Now</th>
                <th className="py-2 pr-3 font-medium">SL</th>
                <th className="py-2 pr-3 font-medium">TP</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const change = ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100;
                return (
                  <tr key={p.id} className="border-b border-terminal-border/40 transition last:border-0 hover:bg-terminal-bg2/60">
                    <td className="py-2 pr-3">
                      <Link href={`/trades/${p.id}`} className="font-semibold text-slate-200 hover:text-accent-cyan">
                        {p.tokenSymbol}
                      </Link>
                    </td>
                    <td className="mono-num py-2 pr-3 text-slate-300">{usd(p.amountUsd)}</td>
                    <td className="mono-num py-2 pr-3 text-slate-300">{p.entryPrice}</td>
                    <td className={`mono-num py-2 pr-3 ${change >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                      {p.currentPrice} ({pct(change)})
                    </td>
                    <td className="mono-num py-2 pr-3 text-accent-red">{p.stopLossPrice}</td>
                    <td className="mono-num py-2 text-accent-green">{p.takeProfitPrice}</td>
                    <td className="py-2 text-right">
                      <Link href={`/trades/${p.id}`} className="text-[11px] text-accent-cyan hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
