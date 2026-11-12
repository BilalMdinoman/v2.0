"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLiveData } from "@/lib/live-data";
import { usd, pct, shortAddr } from "@/lib/format";
import { fetchTokenInfo, fetchWorkflowMessages, type TokenInfo } from "@/lib/queries";
import type { BrainMessage } from "@/lib/types";
import CopyButton from "@/components/CopyButton";
import { ArrowLeft, MessageSquareText } from "lucide-react";

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const { data } = useLiveData();

  const trade = data.trades.find((t) => t.id === params.id);
  const position = data.positions.find((p) => p.id === params.id);

  const symbol = trade?.tokenSymbol ?? position?.tokenSymbol ?? "";
  const mint = trade?.mintAddress ?? position?.mintAddress ?? "";

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  useEffect(() => {
    if (mint) fetchTokenInfo(mint).then(setTokenInfo);
  }, [mint]);

  const workflowId = position?.workflowId ?? trade?.workflowId ?? "";
  const [decisionMessages, setDecisionMessages] = useState<BrainMessage[]>([]);
  useEffect(() => {
    if (workflowId) fetchWorkflowMessages(workflowId).then(setDecisionMessages);
    else setDecisionMessages([]);
  }, [workflowId]);

  if (!trade && !position) {
    return (
      <div className="space-y-4">
        <Link href="/trades" className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to trades
        </Link>
        <div className="panel p-8 text-center">
          <p className="text-sm text-slate-400">Trade not found.</p>
          <Link href="/trades" className="mt-2 inline-block text-xs text-accent-cyan hover:underline">
            Back to trades
          </Link>
        </div>
      </div>
    );
  }

  // Real chart (TradingView) for the token.
  const tvSymbol = `BINANCE:${symbol.toUpperCase()}USDT`;

  return (
    <div className="space-y-4">
      <Link href="/trades" className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to trades
      </Link>

      {/* token banner */}
      <div className="panel relative overflow-hidden bg-gradient-to-r from-accent-cyan/15 via-terminal-bg2 to-accent-teal/10 p-5">
        <div className="flex items-center gap-4">
          {tokenInfo?.imageUrl && (
            <img
              src={tokenInfo.imageUrl}
              alt={symbol}
              className="h-14 w-14 rounded-full border border-terminal-border bg-terminal-bg2 object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold text-slate-100">{symbol}</h1>
              {tokenInfo?.name && <span className="text-xs text-slate-400">{tokenInfo.name}</span>}
            </div>
            {tokenInfo && (
              <div className="mt-1 flex items-center gap-3">
                <span className="mono-num text-xl font-semibold text-slate-100">
                  ${tokenInfo.priceUsd.toFixed(8)}
                </span>
                <span className={`mono-num text-sm ${tokenInfo.change24h >= 0 ? "text-accent-green" : "text-accent-red"}`}>
                  {pct(tokenInfo.change24h)}
                </span>
              </div>
            )}
            <div className="mono-num mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="break-all">{mint}</span>
              <CopyButton text={mint} />
            </div>
          </div>
        </div>
      </div>

      {/* real chart */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="panel-title">{symbol} Chart</h2>
          <span className="text-[10px] text-slate-600">Real data by TradingView</span>
        </div>
        <iframe
          src={`https://s.tradingview.com/widgetembed/?symbol=${tvSymbol}&interval=60&theme=dark&style=1&locale=en&timezone=Etc%2FUTC`}
          title={`${symbol} chart`}
          className="w-full overflow-hidden rounded-lg"
          style={{ height: 380, border: "none", background: "#0a1a2e" }}
          allowFullScreen
        />
      </div>

      {/* live token details */}
      {tokenInfo && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Liquidity" value={`$${tokenInfo.liquidityUsd.toLocaleString()}`} />
          <Fact label="24h volume" value={`$${tokenInfo.volume24h.toLocaleString()}`} />
          <Fact label="Market cap (FDV)" value={`$${tokenInfo.fdv.toLocaleString()}`} />
          <Fact label="24h change" value={pct(tokenInfo.change24h)} accent={tokenInfo.change24h >= 0 ? "text-accent-green" : "text-accent-red"} />
        </div>
      )}

      {/* trade facts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trade ? (
          <>
            <Fact label="Entry price" value={String(trade.entryPrice)} mono />
            <Fact label="Exit price" value={String(trade.exitPrice)} mono />
            <Fact label="Net PnL" value={`${usd(trade.netPnlUsd)} (${pct(trade.pnlPercentage)})`} accent={trade.netPnlUsd >= 0 ? "text-accent-green" : "text-accent-red"} />
            <Fact label="Closed" value={new Date(trade.closedAt).toLocaleString()} />
          </>
        ) : (
          (() => {
            const p = position!;
            const unrealized = (p.currentPrice - p.entryPrice) * p.tokenQuantity;
            return (
              <>
                <Fact label="Entry price" value={String(p.entryPrice)} mono />
                <Fact label="Current price" value={String(p.currentPrice)} mono />
                <Fact label="Unrealized PnL" value={`${usd(unrealized)} (${pct(((p.currentPrice - p.entryPrice) / p.entryPrice) * 100)})`} accent={unrealized >= 0 ? "text-accent-green" : "text-accent-red"} />
                <Fact label="Position size" value={usd(p.amountUsd)} />
                <Fact label="Tokens held" value={p.tokenQuantity.toString()} mono />
                <Fact label="Stop-loss" value={String(p.stopLossPrice)} mono accent="text-accent-red" />
                <Fact label="Take-profit" value={String(p.takeProfitPrice)} mono accent="text-accent-green" />
                <Fact label="Opened" value={new Date(p.openedAt).toLocaleString()} />
              </>
            );
          })()
        )}
      </div>

      {/* why the agents decided */}
      {decisionMessages.length > 0 && (
        <div className="panel p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <MessageSquareText className="h-3.5 w-3.5 text-accent-cyan" />
            <h2 className="panel-title">Why the squad made this trade</h2>
          </div>
          <div className="space-y-2">
            {decisionMessages.map((m) => (
              <div key={m.id} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-accent-cyan">{m.agentName}</span>
                  <span className="mono-num text-[9px] text-slate-500">{m.messageType}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-300">{m.messageText}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {trade?.rationale && (
        <div className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
          <div className="panel-title">Rationale</div>
          <p className="mt-1 text-xs text-slate-300">{trade.rationale}</p>
        </div>
      )}

      <p className="text-[11px] text-slate-600">
        Short address: {shortAddr(mint || "")}. Paper trading only — no real funds.
      </p>
    </div>
  );
}

function Fact({ label, value, accent = "text-slate-200", mono = false }: { label: string; value: string; accent?: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
      <div className="panel-title">{label}</div>
      <div className={`mt-1 text-sm ${mono ? "mono-num" : ""} ${accent}`}>{value}</div>
    </div>
  );
}
