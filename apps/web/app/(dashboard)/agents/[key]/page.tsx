"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AGENT_BY_KEY, GATEWAY } from "@/lib/agents";
import AgentAvatar from "@/components/AgentAvatar";
import { useLiveData } from "@/lib/live-data";
import { timeAgo } from "@/lib/format";
import { ArrowLeft, MessageSquareText } from "lucide-react";

export default function AgentDetailPage() {
  const params = useParams<{ key: string }>();
  const agent = AGENT_BY_KEY[params.key];
  const { data } = useLiveData();

  if (!agent) {
    return (
      <div className="panel p-8 text-center">
        <p className="text-sm text-slate-400">Agent not found.</p>
        <Link href="/" className="mt-2 inline-block text-xs text-accent-cyan hover:underline">
          Back to Command Center
        </Link>
      </div>
    );
  }

  const t = data.telemetry[agent.key];
  const messages = data.messages.filter((m) => m.agentName === agent.name).slice(0, 10);

  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Command Center
      </Link>

      {/* header */}
      <div className="panel p-5">
        <div className="flex items-start gap-4">
          <AgentAvatar agentKey={agent.key} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-100">{agent.name}</h1>
            <p className="text-sm text-slate-400">{agent.role}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{agent.description}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Model" value={agent.modelName} />
          <Fact label="Model ID" value={agent.modelId} mono />
          <Fact label="Provider" value={agent.providerLabel} />
          <Fact label="Gateway" value={GATEWAY} />
          <Fact label="Status" value={(t?.status ?? "offline").toUpperCase()} accent="text-slate-400" />
          <Fact label="Latency" value={t?.latencyMs != null ? `${t.latencyMs}ms` : "—"} mono />
          <Fact label="Last active" value={t ? timeAgo(t.lastActiveAt) : "—"} />
          <Fact label="Errors" value={t ? String(t.errorCount) : "—"} mono />
        </div>
      </div>

      {/* recent messages */}
      <div className="panel p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <MessageSquareText className="h-3.5 w-3.5 text-accent-cyan" />
          <h2 className="panel-title">Recent messages</h2>
        </div>
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-600">
            No messages yet. Agent reports appear once the daemon runs.
          </p>
        ) : (
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="mono-num text-[10px] text-slate-500">{m.messageType}</span>
                  <span className="mono-num text-[10px] text-slate-600">
                    {new Date(m.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{m.messageText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
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
