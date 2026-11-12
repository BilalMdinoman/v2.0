"use client";

import Link from "next/link";
import { AGENTS } from "@/lib/agents";
import AgentAvatar from "@/components/AgentAvatar";
import StatusPill from "@/components/StatusPill";
import { useLiveData } from "@/lib/live-data";
import { timeAgo } from "@/lib/format";
import { ArrowLeft, Users } from "lucide-react";

export default function AgentsPage() {
  const { data } = useLiveData();

  return (
    <div className="space-y-4">
      <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Command Center
      </Link>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-cyan/10">
          <Users className="h-4 w-4 text-accent-cyan" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-100">Agents</h1>
          <p className="text-[11px] text-slate-500">
            The seven specialists. Click one to see its full profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => {
          const t = data.telemetry[a.key];
          const status = t?.status ?? "offline";
          return (
            <Link
              key={a.key}
              href={`/agents/${a.key}`}
              className="group panel p-4 transition hover:border-accent-cyan/40"
              style={{ borderLeft: `3px solid ${a.hex}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AgentAvatar agentKey={a.key} size="md" />
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{a.name}</div>
                    <div className="text-[11px] text-slate-400">{a.role}</div>
                  </div>
                </div>
                <StatusPill status={status} />
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{a.description}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-terminal-border pt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model</span>
                  <span className="mono-num text-slate-300">{a.modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latency</span>
                  <span className="mono-num text-slate-300">
                    {t?.latencyMs != null ? `${t.latencyMs}ms` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="mono-num text-slate-300">{status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last active</span>
                  <span className="mono-num text-slate-300">{t ? timeAgo(t.lastActiveAt) : "—"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
