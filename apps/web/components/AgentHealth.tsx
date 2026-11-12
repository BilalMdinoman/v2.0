"use client";

import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import { AgentTelemetry, BrainMessage } from "@/lib/types";
import StatusPill from "./StatusPill";
import AgentAvatar from "./AgentAvatar";
import { timeAgo } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export default function AgentHealth({
  telemetry,
  messages = [],
}: {
  telemetry?: Record<string, AgentTelemetry>;
  messages?: BrainMessage[];
}) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title">Seven-Agent Squad</h2>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">
            {telemetry ? "live telemetry" : "awaiting daemon"}
          </span>
          <Link
            href="/agents"
            className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {AGENTS.map((a) => {
          const t = telemetry?.[a.key];
          const status = t?.status ?? "offline";
          const activity = messages.find(
            (m) => m.agentName === a.name && m.messageType === "STATUS"
          );
          // Working only while this agent's STATUS is the newest message overall.
          const working =
            !!activity &&
            messages[0]?.id === activity.id &&
            messages[0]?.messageType === "STATUS";
          return (
            <Link
              key={a.key}
              href={`/agents/${a.key}`}
              className="group rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3 transition hover:border-accent-cyan/40 hover:bg-terminal-bg2"
              style={{ borderLeft: `3px solid ${a.hex}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AgentAvatar agentKey={a.key} size="sm" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{a.name}</div>
                    <div className="text-[11px] text-slate-400">{a.role}</div>
                  </div>
                </div>
                <StatusPill status={status} />
              </div>

              {working && activity ? (
                <div className="mt-2 flex items-center gap-2 text-[11px] text-accent-green">
                  <span className="truncate">{activity.messageText}</span>
                  <span className="flex shrink-0 gap-0.5">
                    <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green [animation-delay:0.15s]" />
                    <span className="h-1 w-1 animate-bounce rounded-full bg-accent-green [animation-delay:0.3s]" />
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-600">idle</div>
              )}

              <div className="mt-2 space-y-1 border-t border-terminal-border pt-2 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Latency</span>
                  <span
                    className={`mono-num ${
                      t && t.latencyMs !== null && t.latencyMs > 1000
                        ? "text-accent-amber"
                        : "text-slate-300"
                    }`}
                  >
                    {t?.latencyMs !== null && t?.latencyMs !== undefined
                      ? `${t.latencyMs}ms`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Last active</span>
                  <span className="mono-num text-slate-300">
                    {t ? timeAgo(t.lastActiveAt) : "—"}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
