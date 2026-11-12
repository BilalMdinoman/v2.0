"use client";

import ActivePositions from "@/components/ActivePositions";
import TradeHistory from "@/components/TradeHistory";
import { useLiveData } from "@/lib/live-data";
import { ArrowLeftRight } from "lucide-react";

export default function TradesPage() {
  const { data } = useLiveData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
          <ArrowLeftRight className="h-4 w-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100">Trades</h1>
          <p className="text-[11px] text-slate-500">
            Every open position and closed trade. Click any row to see the full picture.
          </p>
        </div>
      </div>

      <ActivePositions positions={data.positions} />
      <TradeHistory trades={data.trades} />
    </div>
  );
}
