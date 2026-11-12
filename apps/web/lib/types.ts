// Shared domain types used across the dashboard.
// These mirror the backend/Supabase schema so the UI stays honest to real data.

export type AgentStatus = "online" | "degraded" | "offline";

export interface AgentTelemetry {
  key: string;
  status: AgentStatus;
  latencyMs: number | null;
  errorCount: number;
  lastActiveAt: string | null;
  modelId: string;
}

export interface AccountState {
  startingBalance: number;
  availableCash: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  dailyTrades: number;
  dailyTradeCap: number;
  paused: boolean;
  lastUpdatedAt: string | null;
}

export interface ActivePosition {
  id: string;
  workflowId: string;
  tokenSymbol: string;
  mintAddress: string;
  entryPrice: number;
  currentPrice: number;
  amountUsd: number;
  tokenQuantity: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  openedAt: string;
}

export interface TradeRecord {
  id: string;
  workflowId: string;
  tokenSymbol: string;
  mintAddress: string;
  entryPrice: number;
  exitPrice: number;
  netPnlUsd: number;
  pnlPercentage: number;
  result: "WIN" | "LOSS";
  rationale: string;
  closedAt: string;
}

export interface BrainMessage {
  id: string;
  workflowId: string;
  agentName: string;
  messageType: string;
  messageText: string;
  timestamp: string;
}

export interface OverseerLog {
  id: string;
  level: "info" | "warn" | "error";
  text: string;
  time: string;
}

export interface LiveTrade {
  id: string;
  token: string;
  side: "BUY" | "SELL";
  amountUsd: number;
  price: number;
  time: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

export type EquitySeriesKey = "1D" | "1W" | "1M" | "3M" | "ALL";

export interface EquityPoint {
  label: string;
  value: number;
}
