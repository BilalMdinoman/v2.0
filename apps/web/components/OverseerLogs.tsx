"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { OverseerLog } from "@/lib/types";
import { timeAgo } from "@/lib/format";

const LEVEL_DOT: Record<OverseerLog["level"], string> = {
  info: "bg-accent-blue",
  warn: "bg-accent-amber",
  error: "bg-accent-red",
};

const LEVEL_TEXT: Record<OverseerLog["level"], string> = {
  info: "text-accent-green",
  warn: "text-accent-amber",
  error: "text-accent-red",
};

export default function OverseerLogs({ logs = [] }: { logs?: OverseerLog[] }) {
  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="panel-title flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 text-accent-amber" /> Overseer Logs
        </h2>
        <Link
          href="/logs"
          className="flex items-center gap-1 text-[11px] font-medium text-accent-cyan hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-slate-500" />
            <div>
              <p className="text-xs text-slate-300">
                Overseer is offline. It will report agent health, API latency, and
                recovery events once the daemon starts.
              </p>
              <p className="mt-1 text-[10px] text-slate-600">No failures to report.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className="flex items-start gap-2 rounded-lg border border-terminal-border bg-terminal-bg2/60 p-3"
            >
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${LEVEL_DOT[l.level]}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-xs ${LEVEL_TEXT[l.level]}`}>{l.text}</p>
                <p className="mt-0.5 text-[10px] text-slate-600">
                  {timeAgo(l.time)}
                </p>
              </div>
              <span className="mono-num shrink-0 text-[9px] uppercase text-slate-600">
                {l.level}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
