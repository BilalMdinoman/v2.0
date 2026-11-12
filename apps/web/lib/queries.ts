// Read-only Supabase queries for the dashboard.
//
// Each function maps snake_case DB rows into the camelCase shapes defined in
// lib/types.ts. All reads use the anon key (see lib/supabaseClient.ts), so they
// go through the anon SELECT RLS policies and return []/null when not allowed.
//
// Supabase numerics can come back as strings or numbers; `num()` normalizes.

import { getSupabase } from "./supabaseClient";
import { AGENT_BY_KEY } from "./agents";
import type {
  AccountState,
  ActivePosition,
  AgentTelemetry,
  BrainMessage,
  LiveTrade,
  OverseerLog,
  TradeRecord,
} from "./types";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return v == null ? "" : String(v);
}

function agentName(key: string): string {
  return AGENT_BY_KEY[key]?.name ?? key;
}

export async function fetchAccountState(): Promise<AccountState | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("account_state").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return {
    startingBalance: num(data.starting_balance_usd),
    availableCash: num(data.available_cash_usd),
    equity: num(data.equity_usd),
    realizedPnl: num(data.realized_pnl_usd),
    unrealizedPnl: num(data.unrealized_pnl_usd),
    dailyTrades: num(data.daily_trades),
    dailyTradeCap: num(data.daily_trade_cap),
    paused: !!data.paused,
    lastUpdatedAt: data.updated_at ? str(data.updated_at) : null,
  };
}

export async function fetchActivePositions(): Promise<ActivePosition[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("active_positions")
    .select("*")
    .eq("status", "OPEN")
    .order("opened_at", { ascending: false });
  if (error || !data) return [];
  return data.map((p: any) => ({
    id: str(p.id),
    workflowId: str(p.workflow_id),
    tokenSymbol: str(p.token_symbol),
    mintAddress: str(p.mint_address),
    entryPrice: num(p.entry_price),
    currentPrice: p.current_price == null ? num(p.entry_price) : num(p.current_price),
    amountUsd: num(p.amount_usd),
    tokenQuantity: num(p.token_quantity),
    stopLossPrice: num(p.stop_loss_price),
    takeProfitPrice: num(p.take_profit_price),
    openedAt: str(p.opened_at),
  }));
}

export async function fetchTradeHistory(): Promise<TradeRecord[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("trade_history")
    .select("*")
    .order("closed_at", { ascending: false });
  if (error || !data) return [];
  return data.map((t: any) => ({
    id: str(t.id),
    workflowId: str(t.workflow_id),
    tokenSymbol: str(t.token_symbol),
    mintAddress: str(t.mint_address),
    entryPrice: num(t.entry_price),
    exitPrice: num(t.exit_price),
    netPnlUsd: num(t.net_pnl_usd),
    pnlPercentage: num(t.pnl_pct),
    result: t.result === "WIN" ? "WIN" : "LOSS",
    rationale: str(t.rationale),
    closedAt: str(t.closed_at),
  }));
}

export async function fetchBrainMessages(): Promise<BrainMessage[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("agent_blackboard")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return data.map((m: any) => ({
    id: str(m.id),
    workflowId: str(m.workflow_id),
    agentName: agentName(str(m.agent_key)),
    messageType: str(m.message_type),
    messageText: str(m.text),
    timestamp: str(m.created_at),
  }));
}

export async function fetchMessageCount(): Promise<number> {
  const sb = getSupabase();
  if (!sb) return 0;
  const { count, error } = await sb
    .from("agent_blackboard")
    .select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}

// Fetch the full decision trail for one workflow (used by the trade detail page
// so it shows the agents' reasoning even when the messages are no longer in the
// latest-50 cache).
export async function fetchWorkflowMessages(workflowId: string): Promise<BrainMessage[]> {
  const sb = getSupabase();
  if (!sb || !workflowId) return [];
  const { data, error } = await sb
    .from("agent_blackboard")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map((m: any) => ({
    id: str(m.id),
    workflowId: str(m.workflow_id),
    agentName: agentName(str(m.agent_key)),
    messageType: str(m.message_type),
    messageText: str(m.text),
    timestamp: str(m.created_at),
  }));
}

export interface TokenInfo {
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  liquidityUsd: number;
  volume24h: number;
  fdv: number;
  imageUrl: string;
}

// Live token data straight from DexScreener (public, CORS-enabled). Used to
// enrich the trade detail page with real market numbers.
export async function fetchTokenInfo(mint: string): Promise<TokenInfo | null> {
  if (!mint) return null;
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`);
    if (!res.ok) return null;
    const json = await res.json();
    const pairs: any[] = json?.pairs ?? [];
    if (pairs.length === 0) return null;
    const p = pairs[0];
    return {
      symbol: p.baseToken?.symbol ?? "",
      name: p.baseToken?.name ?? "",
      priceUsd: parseFloat(p.priceUsd ?? "0"),
      change24h: parseFloat(p.priceChange?.h24 ?? "0"),
      liquidityUsd: parseFloat(p.liquidity?.usd ?? "0"),
      volume24h: parseFloat(p.volume?.h24 ?? "0"),
      fdv: parseFloat(p.fdv ?? "0"),
      imageUrl: p.info?.imageUrl ?? "",
    };
  } catch {
    return null;
  }
}

export async function fetchTelemetry(): Promise<Record<string, AgentTelemetry>> {
  const sb = getSupabase();
  if (!sb) return {};
  const { data, error } = await sb.from("agent_telemetry").select("*");
  if (error || !data) return {};
  const out: Record<string, AgentTelemetry> = {};
  for (const t of data as any[]) {
    const key = str(t.agent_key);
    const status = str(t.status).toLowerCase();
    out[key] = {
      key,
      status: status === "degraded" ? "degraded" : status === "online" ? "online" : "offline",
      latencyMs: t.latency_ms == null ? null : num(t.latency_ms),
      errorCount: num(t.error_count),
      lastActiveAt: t.last_active_at ? str(t.last_active_at) : null,
      modelId: str(t.model_id),
    };
  }
  return out;
}

export async function fetchLiveTrades(): Promise<LiveTrade[]> {
  // The only executions today are paper BUY entries, which are the open
  // positions. Deriving from active_positions keeps the feed symbol-labelled
  // and avoids needing extra RLS on paper_orders.
  const positions = await fetchActivePositions();
  return positions.map((p) => ({
    id: p.id,
    token: p.tokenSymbol,
    side: "BUY" as const,
    amountUsd: p.amountUsd,
    price: p.entryPrice,
    time: p.openedAt,
  }));
}

export async function fetchOverseerLogs(): Promise<OverseerLog[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("agent_blackboard")
    .select("*")
    .in("message_type", ["SUPERVISION", "RISK", "EXECUTION"])
    .order("created_at", { ascending: false })
    .limit(30);
  if (error || !data) return [];
  return data.map((m: any) => {
    const type = str(m.message_type);
    const level: OverseerLog["level"] =
      type === "RISK" ? "warn" : type === "EXECUTION" ? "info" : "info";
    return {
      id: str(m.id),
      level,
      text: `${agentName(str(m.agent_key))}: ${str(m.text)}`,
      time: str(m.created_at),
    };
  });
}
