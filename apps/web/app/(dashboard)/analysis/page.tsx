"use client";

import { useState } from "react";
import { AGENTS, AGENT_ICONS } from "@/lib/agents";
import { useLiveData } from "@/lib/live-data";
import {
  Activity,
  Route,
  BarChart3,
  TriangleAlert,
  Wrench,
  Search,
} from "lucide-react";

type Tab = "overview" | "traces" | "agents" | "incidents" | "corrections";

const TABS: { key: Tab; label: string; icon: typeof Activity }[] = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "traces", label: "Trace Explorer", icon: Search },
  { key: "agents", label: "Agent Performance", icon: BarChart3 },
  { key: "incidents", label: "Incident Center", icon: TriangleAlert },
  { key: "corrections", label: "Self-Correction", icon: Wrench },
];

export default function AnalysisPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const { data } = useLiveData();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
          <Activity className="h-4 w-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100">Analysis</h1>
          <p className="text-[11px] text-slate-500">
            The system&apos;s eyes — observability, tracing, anomalies, and controlled self-correction.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border border-terminal-border bg-terminal-bg2/60 p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                active ? "bg-accent-cyan/10 text-accent-cyan" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="panel p-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Agents online", value: `${Object.values(data.telemetry).filter((t) => t.status === "online").length}/${AGENTS.length}`, sub: "of the squad" },
                { label: "Open positions", value: `${data.positions.length}`, sub: "paper positions" },
                { label: "Closed trades", value: `${data.trades.length}`, sub: "all time" },
                { label: "Messages", value: `${data.messageCount}`, sub: "on the blackboard" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
                  <div className="panel-title">{s.label}</div>
                  <div className="mono-num mt-1 text-xl text-slate-100">{s.value}</div>
                  <div className="text-[10px] text-slate-600">{s.sub}</div>
                </div>
              ))}
            </div>

            {data.messages.length === 0 ? (
              <EmptyState
                title="No activity yet"
                hint="Run the daemon (python -m backend.daemon) and the squad's live activity, positions, and decisions will show up here."
              />
            ) : (
              <div className="space-y-2">
                <div className="panel-title">Latest squad activity</div>
                {data.messages.slice(0, 6).map((m) => (
                  <div key={m.id} className="flex items-start gap-2 rounded-lg border border-terminal-border bg-terminal-bg2/60 p-2">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-green" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-accent-cyan">{m.agentName}</div>
                      <p className="truncate text-xs text-slate-300">{m.messageText}</p>
                    </div>
                    <span className="mono-num shrink-0 text-[9px] text-slate-600">{m.messageType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "traces" && (
          <TraceList messages={data.messages} />
        )}

        {tab === "agents" && (
          <div className="space-y-2">
            {AGENTS.map((a) => {
              const Icon = AGENT_ICONS[a.key];
              const t = data.telemetry[a.key];
              const msgs = data.messages.filter((m) => m.agentName === a.name);
              return (
                <div key={a.key} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold" style={{ backgroundColor: `${a.hex}22`, color: a.hex }}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">{a.name}</div>
                        <div className="text-[11px] text-slate-500">{a.role}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {t ? `${t.status}` : "offline"}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-terminal-border pt-2 text-[11px]">
                    <div>
                      <div className="text-slate-500">Messages</div>
                      <div className="mono-num text-slate-200">{msgs.length}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Latency</div>
                      <div className="mono-num text-slate-200">{t?.latencyMs != null ? `${t.latencyMs}ms` : "—"}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Errors</div>
                      <div className={`mono-num ${(t?.errorCount ?? 0) > 0 ? "text-accent-red" : "text-slate-200"}`}>{t?.errorCount ?? 0}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "incidents" && (
          <IncidentList messages={data.messages} telemetry={data.telemetry} />
        )}

        {tab === "corrections" && (
          <EmptyState
            title="Self-correction is not live yet"
            hint="System 03 (observability + controlled self-correction) is the next infrastructure piece. Right now the squad monitors and manages positions but does not rewrite its own rules."
          />
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Route className="h-6 w-6 text-slate-600" />
      <p className="text-sm text-slate-500">{title}</p>
      <p className="max-w-sm text-xs text-slate-600">{hint}</p>
    </div>
  );
}

function TraceList({ messages }: { messages: any[] }) {
  // Group the blackboard by workflow_id: each workflow = one "trace".
  const workflows = new Map<string, any[]>();
  for (const m of messages) {
    if (!m.workflowId) continue;
    const arr = workflows.get(m.workflowId) || [];
    arr.push(m);
    workflows.set(m.workflowId, arr);
  }
  const traces = Array.from(workflows.entries())
    .map(([id, msgs]) => ({
      id,
      agents: Array.from(new Set(msgs.map((m: any) => m.agentName))),
      steps: msgs.length,
      decision: msgs.find((m: any) => m.messageType === "SUPERVISION" || m.messageType === "EXECUTION")?.messageText ?? "",
      time: msgs[0]?.timestamp ?? "",
    }))
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 10);

  if (traces.length === 0) {
    return <EmptyState title="No traces recorded" hint="Each full trading cycle becomes one trace here — from market scan to execution." />;
  }

  return (
    <div className="space-y-2">
      {traces.map((t) => (
        <div key={t.id} className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
          <div className="flex items-center justify-between">
            <span className="mono-num text-[10px] text-accent-cyan">{t.id}</span>
            <span className="mono-num text-[10px] text-slate-600">{new Date(t.time).toLocaleTimeString()}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Agents: {t.agents.join(" → ")}</div>
          <p className="mt-1 text-xs text-slate-300">{t.decision || `${t.steps} steps`}</p>
        </div>
      ))}
    </div>
  );
}

function IncidentList({ messages, telemetry }: { messages: any[]; telemetry: Record<string, any> }) {
  const degraded = Object.entries(telemetry)
    .filter(([, t]) => t.status === "degraded" || (t.errorCount ?? 0) > 0)
    .map(([key, t]) => ({ key, ...t }));
  const errorMessages = messages.filter((m) => m.messageText.startsWith("[error]"));

  if (degraded.length === 0 && errorMessages.length === 0) {
    return <EmptyState title="No incidents" hint="Errors and degraded agents will show here as they happen." />;
  }

  return (
    <div className="space-y-2">
      {degraded.map((d) => (
        <div key={d.key} className="flex items-center gap-2 rounded-lg border border-accent-amber/30 bg-accent-amber/5 p-3">
          <TriangleAlert className="h-4 w-4 shrink-0 text-accent-amber" />
          <div>
            <div className="text-sm font-semibold text-accent-amber">{d.key}</div>
            <div className="text-[11px] text-slate-400">{d.status} · {d.errorCount} errors</div>
          </div>
        </div>
      ))}
      {errorMessages.slice(0, 5).map((m) => (
        <div key={m.id} className="flex items-start gap-2 rounded-lg border border-accent-red/30 bg-accent-red/5 p-3">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-red" />
          <div>
            <div className="text-xs font-semibold text-accent-red">{m.agentName}</div>
            <p className="text-[11px] text-slate-300">{m.messageText}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
