"use client";

// Live data context: loads everything once, then keeps it fresh via Supabase
// Realtime. Pages read through useLiveData() and pass slices down to the
// existing prop-driven components.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabase } from "./supabaseClient";
import {
  fetchAccountState,
  fetchActivePositions,
  fetchBrainMessages,
  fetchLiveTrades,
  fetchMessageCount,
  fetchOverseerLogs,
  fetchTelemetry,
  fetchTradeHistory,
} from "./queries";
import type {
  AccountState,
  ActivePosition,
  AgentTelemetry,
  BrainMessage,
  LiveTrade,
  OverseerLog,
  TradeRecord,
} from "./types";

export interface LiveData {
  account: AccountState | null;
  positions: ActivePosition[];
  trades: TradeRecord[];
  messages: BrainMessage[];
  messageCount: number;
  telemetry: Record<string, AgentTelemetry>;
  liveTrades: LiveTrade[];
  logs: OverseerLog[];
}

const EMPTY: LiveData = {
  account: null,
  positions: [],
  trades: [],
  messages: [],
  messageCount: 0,
  telemetry: {},
  liveTrades: [],
  logs: [],
};

interface LiveContextValue {
  data: LiveData;
  connected: boolean;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

const LiveContext = createContext<LiveContextValue>({
  data: EMPTY,
  connected: false,
  lastUpdated: 0,
  refresh: async () => {},
});

export function useLiveData(): LiveContextValue {
  return useContext(LiveContext);
}

// Tables already added to the supabase_realtime publication in schema.sql.
const REALTIME_TABLES = [
  "account_state",
  "active_positions",
  "trade_history",
  "agent_blackboard",
  "agent_telemetry",
] as const;

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LiveData>(EMPTY);
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(0);

  const refresh = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) {
      setConnected(false);
      return;
    }
    const [account, positions, trades, messages, messageCount, telemetry, liveTrades, logs] =
      await Promise.all([
        fetchAccountState(),
        fetchActivePositions(),
        fetchTradeHistory(),
        fetchBrainMessages(),
        fetchMessageCount(),
        fetchTelemetry(),
        fetchLiveTrades(),
        fetchOverseerLogs(),
      ]);
    setData({ account, positions, trades, messages, messageCount, telemetry, liveTrades, logs });
    setConnected(true);
    setLastUpdated(Date.now());
  }, []);

  useEffect(() => {
    refresh();
    const sb = getSupabase();

    // Poll every 8s as a guaranteed refresh (Realtime can be flaky behind some
    // networks). This is what makes the board update without a manual reload.
    const interval = setInterval(() => {
      refresh();
    }, 8000);

    if (!sb) return () => clearInterval(interval);

    const channel = sb.channel("live-data");
    for (const table of REALTIME_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          refresh();
        }
      );
    }
    channel.subscribe();

    return () => {
      clearInterval(interval);
      sb.removeChannel(channel);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ data, connected, lastUpdated, refresh }),
    [data, connected, lastUpdated, refresh]
  );

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}
