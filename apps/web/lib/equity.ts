// Build an equity curve from closed trades (cumulative realized PnL on top of
// the $100 starting balance). Every timeframe shows the same cumulative curve
// for now — a proper time-bucketed series is a later refinement.

import type { TradeRecord, EquityPoint, EquitySeriesKey } from "./types";

const KEYS: EquitySeriesKey[] = ["1D", "1W", "1M", "3M", "ALL"];

export function buildEquitySeries(trades: TradeRecord[]): Record<EquitySeriesKey, EquityPoint[]> {
  const sorted = [...trades].sort((a, b) => a.closedAt.localeCompare(b.closedAt));
  const points: EquityPoint[] = [{ label: "start", value: 100 }];
  let equity = 100;
  for (const t of sorted) {
    equity += t.netPnlUsd;
    points.push({ label: t.tokenSymbol, value: Math.round(equity * 100) / 100 });
  }
  const series = {} as Record<EquitySeriesKey, EquityPoint[]>;
  for (const k of KEYS) series[k] = points;
  return series;
}
