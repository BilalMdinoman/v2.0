"use client";

import HeaderStatus from "@/components/HeaderStatus";
import AgentHealth from "@/components/AgentHealth";
import BrainStream from "@/components/BrainStream";
import ActivePositions from "@/components/ActivePositions";
import TradeHistory from "@/components/TradeHistory";
import OverseerLogs from "@/components/OverseerLogs";
import LiveTrades from "@/components/LiveTrades";
import TradingViewChart from "@/components/TradingViewChart";
import TradePerformance from "@/components/TradePerformance";
import { useLiveData } from "@/lib/live-data";
import { buildEquitySeries } from "@/lib/equity";

export default function CommandCenter() {
  const { data, connected } = useLiveData();

  return (
    <>
      <HeaderStatus
        account={data.account}
        connected={connected}
        activePositions={data.positions.length}
      />
      <TradingViewChart />
      <TradePerformance trades={data.trades} equitySeries={buildEquitySeries(data.trades)} />
      <AgentHealth telemetry={data.telemetry} messages={data.messages} />
      <LiveTrades trades={data.liveTrades} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BrainStream messages={data.messages} />
        <OverseerLogs logs={data.logs} />
      </div>
      <ActivePositions positions={data.positions} />
      <TradeHistory trades={data.trades} />
    </>
  );
}
